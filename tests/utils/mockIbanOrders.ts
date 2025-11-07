import type { Page } from "@playwright/test";
import type { TestUser } from "./testUsers";
import type { IbanOrder } from "../../src/client";

// Create enums that strictly follow the API types
// If the API changes, these will cause compile errors
export const IbanOrderKind = {
  ISSUE: "issue" as const,
  REDEEM: "redeem" as const,
} satisfies Record<string, IbanOrder["kind"]>;
export type IbanOrderKindType = IbanOrder["kind"];

export const IbanOrderState = {
  PLACED: "placed" as const,
  PENDING: "pending" as const,
  PROCESSED: "processed" as const,
  REJECTED: "rejected" as const,
} satisfies Record<string, IbanOrder["state"]>;
export type IbanOrderStateType = IbanOrder["state"];

export const IbanOrderCurrency = {
  EUR: "eur" as const,
  USD: "usd" as const,
  GBP: "gbp" as const,
  ISK: "isk" as const,
} satisfies Record<string, IbanOrder["currency"]>;
export type IbanOrderCurrencyType = IbanOrder["currency"];

/**
 * Configuration for mocking IBAN orders responses
 */
export interface IbanOrdersMockData {
  data?: IbanOrder[];
}

/**
 * Sets up a mock for the `/api/v1/ibans/orders` endpoint in Playwright tests.
 *
 * This function intercepts GET requests to the IBAN orders endpoint and returns
 * the specified order data.
 *
 * @param page - The Playwright page instance
 * @param testUser - The test user whose orders to mock
 * @param ordersOverrides - Optional overrides for the orders data
 *
 * @example
 * ```typescript
 * import { mockIbanOrders, IBAN_ORDER_SCENARIOS } from "./utils/mockIbanOrders";
 * import { BASE_USER } from "./utils/testUsers";
 *
 * test("iban orders display", async ({ page }) => {
 *   // Set up the IBAN orders mock with default values
 *   await mockIbanOrders({ page, testUser: BASE_USER });
 *
 *   // Or with custom scenario
 *   await mockIbanOrders({
 *     page,
 *     testUser: BASE_USER,
 *     ordersOverrides: IBAN_ORDER_SCENARIOS.singleIncoming
 *   });
 *
 *   // Your test code here...
 * });
 * ```
 */
export async function mockIbanOrders({
  page,
  testUser,
  ordersOverrides,
}: {
  page: Page;
  testUser: TestUser;
  ordersOverrides?: IbanOrdersMockData;
}): Promise<void> {
  await page.route("**/api/v1/ibans/orders", async (route) => {
    const request = route.request();

    if (request.method() === "GET") {
      try {
        // Create default empty orders
        const defaultOrders: IbanOrdersMockData = { data: [] };

        // Apply any overrides
        const finalOrders: IbanOrdersMockData = ordersOverrides || testUser.ibanOrders || defaultOrders;

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
 * Helper function to create an incoming IBAN order (issue)
 */
export function createIncomingOrder(config: {
  id?: string;
  amount?: string;
  currency?: IbanOrderCurrencyType;
  counterpartName?: string;
  counterpartIban?: string;
  memo?: string | null;
  state?: IbanOrderStateType;
  placedAt?: string;
  address?: string;
}): IbanOrder {
  const now = new Date().toISOString();
  const orderId = config.id || `incoming-order-${Math.random().toString(36).substring(7)}`;

  return {
    id: orderId,
    kind: IbanOrderKind.ISSUE,
    currency: config.currency || IbanOrderCurrency.EUR,
    amount: config.amount || "100.00",
    address: config.address || "0x1234567890123456789012345678901234567890",
    counterpart: {
      details: {
        name: config.counterpartName || "John Doe",
      },
      identifier: {
        standard: "iban",
        iban: config.counterpartIban || "DE89370400440532013000",
      },
    },
    memo: config.memo !== undefined ? config.memo : null,
    state: config.state || IbanOrderState.PROCESSED,
    meta: {
      placedAt: config.placedAt || now,
    },
  };
}

/**
 * Helper function to create an outgoing IBAN order (redeem)
 */
export function createOutgoingOrder(config: {
  id?: string;
  amount?: string;
  currency?: IbanOrderCurrencyType;
  counterpartName?: string;
  counterpartIban?: string;
  memo?: string | null;
  state?: IbanOrderStateType;
  placedAt?: string;
  address?: string;
}): IbanOrder {
  const now = new Date().toISOString();
  const orderId = config.id || `outgoing-order-${Math.random().toString(36).substring(7)}`;

  return {
    id: orderId,
    kind: IbanOrderKind.REDEEM,
    currency: config.currency || IbanOrderCurrency.EUR,
    amount: config.amount || "50.00",
    address: config.address || "0x1234567890123456789012345678901234567890",
    counterpart: {
      details: {
        name: config.counterpartName || "Jane Smith",
      },
      identifier: {
        standard: "iban",
        iban: config.counterpartIban || "GB33BUKB20201555555555",
      },
    },
    memo: config.memo !== undefined ? config.memo : null,
    state: config.state || IbanOrderState.PROCESSED,
    meta: {
      placedAt: config.placedAt || now,
    },
  };
}

/**
 * Predefined IBAN order scenarios for common test cases
 */
export const IBAN_ORDER_SCENARIOS = {
  /** No orders */
  empty: {
    data: [],
  },

  /** Single incoming order (processed) */
  singleIncoming: {
    data: [
      createIncomingOrder({
        id: "incoming-1",
        amount: "250.00",
        currency: IbanOrderCurrency.EUR,
        counterpartName: "Alice Johnson",
        counterpartIban: "DE89370400440532013000",
        memo: "Salary payment",
        state: IbanOrderState.PROCESSED,
        placedAt: "2024-01-15T14:30:00.000Z",
      }),
    ],
  },

  /** Single outgoing order (processed) */
  singleOutgoing: {
    data: [
      createOutgoingOrder({
        id: "outgoing-1",
        amount: "150.00",
        currency: IbanOrderCurrency.EUR,
        counterpartName: "Bob Smith",
        counterpartIban: "GB33BUKB20201555555555",
        memo: "Rent payment",
        state: IbanOrderState.PROCESSED,
        placedAt: "2024-01-15T14:30:00.000Z",
      }),
    ],
  },

  /** Single pending order */
  singlePending: {
    data: [
      createIncomingOrder({
        id: "pending-1",
        amount: "100.00",
        currency: IbanOrderCurrency.EUR,
        counterpartName: "Charlie Brown",
        counterpartIban: "FR1420041010050500013M02606",
        memo: null,
        state: IbanOrderState.PENDING,
        placedAt: new Date().toISOString(),
      }),
    ],
  },

  /** Single rejected order */
  singleRejected: {
    data: [
      createOutgoingOrder({
        id: "rejected-1",
        amount: "500.00",
        currency: IbanOrderCurrency.EUR,
        counterpartName: "David Wilson",
        counterpartIban: "IT60X0542811101000000123456",
        memo: "Failed payment",
        state: IbanOrderState.REJECTED,
        placedAt: "2024-01-15T14:30:00.000Z",
      }),
    ],
  },

  /** Mixed orders with different states and dates */
  mixed: {
    data: [
      // Today's transactions
      createIncomingOrder({
        id: "incoming-today-1",
        amount: "500.00",
        currency: IbanOrderCurrency.EUR,
        counterpartName: "Emma Davis",
        counterpartIban: "DE89370400440532013000",
        memo: "Invoice payment",
        state: IbanOrderState.PROCESSED,
        placedAt: "2024-01-16T10:15:00.000Z",
      }),
      createOutgoingOrder({
        id: "outgoing-today-1",
        amount: "75.50",
        currency: IbanOrderCurrency.EUR,
        counterpartName: "Frank Miller",
        counterpartIban: "GB33BUKB20201555555555",
        memo: null, // Tests transaction without memo
        state: IbanOrderState.PROCESSED,
        placedAt: "2024-01-16T09:30:00.000Z",
      }),
      createIncomingOrder({
        id: "gbp-today-1",
        amount: "400.00",
        currency: IbanOrderCurrency.GBP, // Tests GBP currency
        counterpartName: "GBP Sender",
        counterpartIban: "GB33BUKB20201555555555",
        memo: "GBP payment",
        state: IbanOrderState.PROCESSED,
        placedAt: "2024-01-16T09:00:00.000Z",
      }),
      createOutgoingOrder({
        id: "usd-today-1",
        amount: "600.00",
        currency: IbanOrderCurrency.USD, // Tests USD currency
        counterpartName: "USD Recipient",
        counterpartIban: "US12345678901234567890",
        memo: null, // Tests transaction without memo
        state: IbanOrderState.PROCESSED,
        placedAt: "2024-01-16T08:00:00.000Z",
      }),
      // Yesterday's transactions
      createIncomingOrder({
        id: "incoming-yesterday-1",
        amount: "1200.00",
        currency: IbanOrderCurrency.EUR,
        counterpartName: "Grace Lee",
        counterpartIban: "FR1420041010050500013M02606",
        memo: "Contract payment",
        state: IbanOrderState.PROCESSED,
        placedAt: "2024-01-15T16:45:00.000Z",
      }),
      createOutgoingOrder({
        id: "outgoing-yesterday-1",
        amount: "250.00",
        currency: IbanOrderCurrency.EUR,
        counterpartName: "Henry Taylor",
        counterpartIban: "ES9121000418450200051332",
        memo: "Utility bill",
        state: IbanOrderState.PROCESSED,
        placedAt: "2024-01-15T14:20:00.000Z",
      }),
      createIncomingOrder({
        id: "pending-yesterday-1",
        amount: "300.00",
        currency: IbanOrderCurrency.EUR,
        counterpartName: "Ivy Anderson",
        counterpartIban: "NL91ABNA0417164300",
        memo: null, // Tests transaction without memo
        state: IbanOrderState.PENDING,
        placedAt: "2024-01-15T12:00:00.000Z",
      }),
      createOutgoingOrder({
        id: "rejected-yesterday-1",
        amount: "500.00",
        currency: IbanOrderCurrency.EUR,
        counterpartName: "David Wilson",
        counterpartIban: "IT60X0542811101000000123456",
        memo: "Failed payment",
        state: IbanOrderState.REJECTED,
        placedAt: "2024-01-15T11:00:00.000Z",
      }),
    ],
  },

  /** Multi-currency orders */
  multiCurrency: {
    data: [
      createIncomingOrder({
        id: "eur-incoming-1",
        amount: "500.00",
        currency: IbanOrderCurrency.EUR,
        counterpartName: "EUR Sender",
        counterpartIban: "DE89370400440532013000",
        memo: "EUR payment",
        state: IbanOrderState.PROCESSED,
        placedAt: "2024-01-16T10:00:00.000Z",
      }),
      createIncomingOrder({
        id: "gbp-incoming-1",
        amount: "400.00",
        currency: IbanOrderCurrency.GBP,
        counterpartName: "GBP Sender",
        counterpartIban: "GB33BUKB20201555555555",
        memo: "GBP payment",
        state: IbanOrderState.PROCESSED,
        placedAt: "2024-01-16T09:00:00.000Z",
      }),
      createOutgoingOrder({
        id: "usd-outgoing-1",
        amount: "600.00",
        currency: IbanOrderCurrency.USD,
        counterpartName: "USD Recipient",
        counterpartIban: "US12345678901234567890",
        memo: "USD payment",
        state: IbanOrderState.PROCESSED,
        placedAt: "2024-01-16T08:00:00.000Z",
      }),
    ],
  },

  /** Orders with various states */
  variousStates: {
    data: [
      createIncomingOrder({
        id: "processed-1",
        amount: "100.00",
        state: IbanOrderState.PROCESSED,
        placedAt: "2024-01-16T10:00:00.000Z",
      }),
      createOutgoingOrder({
        id: "pending-1",
        amount: "200.00",
        state: IbanOrderState.PENDING,
        placedAt: "2024-01-16T09:00:00.000Z",
      }),
      createIncomingOrder({
        id: "placed-1",
        amount: "300.00",
        state: IbanOrderState.PLACED,
        placedAt: "2024-01-16T08:00:00.000Z",
      }),
      createOutgoingOrder({
        id: "rejected-1",
        amount: "400.00",
        state: IbanOrderState.REJECTED,
        placedAt: "2024-01-16T07:00:00.000Z",
      }),
    ],
  },

  /** Orders without memos */
  noMemos: {
    data: [
      createIncomingOrder({
        id: "no-memo-1",
        amount: "150.00",
        memo: null,
        placedAt: "2024-01-16T10:00:00.000Z",
      }),
      createOutgoingOrder({
        id: "no-memo-2",
        amount: "250.00",
        memo: null,
        placedAt: "2024-01-16T09:00:00.000Z",
      }),
    ],
  },
};
