import type { Page } from "@playwright/test";
import type { TestUser } from "./testUsers";
import { mockAuthChallenge, type MockAuthChallengeOptions } from "./mockAuthChallenge";
import { mockUser } from "./mockUser";
import { mockSafeConfig, type SafeConfigMockData } from "./mockSafeConfig";
import { mockRewards, type RewardsMockData } from "./mockRewards";
import { mockAccountBalances, type AccountBalancesMockData } from "./mockAccountBalances";
import { mockCards, type CardsMockData } from "./mockCards";
import { mockDelayRelay, type DelayRelayMockData } from "./mockDelayRelay";
import { mockOrder, type OrderMockData } from "./mockOrder";
import { mockIbansAvailable, type IbansAvailableMockData } from "./mockIbansAvailable";
import { mockCardTransactions, type CardTransactionsMockData } from "./mockCardTransactions";

/**
 * Configuration options for setting up all API mocks
 */
export interface MockSetupOptions {
  /** Optional overrides for auth challenge mock */
  authChallenge?: MockAuthChallengeOptions;
  /** Optional overrides for safe config mock */
  safeConfig?: SafeConfigMockData;
  /** Optional overrides for rewards mock */
  rewards?: RewardsMockData;
  /** Optional overrides for account balances mock */
  accountBalances?: AccountBalancesMockData;
  /** Optional overrides for cards mock */
  cards?: CardsMockData;
  /** Optional overrides for delay relay mock */
  delayRelay?: DelayRelayMockData;
  /** Optional overrides for orders mock */
  orders?: OrderMockData;
  /** Optional overrides for IBAN availability mock */
  ibansAvailable?: IbansAvailableMockData;
  /** Optional overrides for card transactions mock */
  cardTransactions?: CardTransactionsMockData;
}

/**
 * Sets up all API mocks for a test user with optional overrides.
 *
 * This utility function configures all the necessary API endpoint mocks
 * for a complete test scenario, using the test user's data as the base
 * and applying any provided overrides.
 *
 * @param page - The Playwright page instance
 * @param testUser - The test user whose data to use for mocking
 * @param options - Optional overrides for specific mock configurations
 *
 * @example
 * ```typescript
 * import { setupAllMocks } from "./utils/setupMocks";
 * import { TEST_USER_APPROVED } from "./utils/testUsers";
 *
 * test("user dashboard", async ({ page }) => {
 *   // Set up all mocks with default test user data
 *   await setupAllMocks(page, TEST_USER_APPROVED);
 *
 *   // Your test code here...
 * });
 *
 * test("user with low balance", async ({ page }) => {
 *   // Set up mocks with custom balance override
 *   await setupAllMocks(page, TEST_USER_APPROVED, {
 *     accountBalances: {
 *       total: "5000", // €50.00 in cents
 *       spendable: "5000",
 *       pending: "0"
 *     }
 *   });
 *
 *   // Your test code here...
 * });
 *
 * test("user with undeployed safe", async ({ page }) => {
 *   // Set up mocks with safe config override
 *   await setupAllMocks(page, TEST_USER_APPROVED, {
 *     safeConfig: {
 *       isDeployed: false,
 *       accountStatus: 1 // SafeNotDeployed
 *     }
 *   });
 *
 *   // Your test code here...
 * });
 * ```
 */
export async function setupAllMocks(page: Page, testUser: TestUser, options: MockSetupOptions = {}): Promise<void> {
  // Set up all API mocks in parallel for better performance
  await Promise.all([
    mockAuthChallenge({ page, testUser, options: options.authChallenge }),
    mockUser({ page, testUser }),
    mockSafeConfig({ page, testUser, configOverrides: options.safeConfig }),
    mockRewards({ page, testUser, rewardsOverrides: options.rewards }),
    mockAccountBalances({ page, testUser, balancesOverrides: options.accountBalances }),
    mockCards({ page, testUser, cardsOverrides: options.cards }),
    mockDelayRelay({ page, testUser, delayRelayOverrides: options.delayRelay }),
    mockOrder({ page, testUser, orderOverrides: options.orders }),
    mockIbansAvailable({ page, testUser, ibansAvailableOverrides: options.ibansAvailable }),
    mockCardTransactions({ page, testUser, transactionsOverrides: options.cardTransactions }),
  ]);
}
