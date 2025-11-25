import type { Page } from "@playwright/test";
import type {
  GetApiV1KycIntegrationResponse,
  GetApiV1KycIntegrationError,
  GetApiV1KycIntegrationErrors,
} from "../../src/client/types.gen";

/**
 * Valid error status codes for the KYC integration endpoint
 */
type KycIntegrationErrorStatus = keyof GetApiV1KycIntegrationErrors;

/**
 * Configuration for mocking the KYC integration endpoint
 */
export interface KycIntegrationMockOptions {
  /** Whether the API should return an error */
  isError?: boolean;
  /** Custom error response (only used if isError is true) */
  errorResponse?: GetApiV1KycIntegrationError;
  /** Custom success response (only used if isError is false) */
  successResponse?: GetApiV1KycIntegrationResponse;
  /** Custom error status code (default: 500). Must be one of: 401, 409, 500 */
  errorStatus?: KycIntegrationErrorStatus;
  /** Custom KYC URL for the iframe */
  kycUrl?: string;
}

/**
 * Sets up a mock for the GET `/api/v1/kyc/integration` endpoint in Playwright tests.
 *
 * This function intercepts GET requests to the KYC integration endpoint
 * and returns either a success (200) or error response based on the configuration.
 *
 * @param page - The Playwright page instance
 * @param options - Configuration options for the mock
 *
 * @example
 * ```typescript
 * import { mockKycIntegration } from "./utils/mockKycIntegration";
 *
 * test("successful KYC integration", async ({ page }) => {
 *   await mockKycIntegration(page, {
 *     kycUrl: "https://sumsub.example.com/kyc-flow"
 *   });
 * });
 *
 * test("KYC integration error - already approved", async ({ page }) => {
 *   await mockKycIntegration(page, {
 *     isError: true,
 *     errorStatus: 409,
 *     errorResponse: { message: "The user has already been approved" }
 *   });
 * });
 * ```
 */
export async function mockKycIntegration(page: Page, options: KycIntegrationMockOptions = {}): Promise<void> {
  const { isError = false, errorResponse, successResponse, errorStatus = 500, kycUrl } = options;

  // Create default success response if not provided
  const defaultSuccessResponse: GetApiV1KycIntegrationResponse = {
    type: "SUMSUB_WEB",
    url: kycUrl || "https://mock-sumsub.example.com/kyc-flow",
  };

  const finalSuccessResponse = successResponse || defaultSuccessResponse;

  // Create default error response if not provided
  const defaultErrorResponse: GetApiV1KycIntegrationError = {
    message: "Internal server error",
  } as GetApiV1KycIntegrationError;

  const finalErrorResponse = errorResponse || defaultErrorResponse;

  await page.route("**/api/v1/kyc/integration", async (route) => {
    if (route.request().method() === "GET") {
      if (isError) {
        await route.fulfill({
          status: errorStatus,
          contentType: "application/json",
          body: JSON.stringify(finalErrorResponse),
        });
      } else {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(finalSuccessResponse),
        });
      }
    } else {
      await route.continue();
    }
  });
}
