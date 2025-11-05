import type { Page } from "@playwright/test";
import type { TestUser } from "./testUsers";

/**
 * Card order status enum
 */
export enum OrderStatus {
  /** Payment transaction is pending */
  PENDING_TRANSACTION = "PENDINGTRANSACTION",
  /** Payment transaction is complete */
  TRANSACTION_COMPLETE = "TRANSACTIONCOMPLETE",
  /** Order requires user confirmation */
  CONFIRMATION_REQUIRED = "CONFIRMATIONREQUIRED",
  /** Order is ready for processing */
  READY = "READY",
  /** Physical card has been created */
  CARD_CREATED = "CARDCREATED",
  /** Payment transaction failed */
  FAILED_TRANSACTION = "FAILEDTRANSACTION",
  /** Order was cancelled */
  CANCELLED = "CANCELLED",
}

/**
 * Personalization source enum
 */
export enum PersonalizationSource {
  /** Use KYC data for personalization */
  KYC = "KYC",
  /** Use ENS data for personalization */
  ENS = "ENS",
}

/**
 * Card order data structure matching the API response
 */
export interface OrderData {
  /** The unique identifier of the card order */
  id: string;
  /** The on-chain transaction hash associated with the order */
  transactionHash?: string | null;
  /** The name embossed on the card */
  embossedName?: string | null;
  /** The first line of the shipping address */
  address1?: string | null;
  /** The second line of the shipping address */
  address2?: string | null;
  /** The city of the shipping address */
  city?: string | null;
  /** The postal code of the shipping address */
  postalCode?: string | null;
  /** The state of the shipping address */
  state?: string | null;
  /** The country of the shipping address */
  country?: string | null;
  /** The user id for this card order */
  userId: string;
  /** Current order status */
  status: OrderStatus;
  /** Personalization source */
  personalizationSource: PersonalizationSource;
  /** The coupon code tied to this card order */
  couponCode?: string;
  /** Total amount in EUR */
  totalAmountEUR?: number | null;
  /** Total discount in EUR */
  totalDiscountEUR: number;
  /** When the order was created */
  createdAt: string;
}

/**
 * Configuration for mocking Order responses
 */
export interface OrderMockData extends Array<OrderData> {}

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
  status?: OrderStatus;
  personalizationSource?: PersonalizationSource;
  embossedName?: string;
  address1?: string;
  address2?: string;
  city?: string;
  postalCode?: string;
  state?: string;
  country?: string;
  transactionHash?: string | null;
  couponCode?: string;
  totalAmountEUR?: number | null;
  totalDiscountEUR?: number;
  createdAt?: string;
}): OrderData {
  const now = new Date().toISOString();

  return {
    id: config.id,
    userId: config.userId,
    status: config.status || OrderStatus.PENDING_TRANSACTION,
    personalizationSource: config.personalizationSource || PersonalizationSource.KYC,
    embossedName: config.embossedName || null,
    address1: config.address1 || null,
    address2: config.address2 || null,
    city: config.city || null,
    postalCode: config.postalCode || null,
    state: config.state || null,
    country: config.country || null,
    transactionHash: config.transactionHash || null,
    couponCode: config.couponCode || undefined,
    totalAmountEUR: config.totalAmountEUR || 25.0,
    totalDiscountEUR: config.totalDiscountEUR || 0.0,
    createdAt: config.createdAt || now,
  };
}

/**
 * Predefined order scenarios for common test cases
 */
export const ORDER_SCENARIOS = {
  /** No orders */
  EMPTY: [],

  /** Single pending order */
  SINGLE_PENDING: [
    createOrder({
      id: "order-pending-1",
      userId: "test-user-1",
      status: OrderStatus.PENDING_TRANSACTION,
      personalizationSource: PersonalizationSource.KYC,
      embossedName: "John Doe",
      address1: "123 Test Street",
      city: "Test City",
      postalCode: "12345",
      country: "US",
      totalAmountEUR: 25.0,
      totalDiscountEUR: 0.0,
    }),
  ],

  /** Single completed order */
  SINGLE_COMPLETED: [
    createOrder({
      id: "order-completed-1",
      userId: "test-user-1",
      status: OrderStatus.CARD_CREATED,
      personalizationSource: PersonalizationSource.KYC,
      embossedName: "John Doe",
      address1: "123 Test Street",
      city: "Test City",
      postalCode: "12345",
      country: "US",
      transactionHash: "0x1234567890abcdef1234567890abcdef12345678",
      totalAmountEUR: 25.0,
      totalDiscountEUR: 5.0,
    }),
  ],

  /** Order ready for processing */
  READY_ORDER: [
    createOrder({
      id: "order-ready-1",
      userId: "test-user-1",
      status: OrderStatus.READY,
      personalizationSource: PersonalizationSource.KYC,
      embossedName: "John Doe",
      address1: "123 Test Street",
      city: "Test City",
      postalCode: "12345",
      country: "US",
      transactionHash: "0x1234567890abcdef1234567890abcdef12345678",
      totalAmountEUR: 25.0,
      totalDiscountEUR: 0.0,
    }),
  ],

  /** Failed order */
  FAILED_ORDER: [
    createOrder({
      id: "order-failed-1",
      userId: "test-user-1",
      status: OrderStatus.FAILED_TRANSACTION,
      personalizationSource: PersonalizationSource.KYC,
      embossedName: "John Doe",
      address1: "123 Test Street",
      city: "Test City",
      postalCode: "12345",
      country: "US",
      totalAmountEUR: 25.0,
      totalDiscountEUR: 0.0,
    }),
  ],

  /** Cancelled order */
  CANCELLED_ORDER: [
    createOrder({
      id: "order-cancelled-1",
      userId: "test-user-1",
      status: OrderStatus.CANCELLED,
      personalizationSource: PersonalizationSource.KYC,
      embossedName: "John Doe",
      address1: "123 Test Street",
      city: "Test City",
      postalCode: "12345",
      country: "US",
      totalAmountEUR: 25.0,
      totalDiscountEUR: 0.0,
    }),
  ],

  /** Multiple orders with different statuses */
  MIXED_STATUS: [
    createOrder({
      id: "order-pending-1",
      userId: "test-user-1",
      status: OrderStatus.PENDING_TRANSACTION,
      personalizationSource: PersonalizationSource.KYC,
      embossedName: "John Doe",
      totalAmountEUR: 25.0,
      totalDiscountEUR: 0.0,
    }),
    createOrder({
      id: "order-ready-1",
      userId: "test-user-1",
      status: OrderStatus.READY,
      personalizationSource: PersonalizationSource.KYC,
      embossedName: "John Doe",
      transactionHash: "0x1234567890abcdef1234567890abcdef12345678",
      totalAmountEUR: 25.0,
      totalDiscountEUR: 5.0,
    }),
    createOrder({
      id: "order-completed-1",
      userId: "test-user-1",
      status: OrderStatus.CARD_CREATED,
      personalizationSource: PersonalizationSource.KYC,
      embossedName: "John Doe",
      transactionHash: "0xabcdef1234567890abcdef1234567890abcdef12",
      totalAmountEUR: 25.0,
      totalDiscountEUR: 10.0,
    }),
  ],

  /** Order with ENS personalization */
  ENS_PERSONALIZATION: [
    createOrder({
      id: "order-ens-1",
      userId: "test-user-1",
      status: OrderStatus.READY,
      personalizationSource: PersonalizationSource.ENS,
      embossedName: "vitalik.eth",
      address1: "123 Crypto Street",
      city: "Ethereum City",
      postalCode: "ETH01",
      country: "US",
      transactionHash: "0x1234567890abcdef1234567890abcdef12345678",
      totalAmountEUR: 25.0,
      totalDiscountEUR: 0.0,
    }),
  ],

  /** Order with coupon code */
  WITH_COUPON: [
    createOrder({
      id: "order-coupon-1",
      userId: "test-user-1",
      status: OrderStatus.READY,
      personalizationSource: PersonalizationSource.KYC,
      embossedName: "John Doe",
      address1: "123 Test Street",
      city: "Test City",
      postalCode: "12345",
      country: "US",
      couponCode: "SAVE20",
      totalAmountEUR: 25.0,
      totalDiscountEUR: 20.0,
    }),
  ],

  /** Order requiring confirmation */
  REQUIRES_CONFIRMATION: [
    createOrder({
      id: "order-confirm-1",
      userId: "test-user-1",
      status: OrderStatus.CONFIRMATION_REQUIRED,
      personalizationSource: PersonalizationSource.KYC,
      embossedName: "John Doe",
      address1: "123 Test Street",
      city: "Test City",
      postalCode: "12345",
      country: "US",
      totalAmountEUR: 25.0,
      totalDiscountEUR: 0.0,
    }),
  ],

  /** International order */
  INTERNATIONAL_ORDER: [
    createOrder({
      id: "order-intl-1",
      userId: "test-user-1",
      status: OrderStatus.READY,
      personalizationSource: PersonalizationSource.KYC,
      embossedName: "Hans Mueller",
      address1: "Musterstraße 123",
      city: "Berlin",
      postalCode: "10115",
      state: "Berlin",
      country: "DE",
      transactionHash: "0x1234567890abcdef1234567890abcdef12345678",
      totalAmountEUR: 25.0,
      totalDiscountEUR: 0.0,
    }),
  ],
};

/**
 * Helper function to mock orders with a predefined scenario
 */
export async function mockOrderScenario(
  page: Page,
  testUser: TestUser,
  scenario: keyof typeof ORDER_SCENARIOS,
): Promise<void> {
  await mockOrder({ page, testUser, orderOverrides: ORDER_SCENARIOS[scenario] });
}

/**
 * Helper function to filter orders by status
 */
export function filterOrdersByStatus(orders: OrderMockData, status: OrderStatus): OrderMockData {
  return orders.filter((order) => order.status === status);
}

/**
 * Helper function to filter orders by personalization source
 */
export function filterOrdersByPersonalizationSource(
  orders: OrderMockData,
  source: PersonalizationSource,
): OrderMockData {
  return orders.filter((order) => order.personalizationSource === source);
}

/**
 * Helper function to get active orders (excludes failed and cancelled)
 */
export function getActiveOrders(orders: OrderMockData): OrderMockData {
  return orders.filter((order) => ![OrderStatus.FAILED_TRANSACTION, OrderStatus.CANCELLED].includes(order.status));
}

/**
 * Helper function to get completed orders
 */
export function getCompletedOrders(orders: OrderMockData): OrderMockData {
  return orders.filter((order) => order.status === OrderStatus.CARD_CREATED);
}

/**
 * Helper function to generate an order ID
 */
export function generateOrderId(prefix: string = "order"): string {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Helper function to generate a transaction hash
 */
export function generateTransactionHash(): string {
  const chars = "0123456789abcdef";
  let result = "0x";
  for (let i = 0; i < 64; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
