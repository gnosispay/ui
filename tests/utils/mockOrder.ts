import type { Page } from "@playwright/test";
import type { TestUser } from "./testUsers";
import type { CardOrder } from "../../src/client/types.gen";

/**
 * Card order status enum derived from API types
 * Using satisfies to ensure compile-time validation against CardOrder["status"]
 */
export const OrderStatus = {
  /** Payment transaction is pending */
  PENDING_TRANSACTION: "PENDINGTRANSACTION" as const,
  /** Payment transaction is complete */
  TRANSACTION_COMPLETE: "TRANSACTIONCOMPLETE" as const,
  /** Order requires user confirmation */
  CONFIRMATION_REQUIRED: "CONFIRMATIONREQUIRED" as const,
  /** Order is ready for processing */
  READY: "READY" as const,
  /** Physical card has been created */
  CARD_CREATED: "CARDCREATED" as const,
  /** Payment transaction failed */
  FAILED_TRANSACTION: "FAILEDTRANSACTION" as const,
  /** Order was cancelled */
  CANCELLED: "CANCELLED" as const,
} satisfies Record<string, CardOrder["status"]>;

/**
 * Type alias for order status - derived from API type
 */
export type OrderStatusType = CardOrder["status"];

/**
 * Personalization source enum derived from API types
 * Using satisfies to ensure compile-time validation against CardOrder["personalizationSource"]
 */
export const PersonalizationSource = {
  /** Use KYC data for personalization */
  KYC: "KYC" as const,
  /** Use ENS data for personalization */
  ENS: "ENS" as const,
} satisfies Record<string, CardOrder["personalizationSource"]>;

/**
 * Type alias for personalization source - derived from API type
 */
export type PersonalizationSourceType = CardOrder["personalizationSource"];

/**
 * Card order data structure - uses CardOrder from API types
 * This ensures compile-time validation against API changes
 */
export type OrderData = CardOrder;

/**
 * Configuration for mocking Order responses
 */
export interface OrderMockData extends Array<CardOrder> {}

/**
 * Sets up a mock for the `/api/v1/order/` endpoint in Playwright tests.
 *
 * This function intercepts GET requests to the order endpoint and returns
 * the specified order data.
 *
 * @param page - The Playwright page instance
 * @param testUser - The test user whose orders to mock
 * @param orderOverrides - Optional overrides for the orders data
 *
 * @example
 * ```typescript
 * import { mockOrder } from "./utils/mockOrder";
 * import { TEST_USER_APPROVED } from "./utils/testUsers";
 *
 * test("order display", async ({ page }) => {
 *   // Set up the order mock with default values
 *   await mockOrder(page, TEST_USER_APPROVED);
 *
 *   // Or with custom overrides
 *   await mockOrder(page, TEST_USER_APPROVED, [
 *     {
 *       id: "order-123",
 *       userId: "user-456",
 *       status: OrderStatus.READY,
 *       personalizationSource: PersonalizationSource.KYC,
 *       totalDiscountEUR: 0,
 *       createdAt: new Date().toISOString()
 *     }
 *   ]);
 *
 *   // Your test code here...
 * });
 * ```
 */
export async function mockOrder({
  page,
  testUser,
  orderOverrides,
}: {
  page: Page;
  testUser: TestUser;
  orderOverrides?: OrderMockData;
}): Promise<void> {
  await page.route("**/api/v1/order/", async (route) => {
    const request = route.request();

    if (request.method() === "GET") {
      try {
        // Create default orders based on test user
        const defaultOrders: OrderMockData = [];

        // Apply any overrides
        const finalOrders: OrderMockData = orderOverrides || testUser.orders || defaultOrders;

        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(finalOrders),
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
 * Helper function to create an order with consistent data
 */
export function createOrder(config: {
  id: string;
  userId: string;
  status?: OrderStatusType;
  personalizationSource?: PersonalizationSourceType;
  embossedName?: string;
  address1?: string;
  address2?: string;
  city?: string;
  postalCode?: string;
  state?: string;
  country?: string;
  transactionHash?: string;
  couponCode?: string;
  totalAmountEUR?: number;
  totalDiscountEUR?: number;
  createdAt?: string;
  virtual?: boolean;
}): CardOrder {
  const now = new Date().toISOString();

  return {
    id: config.id,
    status: config.status || OrderStatus.PENDING_TRANSACTION,
    personalizationSource: config.personalizationSource || PersonalizationSource.KYC,
    embossedName: config.embossedName,
    address1: config.address1,
    address2: config.address2,
    city: config.city,
    postalCode: config.postalCode,
    state: config.state,
    country: config.country,
    transactionHash: config.transactionHash,
    couponCode: config.couponCode,
    totalAmountEUR: config.totalAmountEUR ?? 25.0,
    totalDiscountEUR: config.totalDiscountEUR ?? 0.0,
    createdAt: config.createdAt || now,
    virtual: config.virtual,
  };
}
