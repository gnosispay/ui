import type { Page, Route } from "@playwright/test";
import type { Event, Payment, Refund, Reversal, BasePaymentish } from "../../src/client/types.gen";
import type { TestUser } from "./testUsers";

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
    console.log(`[mockCardTransactions] Intercepted: ${request.method()} ${request.url()}`);

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
    billingAmount: config.billingAmount || "1000", // 10.00 EUR in cents
    billingCurrency: config.billingCurrency || { code: "EUR", name: "Euro" },
    transactionAmount: config.transactionAmount || config.billingAmount || "1000",
    transactionCurrency: config.transactionCurrency || config.billingCurrency || { code: "EUR", name: "Euro" },
    transactionType: config.transactionType || TransactionType.PURCHASE,
    cardToken: config.cardToken || "default-card-token",
    transactions: config.transactions || [],
    status: config.status || PaymentStatus.APPROVED,
  };
}

/**
 * Helper function to create a refund transaction
 */
export function createRefund(
  config: Partial<BasePaymentish> & {
    refundAmount?: string;
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
    billingAmount: config.billingAmount || "1000",
    billingCurrency: config.billingCurrency || { code: "EUR", name: "Euro" },
    transactionAmount: config.transactionAmount || config.billingAmount || "1000",
    transactionCurrency: config.transactionCurrency || config.billingCurrency || { code: "EUR", name: "Euro" },
    transactionType: config.transactionType || TransactionType.RETURN_OF_GOODS,
    cardToken: config.cardToken || "default-card-token",
    transactions: config.transactions || [],
    refundAmount: config.refundAmount || config.billingAmount || "1000",
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
    billingAmount: config.billingAmount || "1000",
    billingCurrency: config.billingCurrency || { code: "EUR", name: "Euro" },
    transactionAmount: config.transactionAmount || config.billingAmount || "1000",
    transactionCurrency: config.transactionCurrency || config.billingCurrency || { code: "EUR", name: "Euro" },
    transactionType: config.transactionType || TransactionType.PURCHASE,
    cardToken: config.cardToken || "default-card-token",
    transactions: config.transactions || [],
    reversalAmount: config.reversalAmount || config.billingAmount || "1000",
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
        billingAmount: "350", // 3.50 EUR
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
        billingAmount: "2500", // 25.00 EUR
        mcc: "5411", // Grocery stores
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
