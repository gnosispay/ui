import type { Page } from "@playwright/test";
import type { GetApiV1IbansAvailableResponses } from "../../src/client/types.gen";
import type { TestUser } from "./testUsers";

/**
 * IBAN availability response structure - derived from API types
 */
export type IbansAvailableResponse = GetApiV1IbansAvailableResponses[200];

/**
 * IBAN availability data structure - derived from API types
 */
export type IbansAvailableData = IbansAvailableResponse["data"];

/**
 * Configuration for mocking IbansAvailable responses
 */
export interface IbansAvailableMockData extends IbansAvailableData {}

/**
 * Sets up a mock for the `/api/v1/ibans/available` endpoint in Playwright tests.
 *
 * This function intercepts GET requests to the ibans available endpoint and returns
 * the specified availability data.
 *
 * @param page - The Playwright page instance
 * @param testUser - The test user whose IBAN availability to mock
 * @param ibansAvailableOverrides - Optional overrides for the IBAN availability data
 *
 * @example
 * ```typescript
 * import { mockIbansAvailable } from "./utils/mockIbansAvailable";
 * import { TEST_USER_APPROVED } from "./utils/testUsers";
 *
 * test("IBAN availability display", async ({ page }) => {
 *   // Set up the IBAN availability mock with default values
 *   await mockIbansAvailable(page, TEST_USER_APPROVED);
 *
 *   // Or with custom overrides
 *   await mockIbansAvailable(page, TEST_USER_APPROVED, {
 *     available: false
 *   });
 *
 *   // Your test code here...
 * });
 * ```
 */
export async function mockIbansAvailable({
  page,
  testUser,
  ibansAvailableOverrides,
}: {
  page: Page;
  testUser: TestUser;
  ibansAvailableOverrides?: IbansAvailableMockData;
}): Promise<void> {
  await page.route("**/api/v1/ibans/available", async (route) => {
    const request = route.request();

    if (request.method() === "GET") {
      try {
        // Create default IBAN availability based on test user
        const defaultAvailability: IbansAvailableData = {
          available: true, // Default to available
        };

        // Apply any overrides
        const finalAvailability: IbansAvailableData = {
          ...defaultAvailability,
          ...testUser.ibansAvailable,
          ...ibansAvailableOverrides,
        };

        // Wrap in the expected response structure
        const response: IbansAvailableResponse = {
          data: finalAvailability,
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
  });
}

/**
 * Predefined IBAN availability scenarios for common test cases
 */
export const IBANS_AVAILABLE_SCENARIOS = {
  /** User is eligible for IBAN */
  AVAILABLE: {
    available: true,
  },

  /** User is not eligible for IBAN */
  NOT_AVAILABLE: {
    available: false,
  },
} as const;
