import type { Page, Route } from "@playwright/test";
import type { Event, Payment, Refund, Reversal, BasePaymentish, Currency } from "../../src/client/types.gen";
import type { TestUser } from "./testUsers";
import { mockCurrencies } from "./currencyUtils";

/**
 * Card transactions response data structure
 */
export interface CardTransactionsData {
  /** Total number of transactions available */
  count: number;
  /** URL for the next page of results, null if no more pages */
  next: string | null;
  /** URL for the previous page of results, null if on first page */
  previous: string | null;
  /** Array of transaction events for the current page */
  results: Event[];
}

/**
 * Mock data configuration for card transactions
 */
export interface CardTransactionsMockData extends CardTransactionsData {}

/**
 * Transaction status enum for payments
 */
export enum PaymentStatus {
  APPROVED = "Approved",
  INCORRECT_PIN = "IncorrectPin",
  INSUFFICIENT_FUNDS = "InsufficientFunds",
  EXCEEDS_APPROVAL_AMOUNT_LIMIT = "ExceedsApprovalAmountLimit",
  INVALID_AMOUNT = "InvalidAmount",
  PIN_ENTRY_TRIES_EXCEEDED = "PinEntryTriesExceeded",
  INCORRECT_SECURITY_CODE = "IncorrectSecurityCode",
  REVERSAL = "Reversal",
  PARTIAL_REVERSAL = "PartialReversal",
  OTHER = "Other",
}

/**
 * Transaction type codes (DE3 field from ISO 8583)
 */
export enum TransactionType {
  PURCHASE = "00",
  WITHDRAWAL = "01",
  ACCOUNT_FUNDING = "10",
  RETURN_OF_GOODS = "20",
  PREPAID_LOAD = "28",
  BALANCE_INQUIRY = "30",
  PIN_CHANGE = "70",
  PIN_UNBLOCK = "72",
}

/**
 * Sets up a mock for the `/api/v1/cards/transactions` endpoint in Playwright tests.
 *
 * This function intercepts GET requests to the card transactions endpoint and returns
 * the specified transactions data with support for pagination and filtering.
 *
 * @param page - The Playwright page instance
 * @param testUser - The test user whose card transactions to mock
 * @param transactionsOverrides - Optional overrides for the transactions data
 *
 * @example
 * ```typescript
 * import { mockCardTransactions } from "./utils/mockCardTransactions";
 * import { TEST_USER_APPROVED } from "./utils/testUsers";
 *
 * test("card transactions display", async ({ page }) => {
 *   // Set up the transactions mock with default values (empty)
 *   await mockCardTransactions(page, TEST_USER_APPROVED);
 *
 *   // Or with custom transactions
 *   await mockCardTransactions(page, TEST_USER_APPROVED, {
 *     count: 2,
 *     next: null,
 *     previous: null,
 *     results: [
 *       createPayment({
 *         threadId: "tx-123",
 *         merchant: { name: "Coffee Shop", city: "Berlin", country: { alpha2: "DE", name: "Germany" } },
 *         billingAmount: "500", // 5.00 EUR in cents
 *         transactionAmount: "500"
 *       })
 *     ]
 *   });
 *
 *   // Your test code here...
 * });
 * ```
 */
export async function mockCardTransactions({
  page,
  testUser,
  transactionsOverrides,
}: {
  page: Page;
  testUser: TestUser;
  transactionsOverrides?: CardTransactionsMockData;
}): Promise<void> {
  // Handle both /api/v1/cards/transactions and /v1/cards/transactions patterns
  const routeHandler = async (route: Route) => {
    const request = route.request();

    if (request.method() === "GET") {
      try {
        // Parse query parameters for pagination and filtering
        const url = new URL(request.url());
        const limit = parseInt(url.searchParams.get("limit") || "100", 10);
        const offset = parseInt(url.searchParams.get("offset") || "0", 10);
        const cardTokens = url.searchParams.get("cardTokens");
        // Additional filtering parameters (not implemented yet)
        // const before = url.searchParams.get("before");
        // const after = url.searchParams.get("after");
        // const billingCurrency = url.searchParams.get("billingCurrency");
        // const transactionCurrency = url.searchParams.get("transactionCurrency");
        const mcc = url.searchParams.get("mcc");
        const transactionType = url.searchParams.get("transactionType");

        // Use overrides or default to empty transactions
        const finalTransactions: CardTransactionsMockData = transactionsOverrides ||
          testUser.cardTransactions || {
            count: 0,
            next: null,
            previous: null,
            results: [],
          };

        // Apply filtering if specified (basic implementation for now)
        let filteredResults = finalTransactions.results;

        if (cardTokens) {
          const tokenList = cardTokens.split(",");
          filteredResults = filteredResults.filter((event) => tokenList.includes(event.cardToken || ""));
        }

        if (transactionType) {
          filteredResults = filteredResults.filter((event) => event.transactionType === transactionType);
        }

        if (mcc) {
          filteredResults = filteredResults.filter((event) => event.mcc === mcc);
        }

        // Apply pagination
        const paginatedResults = filteredResults.slice(offset, offset + limit);
        const hasNext = offset + limit < filteredResults.length;
        const hasPrevious = offset > 0;

        const response: CardTransactionsData = {
          count: filteredResults.length,
          next: hasNext ? `/api/v1/cards/transactions?limit=${limit}&offset=${offset + limit}` : null,
          previous: hasPrevious
            ? `/api/v1/cards/transactions?limit=${limit}&offset=${Math.max(0, offset - limit)}`
            : null,
          results: paginatedResults,
        };

        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(response),
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
  };

  await page.route("**/api/v1/cards/transactions*", routeHandler);
}

/**
 * Helper function to create a payment transaction
 */
export function createPayment(
  config: Partial<BasePaymentish> & {
    status?: PaymentStatus;
  },
): Payment {
  const now = new Date().toISOString();

  return {
    kind: "Payment",
    threadId: config.threadId || generateThreadId(),
    createdAt: config.createdAt || now,
    clearedAt: config.clearedAt || (config.isPending ? null : now),
    country: config.country || { alpha2: "DE", name: "Germany" },
    isPending: config.isPending || false,
    impactsCashback: config.impactsCashback || true,
    mcc: config.mcc || "5411", // Grocery stores
    merchant: config.merchant || {
      name: "Test Merchant",
      city: "Berlin",
      country: { alpha2: "DE", name: "Germany" },
    },
    billingAmount: config.billingAmount || "10000000000000000000", // 10.00 EUR (18 decimals)
    billingCurrency: config.billingCurrency || mockCurrencies.EUR,
    transactionAmount: config.transactionAmount || config.billingAmount || "10000000000000000000",
    transactionCurrency: config.transactionCurrency || config.billingCurrency || mockCurrencies.EUR,
    transactionType: config.transactionType || TransactionType.PURCHASE,
    cardToken: config.cardToken || "token-approved-1",
    transactions: config.transactions || [
      {
        status: "ExecSuccess",
        to: "0xcFF260bfbc199dC82717494299b1AcADe25F549b",
        value: "0",
        data: "0x8a320255000000000000000000000000cb444e90d8198415266c6a2724b7900fb12fc56e0000000000000000000000006ea79daa04ca3ed7fce7141773b01d4f25ee6a190000000000000000000000004822521e6135cd2599199c83ea35179229a172ee0000000000000000000000000000000000000000000000005a9f38670f4d0000349476e3982666749979c85ce800cd2947a4b8dc9fe20a01a00a1b526072a8a30000000000000000000000000000000000000000000000000000019a16e9bfb6e71bd7ddc6faad5593dc9f954cb2413fd3593162041b0491223c51d21d5917ba33a14a9f6489390021ee2b6231a97c26d7049a44e8297402a28652fb8cf59cc61b",
        hash: "0x22cb212fe780eab2c3faa2848bb4e90acc4b327eb42d1ee1fe134248e064390a",
      },
    ],
    status: config.status || PaymentStatus.APPROVED,
  };
}

/**
 * Helper function to create a refund transaction
 */
export function createRefund(
  config: Partial<BasePaymentish> & {
    refundAmount?: string;
    refundCurrency?: Currency;
  },
): Refund {
  const now = new Date().toISOString();

  return {
    kind: "Refund",
    threadId: config.threadId || generateThreadId(),
    createdAt: config.createdAt || now,
    clearedAt: config.clearedAt || now, // Refunds are typically cleared when they appear
    country: config.country || { alpha2: "DE", name: "Germany" },
    isPending: config.isPending || false,
    impactsCashback: config.impactsCashback || false, // Refunds typically don't impact cashback
    mcc: config.mcc || "5411",
    merchant: config.merchant || {
      name: "Test Merchant",
      city: "Berlin",
      country: { alpha2: "DE", name: "Germany" },
    },
    billingAmount: config.billingAmount || "10000000000000000000", // 10.00 EUR (18 decimals)
    billingCurrency: config.billingCurrency || mockCurrencies.EUR,
    transactionAmount: config.transactionAmount || config.billingAmount || "10000000000000000000",
    transactionCurrency: config.transactionCurrency || config.billingCurrency || mockCurrencies.EUR,
    transactionType: config.transactionType || TransactionType.RETURN_OF_GOODS,
    cardToken: config.cardToken || "token-approved-1",
    transactions: config.transactions || [
      {
        status: "ExecSuccess",
        to: "0xcFF260bfbc199dC82717494299b1AcADe25F549b",
        value: "0",
        data: "0x8a320255000000000000000000000000cb444e90d8198415266c6a2724b7900fb12fc56e0000000000000000000000006ea79daa04ca3ed7fce7141773b01d4f25ee6a190000000000000000000000004822521e6135cd2599199c83ea35179229a172ee0000000000000000000000000000000000000000000000005a9f38670f4d0000349476e3982666749979c85ce800cd2947a4b8dc9fe20a01a00a1b526072a8a30000000000000000000000000000000000000000000000000000019a16e9bfb6e71bd7ddc6faad5593dc9f954cb2413fd3593162041b0491223c51d21d5917ba33a14a9f6489390021ee2b6231a97c26d7049a44e8297402a28652fb8cf59cc61b",
        hash: "0x33dc323gf891fab3d4gbb3959fb5f91bdd4c438fc53e2ff2gf245359f175501b",
      },
    ],
    refundAmount: config.refundAmount || config.billingAmount || "10000000000000000000",
    refundCurrency: config.refundCurrency || config.billingCurrency || mockCurrencies.EUR,
  };
}

/**
 * Helper function to create a reversal transaction
 */
export function createReversal(
  config: Partial<BasePaymentish> & {
    reversalAmount?: string;
  },
): Reversal {
  const now = new Date().toISOString();

  return {
    kind: "Reversal",
    threadId: config.threadId || generateThreadId(),
    createdAt: config.createdAt || now,
    clearedAt: config.clearedAt || now, // Reversals are typically processed quickly
    country: config.country || { alpha2: "DE", name: "Germany" },
    isPending: config.isPending || false,
    impactsCashback: config.impactsCashback || null, // Reversals may not have clear cashback impact
    mcc: config.mcc || "5411",
    merchant: config.merchant || {
      name: "Test Merchant",
      city: "Berlin",
      country: { alpha2: "DE", name: "Germany" },
    },
    billingAmount: config.billingAmount || "10000000000000000000", // 10.00 EUR (18 decimals)
    billingCurrency: config.billingCurrency || mockCurrencies.EUR,
    transactionAmount: config.transactionAmount || config.billingAmount || "10000000000000000000",
    transactionCurrency: config.transactionCurrency || config.billingCurrency || mockCurrencies.EUR,
    transactionType: config.transactionType || TransactionType.PURCHASE,
    cardToken: config.cardToken || "token-approved-1",
    transactions: config.transactions || [
      {
        status: "ExecSuccess",
        to: "0xcFF260bfbc199dC82717494299b1AcADe25F549b",
        value: "0",
        data: "0x8a320255000000000000000000000000cb444e90d8198415266c6a2724b7900fb12fc56e0000000000000000000000006ea79daa04ca3ed7fce7141773b01d4f25ee6a190000000000000000000000004822521e6135cd2599199c83ea35179229a172ee0000000000000000000000000000000000000000000000005a9f38670f4d0000349476e3982666749979c85ce800cd2947a4b8dc9fe20a01a00a1b526072a8a30000000000000000000000000000000000000000000000000000019a16e9bfb6e71bd7ddc6faad5593dc9f954cb2413fd3593162041b0491223c51d21d5917ba33a14a9f6489390021ee2b6231a97c26d7049a44e8297402a28652fb8cf59cc61b",
        hash: "0x44ed434hg902gbc4e5hcc4a6agc6ga2cee5d549gd64f3gg3hg356460g286612c",
      },
    ],
    reversalAmount: config.reversalAmount || config.billingAmount || "10000000000000000000",
  };
}

/**
 * Generate a random thread ID for transactions
 */
function generateThreadId(): string {
  return `thread-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Predefined card transaction scenarios for testing
 */
export const CARD_TRANSACTIONS_SCENARIOS = {
  /** No transactions */
  empty: {
    count: 0,
    next: null,
    previous: null,
    results: [],
  },

  /** Single pending payment */
  singlePending: {
    count: 1,
    next: null,
    previous: null,
    results: [
      createPayment({
        isPending: true,
        clearedAt: null,
        merchant: { name: "Coffee Shop", city: "Berlin", country: { alpha2: "DE", name: "Germany" } },
        billingAmount: "3500000000000000000", // 3.50 EUR (18 decimals)
        mcc: "5814", // Fast food restaurants
      }),
    ],
  },

  /** Single completed payment */
  singleCompleted: {
    count: 1,
    next: null,
    previous: null,
    results: [
      createPayment({
        isPending: false,
        merchant: { name: "Grocery Store", city: "Berlin", country: { alpha2: "DE", name: "Germany" } },
        billingAmount: "25000000000000000000", // 25.00 EUR (18 decimals)
        mcc: "5411", // Grocery stores
        createdAt: "2024-01-15T14:30:00.000Z", // January 15, 2024 at 14:30 UTC
      }),
    ],
  },

  /** Single refund transaction */
  singleRefund: {
    count: 1,
    next: null,
    previous: null,
    results: [
      createRefund({
        threadId: "refund-test-1",
        merchant: { name: "Amazon", city: "Seattle", country: { alpha2: "US", name: "United States" } },
        billingAmount: "19990000000000000000", // €19.99 refund (18 decimals)
        billingCurrency: mockCurrencies.EUR,
        transactionAmount: "19990000000000000000",
        transactionCurrency: mockCurrencies.EUR,
        refundAmount: "19990000000000000000",
        refundCurrency: mockCurrencies.EUR, // Add refundCurrency for getAmountAndCurrency function
        mcc: "5399",
        cardToken: "token-approved-1", // Add card token for card info display
        impactsCashback: false, // Refunds don't impact cashback
        createdAt: "2024-01-15T14:30:00.000Z",
      }),
    ],
  },

  /** Single reversal transaction */
  singleReversal: {
    count: 1,
    next: null,
    previous: null,
    results: [
      createReversal({
        threadId: "reversal-test-1",
        merchant: { name: "Gas Station", city: "Berlin", country: { alpha2: "DE", name: "Germany" } },
        billingAmount: "5000", // 50.00 EUR reversal (matching mixed scenario format)
        reversalAmount: "5000",
        mcc: "5542", // Automated fuel dispensers
        createdAt: "2024-01-15T14:30:00.000Z",
      }),
    ],
  },

  /** Single failed transaction */
  singleFailed: {
    count: 1,
    next: null,
    previous: null,
    results: [
      createPayment({
        threadId: "failed-test-1",
        merchant: { name: "Coffee Shop", city: "Berlin", country: { alpha2: "DE", name: "Germany" } },
        billingAmount: "3500000000000000000", // 3.50 EUR (18 decimals)
        billingCurrency: mockCurrencies.EUR,
        transactionAmount: "3500000000000000000",
        transactionCurrency: mockCurrencies.EUR,
        mcc: "5814", // Fast food restaurants
        status: PaymentStatus.INCORRECT_PIN, // Failed status
        createdAt: "2024-01-15T14:30:00.000Z",
      }),
    ],
  },

  /** Mixed transaction types */
  mixed: {
    count: 3,
    next: null,
    previous: null,
    results: [
      createPayment({
        threadId: "payment-1",
        isPending: false,
        merchant: { name: "Amazon", city: "Seattle", country: { alpha2: "US", name: "United States" } },
        billingAmount: "4999", // 49.99 EUR
        mcc: "5399", // Miscellaneous general merchandise
      }),
      createRefund({
        threadId: "refund-1",
        merchant: { name: "Amazon", city: "Seattle", country: { alpha2: "US", name: "United States" } },
        billingAmount: "1999", // 19.99 EUR refund
        refundAmount: "1999",
        mcc: "5399",
      }),
      createReversal({
        threadId: "reversal-1",
        merchant: { name: "Gas Station", city: "Berlin", country: { alpha2: "DE", name: "Germany" } },
        billingAmount: "5000", // 50.00 EUR
        reversalAmount: "5000",
        mcc: "5542", // Automated fuel dispensers
      }),
    ],
  },
};

/**
 * Helper function to mock card transactions with a predefined scenario
 */
export async function mockCardTransactionsScenario({
  page,
  testUser,
  scenario,
}: {
  page: Page;
  testUser: TestUser;
  scenario: keyof typeof CARD_TRANSACTIONS_SCENARIOS;
}): Promise<void> {
  await mockCardTransactions({ page, testUser, transactionsOverrides: CARD_TRANSACTIONS_SCENARIOS[scenario] });
}
