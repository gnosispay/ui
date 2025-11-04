import type { Page } from "@playwright/test";
import type { TestUser } from "./testUsers";

/**
 * Delay transaction status enum
 */
export enum DelayTransactionStatus {
  /** Transaction is being queued */
  QUEUING = "QUEUING",
  /** Transaction is waiting for execution */
  WAITING = "WAITING",
  /** Transaction is currently executing */
  EXECUTING = "EXECUTING",
  /** Transaction has been executed successfully */
  EXECUTED = "EXECUTED",
  /** Transaction execution failed */
  FAILED = "FAILED",
}

/**
 * Delay transaction operation type enum
 */
export enum DelayOperationType {
  /** Standard call operation */
  CALL = "CALL",
  /** Delegate call operation */
  DELEGATECALL = "DELEGATECALL",
}

/**
 * Delay transaction data structure matching the API response
 */
export interface DelayTransactionData {
  /** Unique identifier for the delayed transaction */
  id?: string;
  /** The Safe contract address associated with the transaction */
  safeAddress?: string;
  /** Data payload of the transaction */
  transactionData?: string;
  /** Identifier of the task that enqueued this transaction */
  enqueueTaskId?: string;
  /** Identifier of the task responsible for dispatching this transaction */
  dispatchTaskId?: string | null;
  /** Timestamp indicating when the transaction is ready for processing */
  readyAt?: string | null;
  /** Type of operation being performed */
  operationType?: DelayOperationType;
  /** Identifier of the user associated with the transaction */
  userId?: string;
  /** Current status of the transaction */
  status?: DelayTransactionStatus;
  /** Timestamp of when the transaction was created */
  createdAt?: string;
}

/**
 * Configuration for mocking DelayRelay responses
 */
export interface DelayRelayMockData extends Array<DelayTransactionData> {}

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
export async function mockDelayRelay(
  page: Page,
  testUser: TestUser,
  delayRelayOverrides?: DelayRelayMockData,
): Promise<void> {
  await page.route("**/api/v1/delay-relay", async (route) => {
    const request = route.request();

    if (request.method() === "GET") {
      try {
        // Create default delay transactions based on test user
        const defaultDelayTransactions: DelayRelayMockData = [];

        // Apply any overrides
        const finalDelayTransactions: DelayRelayMockData = delayRelayOverrides || testUser.delayRelay || defaultDelayTransactions;

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
  id: string;
  safeAddress: string;
  userId: string;
  status?: DelayTransactionStatus;
  operationType?: DelayOperationType;
  transactionData?: string;
  readyAt?: string | null;
  enqueueTaskId?: string;
  dispatchTaskId?: string | null;
  createdAt?: string;
}): DelayTransactionData {
  const now = new Date().toISOString();
  const readyAt = config.readyAt !== undefined ? config.readyAt : new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

  return {
    id: config.id,
    safeAddress: config.safeAddress,
    userId: config.userId,
    status: config.status || DelayTransactionStatus.WAITING,
    operationType: config.operationType || DelayOperationType.CALL,
    transactionData: config.transactionData || "0x",
    readyAt,
    enqueueTaskId: config.enqueueTaskId || `enqueue-${config.id}`,
    dispatchTaskId: config.dispatchTaskId || null,
    createdAt: config.createdAt || now,
  };
}

/**
 * Predefined delay relay scenarios for common test cases
 */
export const DELAY_RELAY_SCENARIOS = {
  /** No delayed transactions */
  EMPTY: [],

  /** Single waiting transaction */
  SINGLE_WAITING: [
    createDelayTransaction({
      id: "delay-tx-waiting-1",
      safeAddress: "0x1234567890123456789012345678901234567890",
      userId: "test-user-1",
      status: DelayTransactionStatus.WAITING,
      operationType: DelayOperationType.CALL,
    }),
  ],

  /** Single executing transaction */
  SINGLE_EXECUTING: [
    createDelayTransaction({
      id: "delay-tx-executing-1",
      safeAddress: "0x1234567890123456789012345678901234567890",
      userId: "test-user-1",
      status: DelayTransactionStatus.EXECUTING,
      operationType: DelayOperationType.CALL,
    }),
  ],

  /** Multiple transactions with different statuses */
  MIXED_STATUS: [
    createDelayTransaction({
      id: "delay-tx-waiting-1",
      safeAddress: "0x1234567890123456789012345678901234567890",
      userId: "test-user-1",
      status: DelayTransactionStatus.WAITING,
      operationType: DelayOperationType.CALL,
    }),
    createDelayTransaction({
      id: "delay-tx-executing-1",
      safeAddress: "0x1234567890123456789012345678901234567890",
      userId: "test-user-1",
      status: DelayTransactionStatus.EXECUTING,
      operationType: DelayOperationType.DELEGATECALL,
    }),
    createDelayTransaction({
      id: "delay-tx-queuing-1",
      safeAddress: "0x1234567890123456789012345678901234567890",
      userId: "test-user-1",
      status: DelayTransactionStatus.QUEUING,
      operationType: DelayOperationType.CALL,
    }),
  ],

  /** Transaction ready for execution */
  READY_FOR_EXECUTION: [
    createDelayTransaction({
      id: "delay-tx-ready-1",
      safeAddress: "0x1234567890123456789012345678901234567890",
      userId: "test-user-1",
      status: DelayTransactionStatus.WAITING,
      operationType: DelayOperationType.CALL,
      readyAt: new Date(Date.now() - 60 * 1000).toISOString(), // Ready 1 minute ago
    }),
  ],

  /** Transaction not yet ready */
  NOT_YET_READY: [
    createDelayTransaction({
      id: "delay-tx-future-1",
      safeAddress: "0x1234567890123456789012345678901234567890",
      userId: "test-user-1",
      status: DelayTransactionStatus.WAITING,
      operationType: DelayOperationType.CALL,
      readyAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Ready in 24 hours
    }),
  ],

  /** Multiple transactions in queue */
  QUEUE_BACKLOG: [
    createDelayTransaction({
      id: "delay-tx-1",
      safeAddress: "0x1234567890123456789012345678901234567890",
      userId: "test-user-1",
      status: DelayTransactionStatus.WAITING,
      operationType: DelayOperationType.CALL,
      readyAt: new Date(Date.now() - 60 * 1000).toISOString(),
    }),
    createDelayTransaction({
      id: "delay-tx-2",
      safeAddress: "0x1234567890123456789012345678901234567890",
      userId: "test-user-1",
      status: DelayTransactionStatus.WAITING,
      operationType: DelayOperationType.CALL,
      readyAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
    }),
    createDelayTransaction({
      id: "delay-tx-3",
      safeAddress: "0x1234567890123456789012345678901234567890",
      userId: "test-user-1",
      status: DelayTransactionStatus.QUEUING,
      operationType: DelayOperationType.DELEGATECALL,
      readyAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    }),
  ],

  /** Transactions with dispatch tasks */
  WITH_DISPATCH_TASKS: [
    createDelayTransaction({
      id: "delay-tx-dispatched-1",
      safeAddress: "0x1234567890123456789012345678901234567890",
      userId: "test-user-1",
      status: DelayTransactionStatus.EXECUTING,
      operationType: DelayOperationType.CALL,
      dispatchTaskId: "dispatch-task-123",
    }),
  ],
};

/**
 * Helper function to mock delay relay with a predefined scenario
 */
export async function mockDelayRelayScenario(
  page: Page,
  testUser: TestUser,
  scenario: keyof typeof DELAY_RELAY_SCENARIOS,
): Promise<void> {
  await mockDelayRelay(page, testUser, DELAY_RELAY_SCENARIOS[scenario]);
}

/**
 * Helper function to filter transactions by status
 */
export function filterTransactionsByStatus(
  transactions: DelayRelayMockData,
  status: DelayTransactionStatus,
): DelayRelayMockData {
  return transactions.filter((tx) => tx.status === status);
}

/**
 * Helper function to filter transactions by operation type
 */
export function filterTransactionsByOperationType(
  transactions: DelayRelayMockData,
  operationType: DelayOperationType,
): DelayRelayMockData {
  return transactions.filter((tx) => tx.operationType === operationType);
}

/**
 * Helper function to get transactions ready for execution
 */
export function getReadyTransactions(transactions: DelayRelayMockData): DelayRelayMockData {
  const now = new Date();
  return transactions.filter((tx) => {
    if (!tx.readyAt) return false;
    return new Date(tx.readyAt) <= now;
  });
}

/**
 * Helper function to generate a transaction ID
 */
export function generateTransactionId(prefix: string = "delay-tx"): string {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Helper function to generate an enqueue task ID
 */
export function generateEnqueueTaskId(prefix: string = "enqueue"): string {
  return `${prefix}-${Math.random().toString(36).substr(2, 12)}`;
}
