import type { Page } from "@playwright/test";
import type { TestUser } from "./testUsers";

/**
 * Account balances data structure matching the API response
 */
export interface AccountBalancesData {
  /** The total balance for this account (spendable and pending) */
  total: string;
  /** The amount that can be spent from this account */
  spendable: string;
  /** The amount that is being reviewed for spending */
  pending: string;
}

/**
 * Configuration for mocking Account Balances responses
 */
export interface AccountBalancesMockData extends AccountBalancesData {}

/**
 * Sets up a mock for the `/api/v1/account-balances` endpoint in Playwright tests.
 *
 * This function intercepts GET requests to the account balances endpoint and returns
 * the specified balance data.
 *
 * @param page - The Playwright page instance
 * @param testUser - The test user whose account balances to mock
 * @param balancesOverrides - Optional overrides for the balances data
 *
 * @example
 * ```typescript
 * import { mockAccountBalances } from "./utils/mockAccountBalances";
 * import { TEST_USER_APPROVED } from "./utils/testUsers";
 *
 * test("account balances display", async ({ page }) => {
 *   // Set up the account balances mock with default values
 *   await mockAccountBalances(page, TEST_USER_APPROVED);
 *
 *   // Or with custom overrides
 *   await mockAccountBalances(page, TEST_USER_APPROVED, {
 *     total: "150000",
 *     spendable: "100000",
 *     pending: "50000"
 *   });
 *
 *   // Your test code here...
 * });
 * ```
 */
export async function mockAccountBalances(
  page: Page,
  testUser: TestUser,
  balancesOverrides?: AccountBalancesMockData,
): Promise<void> {
  await page.route("**/api/v1/account-balances", async (route) => {
    const request = route.request();

    if (request.method() === "GET") {
      try {
        // Create default account balances based on test user
        const defaultBalances: AccountBalancesData = {
          total: "100000", // €1000.00 in cents
          spendable: "100000", // €1000.00 in cents
          pending: "0", // €0.00 in cents
        };

        // Apply any overrides
        const finalBalances: AccountBalancesData = {
          ...defaultBalances,
          ...testUser.accountBalances,
          ...balancesOverrides,
        };

        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(finalBalances),
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
 * Predefined account balance scenarios for common test cases
 */
export const ACCOUNT_BALANCE_SCENARIOS = {
  /** New user with no balance */
  EMPTY: {
    total: "0",
    spendable: "0",
    pending: "0",
  },

  /** Small balance - €50 */
  SMALL: {
    total: "5000", // €50.00 in cents
    spendable: "5000",
    pending: "0",
  },

  /** Medium balance - €500 */
  MEDIUM: {
    total: "50000", // €500.00 in cents
    spendable: "50000",
    pending: "0",
  },

  /** Large balance - €5000 */
  LARGE: {
    total: "500000", // €5000.00 in cents
    spendable: "500000",
    pending: "0",
  },

  /** Very large balance - €50000 */
  VERY_LARGE: {
    total: "5000000", // €50000.00 in cents
    spendable: "5000000",
    pending: "0",
  },

  /** Balance with pending transactions - €1000 total, €200 pending */
  WITH_PENDING: {
    total: "100000", // €1000.00 in cents
    spendable: "80000", // €800.00 in cents
    pending: "20000", // €200.00 in cents
  },

  /** Large balance with significant pending - €10000 total, €2000 pending */
  LARGE_WITH_PENDING: {
    total: "1000000", // €10000.00 in cents
    spendable: "800000", // €8000.00 in cents
    pending: "200000", // €2000.00 in cents
  },

  /** All pending - unusual but possible scenario */
  ALL_PENDING: {
    total: "50000", // €500.00 in cents
    spendable: "0",
    pending: "50000", // €500.00 in cents
  },

  /** Fractional amounts - €123.45 */
  FRACTIONAL: {
    total: "12345", // €123.45 in cents
    spendable: "12345",
    pending: "0",
  },

  /** Fractional with pending - €999.99 total, €123.45 pending */
  FRACTIONAL_WITH_PENDING: {
    total: "99999", // €999.99 in cents
    spendable: "87654", // €876.54 in cents
    pending: "12345", // €123.45 in cents
  },

  /** Low balance - €1.23 */
  VERY_SMALL: {
    total: "123", // €1.23 in cents
    spendable: "123",
    pending: "0",
  },

  /** Edge case - €0.01 */
  ONE_CENT: {
    total: "1", // €0.01 in cents
    spendable: "1",
    pending: "0",
  },

  /** High precision - €1234.56 with €234.56 pending */
  HIGH_PRECISION: {
    total: "123456", // €1234.56 in cents
    spendable: "100000", // €1000.00 in cents
    pending: "23456", // €234.56 in cents
  },

  /** Typical user balance - €2500 */
  TYPICAL: {
    total: "250000", // €2500.00 in cents
    spendable: "250000",
    pending: "0",
  },

  /** User with recent transaction pending - €1500 total, €50 pending */
  RECENT_TRANSACTION: {
    total: "150000", // €1500.00 in cents
    spendable: "145000", // €1450.00 in cents
    pending: "5000", // €50.00 in cents
  },
} as const;

/**
 * Helper function to mock account balances with a predefined scenario
 */
export async function mockAccountBalancesScenario(
  page: Page,
  testUser: TestUser,
  scenario: keyof typeof ACCOUNT_BALANCE_SCENARIOS,
): Promise<void> {
  await mockAccountBalances(page, testUser, ACCOUNT_BALANCE_SCENARIOS[scenario]);
}

/**
 * Helper function to convert euros to cents (string format for API)
 */
export function eurosToCents(euros: number): string {
  return Math.round(euros * 100).toString();
}

/**
 * Helper function to convert cents to euros for display
 */
export function centsToEuros(cents: string): number {
  return parseInt(cents, 10) / 100;
}

/**
 * Helper function to create balance data from euro amounts
 */
export function createBalanceFromEuros(totalEuros: number, pendingEuros: number = 0): AccountBalancesData {
  const total = eurosToCents(totalEuros);
  const pending = eurosToCents(pendingEuros);
  const spendable = eurosToCents(totalEuros - pendingEuros);

  return {
    total,
    spendable,
    pending,
  };
}

/**
 * Helper function to validate balance consistency
 */
export function validateBalances(balances: AccountBalancesData): boolean {
  const total = parseInt(balances.total, 10);
  const spendable = parseInt(balances.spendable, 10);
  const pending = parseInt(balances.pending, 10);

  // Total should equal spendable + pending
  return total === spendable + pending;
}
