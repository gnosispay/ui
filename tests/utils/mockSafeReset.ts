import type { Page } from "@playwright/test";
import type { DeleteApiV1SafeResetResponse, DeleteApiV1SafeResetErrors } from "../../src/client/types.gen";

/**
 * Valid error status codes for the safe reset endpoint
 */
export type SafeResetErrorStatus = keyof DeleteApiV1SafeResetErrors;

/**
 * Configuration for mocking the safe reset endpoint
 */
export interface SafeResetMockOptions {
  /** Whether the API should return an error */
  isError?: boolean;
  /** Custom error status code (default: 500). Must be one of: 401, 404, 422, 500 */
  errorStatus?: SafeResetErrorStatus;
  /** Custom error message (only used if isError is true) */
  errorMessage?: string;
  /** Custom success message (only used if isError is false) */
  successMessage?: string;
}

/**
 * Predefined error scenarios for the safe reset endpoint
 */
export const SAFE_RESET_ERROR_SCENARIOS = {
  /** 422 - Active card exists */
  activeCardExists: {
    isError: true,
    errorStatus: 422 as SafeResetErrorStatus,
    errorMessage: "Cannot reset Safe account: active card exists. Please cancel your card first.",
  },
} as const;

/**
 * Sets up a mock for the DELETE `/api/v1/safe/reset` endpoint in Playwright tests.
 *
 * This function intercepts DELETE requests to the safe reset endpoint
 * and returns either a success (200) or error response based on the configuration.
 *
 * @param page - The Playwright page instance
 * @param options - Configuration options for the mock
 *
 * @example
 * ```typescript
 * import { mockSafeReset, SAFE_RESET_ERROR_SCENARIOS } from "./utils/mockSafeReset";
 *
 * test("successful safe reset", async ({ page }) => {
 *   await mockSafeReset(page);
 *   // ... test success flow
 * });
 *
 * test("safe reset error - active card exists", async ({ page }) => {
 *   await mockSafeReset(page, SAFE_RESET_ERROR_SCENARIOS.activeCardExists);
 *   // ... test error flow
 * });
 * ```
 */
export async function mockSafeReset(page: Page, options: SafeResetMockOptions = {}): Promise<void> {
  const { isError = false, errorStatus = 500, errorMessage, successMessage } = options;

  // Create default success response
  const defaultSuccessResponse: DeleteApiV1SafeResetResponse = {
    message: successMessage || "Safe account reset successfully",
  };

  // Create error response
  const errorResponse: DeleteApiV1SafeResetErrors[SafeResetErrorStatus] = {
    message: errorMessage || "An error occurred",
  };

  await page.route("**/api/v1/safe/reset", async (route) => {
    if (route.request().method() === "DELETE") {
      if (isError) {
        await route.fulfill({
          status: errorStatus,
          contentType: "application/json",
          body: JSON.stringify(errorResponse),
        });
      } else {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(defaultSuccessResponse),
        });
      }
    } else {
      await route.continue();
    }
  });
}
