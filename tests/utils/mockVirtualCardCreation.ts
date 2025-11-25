import type { Page } from "@playwright/test";
import type {
  PostApiV1CardsVirtualResponse,
  PostApiV1CardsVirtualError,
  PostApiV1CardsVirtualErrors,
} from "../../src/client/types.gen";

/**
 * Valid error status codes for the virtual card creation endpoint
 */
type VirtualCardErrorStatus = keyof PostApiV1CardsVirtualErrors;

/**
 * Configuration for mocking the virtual card creation endpoint
 */
export interface VirtualCardCreationMockOptions {
  /** Whether the API should return an error */
  isError?: boolean;
  /** Custom error response (only used if isError is true) */
  errorResponse?: PostApiV1CardsVirtualError;
  /** Custom success response (only used if isError is false) */
  successResponse?: PostApiV1CardsVirtualResponse;
  /** Custom error status code (default: 422). Must be one of: 401, 409, 422, 500 */
  errorStatus?: VirtualCardErrorStatus;
}

/**
 * Sets up a mock for the POST `/api/v1/cards/virtual` endpoint in Playwright tests.
 *
 * This function intercepts POST requests to the virtual card creation endpoint
 * and returns either a success (201) or error response based on the configuration.
 *
 * @param page - The Playwright page instance
 * @param options - Configuration options for the mock
 *
 * @example
 * ```typescript
 * import { mockVirtualCardCreation } from "./utils/mockVirtualCardCreation";
 *
 * test("successful card creation", async ({ page }) => {
 *   // Mock successful card creation
 *   await mockVirtualCardCreation(page, { isError: false });
 *
 *   // Your test code here...
 * });
 *
 * test("card creation error", async ({ page }) => {
 *   // Mock error response
 *   await mockVirtualCardCreation(page, {
 *     isError: true,
 *     errorResponse: { error: "Card limit exceeded" }
 *   });
 *
 *   // Your test code here...
 * });
 * ```
 */
export async function mockVirtualCardCreation(page: Page, options: VirtualCardCreationMockOptions = {}): Promise<void> {
  const { isError = false, errorResponse, successResponse, errorStatus = 422 } = options;

  // Create default success response if not provided (201 with cardId)
  const defaultSuccessResponse: PostApiV1CardsVirtualResponse = {
    cardId: "card-virtual-new",
  };

  const finalSuccessResponse = successResponse || defaultSuccessResponse;

  // Create default error response if not provided (422 - Unprocessable Entity)
  // This is used for validation errors like card limit exceeded
  const defaultErrorResponse: PostApiV1CardsVirtualError = undefined as unknown;

  const finalErrorResponse = errorResponse || defaultErrorResponse;

  await page.route("**/api/v1/cards/virtual", async (route) => {
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
