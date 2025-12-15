import type { Page } from "@playwright/test";
import type { TestUser } from "./testUsers";
import { USER_TEST_SIGNER_ADDRESS } from "./testUsers";

/**
 * Configuration for mocking Owners responses
 */
export interface OwnersMockData {
  /** List of owner addresses (defaults to test user's signer address) */
  owners?: string[];
}

/**
 * Sets up a mock for the `/api/v1/owners` endpoint in Playwright tests.
 *
 * This function intercepts GET requests to the owners endpoint and returns
 * the specified owners list. By default, it includes the test user's signer address
 * to ensure the connected wallet is recognized as a Safe owner.
 *
 * @param page - The Playwright page instance
 * @param testUser - The test user whose signer address to include
 * @param ownersOverrides - Optional overrides for the owners list
 *
 * @example
 * ```typescript
 * import { mockOwners } from "./utils/mockOwners";
 * import { BASE_USER } from "./utils/testUsers";
 *
 * test("safe owners display", async ({ page }) => {
 *   // Uses test user's signer address as default owner
 *   await mockOwners({ page, testUser: BASE_USER });
 *
 *   // With custom owners list
 *   await mockOwners({
 *     page,
 *     testUser: BASE_USER,
 *     ownersOverrides: {
 *       owners: ["0x123...", "0x456..."]
 *     }
 *   });
 *
 *   // Your test code here...
 * });
 * ```
 */
export async function mockOwners({
  page,
  testUser,
  ownersOverrides,
}: {
  page: Page;
  testUser: TestUser;
  ownersOverrides?: OwnersMockData;
}): Promise<void> {
  await page.route("**/api/v1/owners", async (route) => {
    const request = route.request();

    if (request.method() === "GET") {
      try {
        // Default owners list includes the test user's signer address
        // This ensures the connected wallet is recognized as a Safe owner
        const defaultOwners = [testUser.signerAddress || USER_TEST_SIGNER_ADDRESS];

        // Priority order: ownersOverrides > defaultOwners
        const finalOwners = ownersOverrides?.owners || defaultOwners;

        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            data: {
              owners: finalOwners,
            },
          }),
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
