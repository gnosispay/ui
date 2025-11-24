import type { Page } from "@playwright/test";
import type { GetApiV1UserResponses, User } from "../../src/client/types.gen";
import type { TestUser } from "./testUsers";

/**
 * User response type - derived from API types
 */
export type UserResponse = GetApiV1UserResponses[200];

/**
 * Sets up a mock for the `/api/v1/user` endpoint in Playwright tests.
 *
 * This function intercepts GET requests to the user endpoint and returns
 * the specified test user data. Calling this function multiple times will
 * override the previous mock with the new user data.
 *
 * @param page - The Playwright page instance
 * @param testUser - The predefined test user to return, or a User object directly
 *
 * @example
 * ```typescript
 * import { mockUser } from "./utils/mockUser";
 * import { TEST_USER_APPROVED } from "./utils/testUsers";
 *
 * test("user profile display", async ({ page }) => {
 *   // Set up the user mock with a predefined user
 *   await mockUser({ page, testUser: TEST_USER_APPROVED });
 *
 *   // Later, update the mock with a different user
 *   await mockUser({ page, testUser: ANOTHER_USER });
 * });
 * ```
 */
export async function mockUser({ page, testUser }: { page: Page; testUser: TestUser | User }): Promise<void> {
  await page.route("**/api/v1/user", async (route) => {
    const request = route.request();

    if (request.method() === "GET") {
      try {
        const user = "user" in testUser ? testUser.user : testUser;
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(user),
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

// Re-export test user for convenience
export {
  BASE_USER as BASED_USER,
  type TestUser,
} from "./testUsers";
