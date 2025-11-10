import type { Page } from "@playwright/test";
import type { TestUser } from "./testUsers";
import type { DelayTransaction } from "../../src/client/types.gen";

/**
 * Delay transaction status enum derived from API types
 * Using satisfies to ensure compile-time validation against DelayTransaction["status"]
 */
export const DelayTransactionStatus = {
  /** Transaction is being queued */
  QUEUING: "QUEUING" as const,
  /** Transaction is waiting for execution */
  WAITING: "WAITING" as const,
  /** Transaction is currently executing */
  EXECUTING: "EXECUTING" as const,
  /** Transaction has been executed successfully */
  EXECUTED: "EXECUTED" as const,
  /** Transaction execution failed */
  FAILED: "FAILED" as const,
} satisfies Record<string, NonNullable<DelayTransaction["status"]>>;

/**
 * Type alias for delay transaction status - derived from API type
 */
export type DelayTransactionStatusType = DelayTransaction["status"];

/**
 * Delay transaction operation type enum derived from API types
 * Using satisfies to ensure compile-time validation against DelayTransaction["operationType"]
 */
export const DelayOperationType = {
  /** Standard call operation */
  CALL: "CALL" as const,
  /** Delegate call operation */
  DELEGATECALL: "DELEGATECALL" as const,
} satisfies Record<string, NonNullable<DelayTransaction["operationType"]>>;

/**
 * Type alias for delay operation type - derived from API type
 */
export type DelayOperationTypeType = DelayTransaction["operationType"];

/**
 * Delay transaction data structure - uses DelayTransaction from API types
 * This ensures compile-time validation against API changes
 */
export type DelayTransactionData = DelayTransaction;

/**
 * Configuration for mocking DelayRelay responses
 */
export interface DelayRelayMockData extends Array<DelayTransaction> {}

/**
 * Sets up a mock for the `/api/v1/delay-relay` endpoint in Playwright tests.
 *
 * This function intercepts GET requests to the delay relay endpoint and returns
 * the specified delay transactions data.
 *
 * @param page - The Playwright page instance
 * @param testUser - The test user whose delay transactions to mock
 * @param delayRelayOverrides - Optional overrides for the delay transactions data
 *
 * @example
 * ```typescript
 * import { mockDelayRelay } from "./utils/mockDelayRelay";
 * import { TEST_USER_APPROVED } from "./utils/testUsers";
 *
 * test("delay relay display", async ({ page }) => {
 *   // Set up the delay relay mock with default values
 *   await mockDelayRelay(page, TEST_USER_APPROVED);
 *
 *   // Or with custom overrides
 *   await mockDelayRelay(page, TEST_USER_APPROVED, [
 *     {
 *       id: "delay-tx-1",
 *       safeAddress: "0x123...",
 *       status: DelayTransactionStatus.WAITING,
 *       operationType: DelayOperationType.CALL
 *     }
 *   ]);
 *
 *   // Your test code here...
 * });
 * ```
 */
export async function mockDelayRelay({
  page,
  testUser,
  delayRelayOverrides,
}: {
  page: Page;
  testUser: TestUser;
  delayRelayOverrides?: DelayRelayMockData;
}): Promise<void> {
  await page.route("**/api/v1/delay-relay", async (route) => {
    const request = route.request();

    if (request.method() === "GET") {
      try {
        // Create default delay transactions based on test user
        const defaultDelayTransactions: DelayRelayMockData = [];

        // Apply any overrides
        const finalDelayTransactions: DelayRelayMockData =
          delayRelayOverrides || testUser.delayRelay || defaultDelayTransactions;

        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(finalDelayTransactions),
        });
      } catch {
        // Return error response for invalid requests
        await route.fulfill({
          status: 500,
          contentType: "application/json",
          body: JSON.stringify({ error: "Internal server error" }),
        });
      }
    } else {
      await route.continue();
    }
  });
}

/**
 * Helper function to create a delay transaction with consistent data
 */
export function createDelayTransaction(config: {
  id?: string;
  safeAddress?: string;
  userId?: string;
  status?: DelayTransactionStatusType;
  operationType?: DelayOperationTypeType;
  transactionData?: string;
  readyAt?: string | null;
  enqueueTaskId?: string;
  dispatchTaskId?: string | null;
  createdAt?: string;
}): DelayTransaction {
  const now = new Date().toISOString();
  const readyAt =
    config.readyAt !== undefined ? config.readyAt : new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

  return {
    id: config.id,
    safeAddress: config.safeAddress,
    userId: config.userId,
    status: config.status || DelayTransactionStatus.WAITING,
    operationType: config.operationType || DelayOperationType.CALL,
    transactionData: config.transactionData || "0x",
    readyAt,
    enqueueTaskId: config.enqueueTaskId || (config.id ? `enqueue-${config.id}` : undefined),
    dispatchTaskId: config.dispatchTaskId !== undefined ? config.dispatchTaskId : null,
    createdAt: config.createdAt || now,
  };
}
