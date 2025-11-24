import type { Page } from "@playwright/test";
import type {
  GetApiV1UserTermsResponse,
  PostApiV1UserTermsResponse,
  PostApiV1UserTermsError,
} from "../../src/client/types.gen";

/**
 * Configuration for mocking the user terms endpoints
 */
export interface UserTermsMockOptions {
  /** Whether GET should return an error */
  getIsError?: boolean;
  /** Whether POST should return an error */
  postIsError?: boolean;
  /** Custom GET response */
  getResponse?: GetApiV1UserTermsResponse;
  /** Custom POST response */
  postResponse?: PostApiV1UserTermsResponse;
  /** Custom POST error response */
  postErrorResponse?: PostApiV1UserTermsError;
}

/**
 * Sets up mocks for the `/api/v1/user/terms` endpoints in Playwright tests.
 *
 * This function intercepts GET and POST requests to the user terms endpoint
 * and returns appropriate responses based on the configuration.
 *
 * @param page - The Playwright page instance
 * @param options - Configuration options for the mock
 *
 * @example
 * ```typescript
 * import { mockUserTerms } from "./utils/mockUserTerms";
 *
 * test("user accepts terms", async ({ page }) => {
 *   await mockUserTerms(page, {
 *     getResponse: {
 *       terms: [
 *         {
 *           type: "general-tos",
 *           currentVersion: "1.0",
 *           accepted: false,
 *           acceptedVersion: null,
 *           acceptedAt: null
 *         }
 *       ]
 *     }
 *   });
 * });
 * ```
 */
export async function mockUserTerms(page: Page, options: UserTermsMockOptions = {}): Promise<void> {
  const { getIsError = false, postIsError = false, getResponse, postResponse, postErrorResponse } = options;

  // Default GET response - all terms already accepted
  const defaultGetResponse: GetApiV1UserTermsResponse = {
    terms: [
      {
        type: "general-tos",
        currentVersion: "1.0",
        accepted: true,
        acceptedVersion: "1.0",
        acceptedAt: new Date().toISOString(),
      },
      {
        type: "card-monavate-tos",
        currentVersion: "1.0",
        accepted: true,
        acceptedVersion: "1.0",
        acceptedAt: new Date().toISOString(),
      },
      {
        type: "privacy-policy",
        currentVersion: "1.0",
        accepted: true,
        acceptedVersion: "1.0",
        acceptedAt: new Date().toISOString(),
      },
    ],
  };

  const finalGetResponse = getResponse || defaultGetResponse;

  // Default POST response - success
  const defaultPostResponse: PostApiV1UserTermsResponse = {
    ok: true,
  };

  const finalPostResponse = postResponse || defaultPostResponse;

  // Default POST error response
  const defaultPostErrorResponse: PostApiV1UserTermsError = {
    message: "Validation error",
  } as PostApiV1UserTermsError;

  const finalPostErrorResponse = postErrorResponse || defaultPostErrorResponse;

  await page.route("**/api/v1/user/terms", async (route) => {
    const method = route.request().method();

    if (method === "GET") {
      if (getIsError) {
        await route.fulfill({
          status: 500,
          contentType: "application/json",
          body: JSON.stringify({ message: "Internal server error" }),
        });
      } else {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(finalGetResponse),
        });
      }
    } else if (method === "POST") {
      if (postIsError) {
        await route.fulfill({
          status: 422,
          contentType: "application/json",
          body: JSON.stringify(finalPostErrorResponse),
        });
      } else {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(finalPostResponse),
        });
      }
    } else {
      await route.continue();
    }
  });
}
