import type { Page } from "@playwright/test";
import type {
  PostApiV1VerificationResponse,
  PostApiV1VerificationError,
  PostApiV1VerificationErrors,
  PostApiV1VerificationCheckResponse,
  PostApiV1VerificationCheckError,
  PostApiV1VerificationCheckErrors,
} from "../../src/client/types.gen";

/**
 * Valid error status codes for the phone verification endpoints
 */
type VerificationErrorStatus = keyof PostApiV1VerificationErrors;
type VerificationCheckErrorStatus = keyof PostApiV1VerificationCheckErrors;

/**
 * Configuration for mocking the phone verification endpoints
 */
export interface PhoneVerificationMockOptions {
  /** Whether POST /verification should return an error */
  sendIsError?: boolean;
  /** Whether POST /verification/check should return an error */
  checkIsError?: boolean;
  /** Custom send OTP response */
  sendResponse?: PostApiV1VerificationResponse;
  /** Custom check OTP response */
  checkResponse?: PostApiV1VerificationCheckResponse;
  /** Custom send OTP error response */
  sendErrorResponse?: PostApiV1VerificationError;
  /** Custom check OTP error response */
  checkErrorResponse?: PostApiV1VerificationCheckError;
  /** Custom send OTP error status code (default: 422). Must be one of: 401, 404, 422, 429, 500 */
  sendErrorStatus?: VerificationErrorStatus;
  /** Custom check OTP error status code (default: 422). Must be one of: 401, 422, 500 */
  checkErrorStatus?: VerificationCheckErrorStatus;
}

/**
 * Sets up mocks for the phone verification endpoints in Playwright tests.
 *
 * This function intercepts POST requests to `/api/v1/verification` (send OTP)
 * and `/api/v1/verification/check` (verify OTP) endpoints.
 *
 * @param page - The Playwright page instance
 * @param options - Configuration options for the mock
 *
 * @example
 * ```typescript
 * import { mockPhoneVerification } from "./utils/mockPhoneVerification";
 *
 * test("successful phone verification", async ({ page }) => {
 *   await mockPhoneVerification(page);
 * });
 *
 * test("phone verification error - invalid phone", async ({ page }) => {
 *   await mockPhoneVerification(page, {
 *     sendIsError: true,
 *     sendErrorStatus: 422,
 *     sendErrorResponse: { error: "Invalid phone number" }
 *   });
 * });
 *
 * test("OTP check error - verification failed", async ({ page }) => {
 *   await mockPhoneVerification(page, {
 *     checkIsError: true,
 *     checkErrorStatus: 422,
 *     checkErrorResponse: { error: "Verification failed" }
 *   });
 * });
 * ```
 */
export async function mockPhoneVerification(page: Page, options: PhoneVerificationMockOptions = {}): Promise<void> {
  const {
    sendIsError = false,
    checkIsError = false,
    sendResponse,
    checkResponse,
    sendErrorResponse,
    checkErrorResponse,
    sendErrorStatus = 422,
    checkErrorStatus = 422,
  } = options;

  // Default send OTP response - success
  const defaultSendResponse: PostApiV1VerificationResponse = {
    ok: true,
  };

  const finalSendResponse = sendResponse || defaultSendResponse;

  // Default check OTP response - success
  const defaultCheckResponse: PostApiV1VerificationCheckResponse = {
    ok: true,
  };

  const finalCheckResponse = checkResponse || defaultCheckResponse;

  // Default send OTP error response
  const defaultSendErrorResponse: PostApiV1VerificationError = {
    error: "Invalid phone number",
  } as PostApiV1VerificationError;

  const finalSendErrorResponse = sendErrorResponse || defaultSendErrorResponse;

  // Default check OTP error response
  const defaultCheckErrorResponse: PostApiV1VerificationCheckError = {
    error: "Verification failed",
  } as PostApiV1VerificationCheckError;

  const finalCheckErrorResponse = checkErrorResponse || defaultCheckErrorResponse;

  // Mock send OTP endpoint
  await page.route("**/api/v1/verification", async (route) => {
    if (route.request().method() === "POST") {
      if (sendIsError) {
        await route.fulfill({
          status: sendErrorStatus,
          contentType: "application/json",
          body: JSON.stringify(finalSendErrorResponse),
        });
      } else {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(finalSendResponse),
        });
      }
    } else {
      await route.continue();
    }
  });

  // Mock check OTP endpoint
  await page.route("**/api/v1/verification/check", async (route) => {
    if (route.request().method() === "POST") {
      if (checkIsError) {
        await route.fulfill({
          status: checkErrorStatus,
          contentType: "application/json",
          body: JSON.stringify(finalCheckErrorResponse),
        });
      } else {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(finalCheckResponse),
        });
      }
    } else {
      await route.continue();
    }
  });
}

