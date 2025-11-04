import type { Page } from "@playwright/test";
import type { SafeConfig, AccountIntegrityStatus, AccountAllowance } from "../../src/client/types.gen";
import type { TestUser } from "./testUsers";

/**
 * Configuration for mocking SafeConfig responses
 */
export interface SafeConfigMockData {
  /** Whether the safe has no approvals */
  hasNoApprovals?: boolean;
  /** Whether the safe is deployed */
  isDeployed?: boolean;
  /** The safe address (defaults to user's safe address) */
  address?: string | null;
  /** Token symbol (defaults to "EURe") */
  tokenSymbol?: string | null;
  /** Fiat symbol (defaults to "EUR") */
  fiatSymbol?: string | null;
  /** Account integrity status */
  accountStatus?: AccountIntegrityStatus;
  /** Account allowance configuration */
  accountAllowance?: AccountAllowance;
}

/**
 * Sets up a mock for the `/api/v1/safe/config` endpoint in Playwright tests.
 *
 * This function intercepts GET requests to the safe config endpoint and returns
 * the specified safe configuration data.
 *
 * @param page - The Playwright page instance
 * @param testUser - The test user whose safe config to mock
 * @param configOverrides - Optional overrides for the safe config
 *
 * @example
 * ```typescript
 * import { mockSafeConfig } from "./utils/mockSafeConfig";
 * import { TEST_USER_APPROVED } from "./utils/testUsers";
 *
 * test("safe config display", async ({ page }) => {
 *   // Set up the safe config mock with default values
 *   await mockSafeConfig(page, TEST_USER_APPROVED);
 *
 *   // Or with custom overrides
 *   await mockSafeConfig(page, TEST_USER_APPROVED, {
 *     isDeployed: false,
 *     accountStatus: 1 // SafeNotDeployed
 *   });
 *
 *   // Your test code here...
 * });
 * ```
 */
export async function mockSafeConfig(
  page: Page,
  testUser: TestUser,
  configOverrides?: SafeConfigMockData,
): Promise<void> {
  await page.route("**/api/v1/safe/config", async (route) => {
    const request = route.request();

    if (request.method() === "GET") {
      try {
        // Create default safe config based on test user
        const defaultConfig: SafeConfig = {
          hasNoApprovals: false,
          isDeployed: true,
          address: testUser.safeAddress,
          tokenSymbol: "EURe",
          fiatSymbol: "EUR",
          accountStatus: 0, // Ok
          accountAllowance: {
            balance: "1000.00",
            refill: "500.00",
            period: "86400", // 24 hours in seconds
            nextRefill: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          },
        };

        // Apply any overrides
        const finalConfig: SafeConfig = {
          ...defaultConfig,
          ...configOverrides,
          // If accountAllowance is provided in overrides, merge it with defaults
          ...(configOverrides?.accountAllowance && {
            accountAllowance: {
              ...defaultConfig.accountAllowance,
              ...configOverrides.accountAllowance,
            },
          }),
        };

        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(finalConfig),
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
 * Predefined safe config scenarios for common test cases
 */
export const SAFE_CONFIG_SCENARIOS = {
  /** Fully deployed and configured safe */
  DEPLOYED: {
    hasNoApprovals: false,
    isDeployed: true,
    accountStatus: 0 as AccountIntegrityStatus, // Ok
    accountAllowance: {
      balance: "1000.00",
      refill: "500.00",
      period: "86400",
      nextRefill: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    },
  },

  /** Safe not yet deployed */
  NOT_DEPLOYED: {
    hasNoApprovals: true,
    isDeployed: false,
    address: null,
    accountStatus: 1 as AccountIntegrityStatus, // SafeNotDeployed
    accountAllowance: undefined,
  },

  /** Safe deployed but misconfigured */
  MISCONFIGURED: {
    hasNoApprovals: false,
    isDeployed: true,
    accountStatus: 2 as AccountIntegrityStatus, // SafeMisconfigured
    accountAllowance: {
      balance: "0.00",
      refill: "0.00",
      period: "0",
      nextRefill: null,
    },
  },

  /** Safe with roles not deployed */
  ROLES_NOT_DEPLOYED: {
    hasNoApprovals: false,
    isDeployed: true,
    accountStatus: 3 as AccountIntegrityStatus, // RolesNotDeployed
    accountAllowance: undefined,
  },

  /** Safe with roles misconfigured */
  ROLES_MISCONFIGURED: {
    hasNoApprovals: false,
    isDeployed: true,
    accountStatus: 4 as AccountIntegrityStatus, // RolesMisconfigured
    accountAllowance: {
      balance: "100.00",
      refill: "50.00",
      period: "86400",
      nextRefill: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
    },
  },

  /** Safe with delay not deployed */
  DELAY_NOT_DEPLOYED: {
    hasNoApprovals: false,
    isDeployed: true,
    accountStatus: 5 as AccountIntegrityStatus, // DelayNotDeployed
    accountAllowance: undefined,
  },

  /** Safe with delay misconfigured */
  DELAY_MISCONFIGURED: {
    hasNoApprovals: false,
    isDeployed: true,
    accountStatus: 6 as AccountIntegrityStatus, // DelayMisconfigured
    accountAllowance: {
      balance: "250.00",
      refill: "100.00",
      period: "43200", // 12 hours
      nextRefill: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
    },
  },

  /** Safe with non-empty delay queue */
  DELAY_QUEUE_NOT_EMPTY: {
    hasNoApprovals: false,
    isDeployed: true,
    accountStatus: 7 as AccountIntegrityStatus, // DelayQueueNotEmpty
    accountAllowance: {
      balance: "750.00",
      refill: "300.00",
      period: "86400",
      nextRefill: new Date(Date.now() + 18 * 60 * 60 * 1000).toISOString(),
    },
  },

  /** Safe with unexpected error */
  UNEXPECTED_ERROR: {
    hasNoApprovals: false,
    isDeployed: true,
    accountStatus: 8 as AccountIntegrityStatus, // UnexpectedError
    accountAllowance: undefined,
  },

  /** Safe with low balance */
  LOW_BALANCE: {
    hasNoApprovals: false,
    isDeployed: true,
    accountStatus: 0 as AccountIntegrityStatus, // Ok
    accountAllowance: {
      balance: "25.50",
      refill: "500.00",
      period: "86400",
      nextRefill: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours
    },
  },

  /** Safe with no allowance */
  NO_ALLOWANCE: {
    hasNoApprovals: false,
    isDeployed: true,
    accountStatus: 0 as AccountIntegrityStatus, // Ok
    accountAllowance: {
      balance: "0.00",
      refill: "0.00",
      period: "0",
      nextRefill: null,
    },
  },
} as const;

/**
 * Helper function to mock safe config with a predefined scenario
 */
export async function mockSafeConfigScenario(
  page: Page,
  testUser: TestUser,
  scenario: keyof typeof SAFE_CONFIG_SCENARIOS,
): Promise<void> {
  await mockSafeConfig(page, testUser, SAFE_CONFIG_SCENARIOS[scenario]);
}
