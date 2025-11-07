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
 * the specified safe configuration data with the following priority order:
 * 1. testUser.safeConfig (from the test user definition)
 * 2. configOverrides (passed as parameter)
 * 3. fallback defaults (hardcoded sensible defaults)
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
 *   // Uses testUser.safeConfig, then falls back to defaults
 *   await mockSafeConfig({ page, testUser: TEST_USER_APPROVED });
 *
 *   // Uses testUser.safeConfig, then configOverrides, then defaults
 *   await mockSafeConfig({
 *     page,
 *     testUser: TEST_USER_APPROVED,
 *     configOverrides: {
 *       isDeployed: false,
 *       accountStatus: 1 // SafeNotDeployed
 *     }
 *   });
 *
 *   // Your test code here...
 * });
 * ```
 */
export async function mockSafeConfig({
  page,
  testUser,
  configOverrides,
}: {
  page: Page;
  testUser: TestUser;
  configOverrides?: SafeConfigMockData;
}): Promise<void> {
  await page.route("**/api/v1/safe/config", async (route) => {
    const request = route.request();

    if (request.method() === "GET") {
      try {
        // Create fallback default config
        const fallbackDefaults: SafeConfig = {
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

        // Priority order: testUser.safeConfig > configOverrides > fallbackDefaults
        const finalConfig: SafeConfig = {
          ...fallbackDefaults,
          ...testUser.safeConfig,
          ...configOverrides,
          // Handle accountAllowance merging with proper priority
          accountAllowance: {
            ...fallbackDefaults.accountAllowance,
            ...(testUser.safeConfig?.accountAllowance || {}),
            ...(configOverrides?.accountAllowance || {}),
          },
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
