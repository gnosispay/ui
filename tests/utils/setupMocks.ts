import type { Page } from "@playwright/test";
import type { TestUser } from "./testUsers";
import { mockAuthChallenge, type MockAuthChallengeOptions } from "./mockAuthChallenge";
import { mockUser } from "./mockUser";
import { mockSafeConfig, type SafeConfigMockData } from "./mockSafeConfig";
import { mockRewards, type RewardsMockData } from "./mockRewards";
import { mockAccountBalances, type AccountBalancesMockData } from "./mockAccountBalances";
import { mockCards, type CardsMockData, type CardStatusData } from "./mockCards";
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
  /** Optional overrides for card status mock */
  cardStatus?: Record<string, CardStatusData>;
  /** Optional overrides for delay relay mock */
  delayRelay?: DelayRelayMockData;
  /** Optional overrides for orders mock */
  orders?: OrderMockData;
  /** Optional overrides for IBAN availability mock */
  ibansAvailable?: IbansAvailableMockData;
  /** Optional overrides for card transactions mock */
  cardTransactions?: CardTransactionsMockData;
  /** Skip auth challenge mock (useful when setting up custom auth flow) */
  skipAuthChallenge?: boolean;
  /** Skip user mock (useful when setting up custom user data) */
  skipUser?: boolean;
  /** Skip safe config mock (useful when setting up custom safe configuration) */
  skipSafeConfig?: boolean;
  /** Skip rewards mock (useful when setting up custom rewards data) */
  skipRewards?: boolean;
  /** Skip account balances mock (useful when setting up custom balance data) */
  skipAccountBalances?: boolean;
  /** Skip cards mock (useful when setting up custom card data) */
  skipCards?: boolean;
  /** Skip delay relay mock (useful when setting up custom relay data) */
  skipDelayRelay?: boolean;
  /** Skip orders mock (useful when setting up custom order data) */
  skipOrders?: boolean;
  /** Skip IBAN availability mock (useful when setting up custom IBAN data) */
  skipIbansAvailable?: boolean;
  /** Skip card transactions mock (useful when setting up custom pagination or transaction data) */
  skipCardTransactions?: boolean;
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
  const mockPromises: Promise<void>[] = [];

  if (!options.skipAuthChallenge) {
    mockPromises.push(mockAuthChallenge({ page, testUser, options: options.authChallenge }));
  }
  if (!options.skipUser) {
    mockPromises.push(mockUser({ page, testUser }));
  }
  if (!options.skipSafeConfig) {
    mockPromises.push(mockSafeConfig({ page, testUser, configOverrides: options.safeConfig }));
  }
  if (!options.skipRewards) {
    mockPromises.push(mockRewards({ page, testUser, rewardsOverrides: options.rewards }));
  }
  if (!options.skipAccountBalances) {
    mockPromises.push(mockAccountBalances({ page, testUser, balancesOverrides: options.accountBalances }));
  }
  if (!options.skipCards) {
    mockPromises.push(
      mockCards({ page, testUser, cardsOverrides: options.cards, cardStatusOverrides: options.cardStatus }),
    );
  }
  if (!options.skipDelayRelay) {
    mockPromises.push(mockDelayRelay({ page, testUser, delayRelayOverrides: options.delayRelay }));
  }
  if (!options.skipOrders) {
    mockPromises.push(mockOrder({ page, testUser, orderOverrides: options.orders }));
  }
  if (!options.skipIbansAvailable) {
    mockPromises.push(mockIbansAvailable({ page, testUser, ibansAvailableOverrides: options.ibansAvailable }));
  }
  if (!options.skipCardTransactions) {
    mockPromises.push(mockCardTransactions({ page, testUser, transactionsOverrides: options.cardTransactions }));
  }

  await Promise.all(mockPromises);
}
