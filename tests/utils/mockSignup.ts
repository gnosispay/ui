import type { Page } from "@playwright/test";
import type {
  PostApiV1AuthSignupResponse,
  PostApiV1AuthSignupError,
  PostApiV1AuthSignupErrors,
} from "../../src/client/types.gen";

/**
 * Valid error status codes for the signup endpoint
 */
type SignupErrorStatus = keyof PostApiV1AuthSignupErrors;

/**
 * Configuration for mocking the signup endpoint
 */
export interface SignupMockOptions {
  /** Whether the API should return an error */
  isError?: boolean;
  /** Custom error response (only used if isError is true) */
  errorResponse?: PostApiV1AuthSignupError;
  /** Custom success response (only used if isError is false) */
  successResponse?: PostApiV1AuthSignupResponse;
  /** Custom error status code (default: 422). Must be one of: 400, 401, 409, 422, 500 */
  errorStatus?: SignupErrorStatus;
}

/**
 * Sets up a mock for the POST `/api/v1/auth/signup` endpoint in Playwright tests.
 *
 * This function intercepts POST requests to the signup endpoint
 * and returns either a success (201) or error response based on the configuration.
 *
 * @param page - The Playwright page instance
 * @param options - Configuration options for the mock
 *
 * @example
 * ```typescript
 * import { mockSignup } from "./utils/mockSignup";
 *
 * test("successful signup", async ({ page }) => {
 *   await mockSignup(page, {
 *     isError: false,
 *     successResponse: {
 *       id: "user-123",
 *       token: "jwt-token",
 *       hasSignedUp: true
 *     }
 *   });
 * });
 *
 * test("signup error - email already registered", async ({ page }) => {
 *   await mockSignup(page, {
 *     isError: true,
 *     errorStatus: 409,
 *     errorResponse: { error: "Email address already registered" }
 *   });
 * });
 * ```
 */
export async function mockSignup(page: Page, options: SignupMockOptions = {}): Promise<void> {
  const { isError = false, errorResponse, successResponse, errorStatus = 422 } = options;

  // Create default success response if not provided
  const defaultSuccessResponse: PostApiV1AuthSignupResponse = {
    id: "test-user-new",
    token: "mock-jwt-token-new-user",
    hasSignedUp: true,
  };

  const finalSuccessResponse = successResponse || defaultSuccessResponse;

  // Create default error response if not provided
  const defaultErrorResponse: PostApiV1AuthSignupError = {
    error: "Validation error",
  } as PostApiV1AuthSignupError;

  const finalErrorResponse = errorResponse || defaultErrorResponse;

  await page.route("**/api/v1/auth/signup", async (route) => {
    if (route.request().method() === "POST") {
      if (isError) {
        await route.fulfill({
          status: errorStatus,
          contentType: "application/json",
          body: JSON.stringify(finalErrorResponse),
        });
      } else {
        await route.fulfill({
          status: 201,
          contentType: "application/json",
          body: JSON.stringify(finalSuccessResponse),
        });
      }
    } else {
      await route.continue();
    }
  });
}
