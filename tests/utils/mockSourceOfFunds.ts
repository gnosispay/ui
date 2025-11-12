import type { Page } from "@playwright/test";
import type {
  GetApiV1SourceOfFundsResponse,
  PostApiV1SourceOfFundsResponse,
  PostApiV1SourceOfFundsError,
  PostApiV1SourceOfFundsErrors,
  KycQuestion,
} from "../../src/client/types.gen";

/**
 * Valid error status codes for the source of funds POST endpoint
 */
type SourceOfFundsErrorStatus = keyof PostApiV1SourceOfFundsErrors;

/**
 * Configuration for mocking the source of funds endpoints
 */
export interface SourceOfFundsMockOptions {
  /** Whether GET should return an error */
  getIsError?: boolean;
  /** Whether POST should return an error */
  postIsError?: boolean;
  /** Custom GET response (questions) */
  getResponse?: GetApiV1SourceOfFundsResponse;
  /** Custom POST response */
  postResponse?: PostApiV1SourceOfFundsResponse;
  /** Custom POST error response */
  postErrorResponse?: PostApiV1SourceOfFundsError;
  /** Custom POST error status code (default: 500). Must be one of: 401, 500 */
  postErrorStatus?: SourceOfFundsErrorStatus;
}

/**
 * Default source of funds questions for testing
 */
export const DEFAULT_SOURCE_OF_FUNDS_QUESTIONS: KycQuestion[] = [
  {
    question: "What is your primary source of funds?",
    answers: [
      "Employment income",
      "Business income",
      "Investment income",
      "Savings",
      "Inheritance",
      "Other",
    ],
  },
  {
    question: "What is your estimated annual income?",
    answers: [
      "Less than €25,000",
      "€25,000 - €50,000",
      "€50,000 - €100,000",
      "€100,000 - €250,000",
      "More than €250,000",
    ],
  },
];

/**
 * Sets up mocks for the `/api/v1/source-of-funds` endpoints in Playwright tests.
 *
 * This function intercepts GET and POST requests to the source of funds endpoint
 * and returns appropriate responses based on the configuration.
 *
 * @param page - The Playwright page instance
 * @param options - Configuration options for the mock
 *
 * @example
 * ```typescript
 * import { mockSourceOfFunds, DEFAULT_SOURCE_OF_FUNDS_QUESTIONS } from "./utils/mockSourceOfFunds";
 *
 * test("user answers source of funds questions", async ({ page }) => {
 *   await mockSourceOfFunds(page, {
 *     getResponse: DEFAULT_SOURCE_OF_FUNDS_QUESTIONS
 *   });
 * });
 *
 * test("source of funds submission error", async ({ page }) => {
 *   await mockSourceOfFunds(page, {
 *     postIsError: true,
 *     postErrorStatus: 401,
 *     postErrorResponse: { message: "Unauthorized" }
 *   });
 * });
 * ```
 */
export async function mockSourceOfFunds(page: Page, options: SourceOfFundsMockOptions = {}): Promise<void> {
  const {
    getIsError = false,
    postIsError = false,
    getResponse,
    postResponse,
    postErrorResponse,
    postErrorStatus = 500,
  } = options;

  // Default GET response - standard questions
  const defaultGetResponse: GetApiV1SourceOfFundsResponse = DEFAULT_SOURCE_OF_FUNDS_QUESTIONS;

  const finalGetResponse = getResponse || defaultGetResponse;

  // Default POST response - success
  const defaultPostResponse: PostApiV1SourceOfFundsResponse = {
    message: "Source of Funds answers submitted successfully",
  };

  const finalPostResponse = postResponse || defaultPostResponse;

  // Default POST error response
  const defaultPostErrorResponse: PostApiV1SourceOfFundsError = {
    message: "Internal server error",
  } as PostApiV1SourceOfFundsError;

  const finalPostErrorResponse = postErrorResponse || defaultPostErrorResponse;

  await page.route("**/api/v1/source-of-funds", async (route) => {
    const method = route.request().method();

    if (method === "GET") {
      if (getIsError) {
        await route.fulfill({
          status: 500,
          contentType: "application/json",
          body: JSON.stringify({ error: "Internal server error" }),
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
          status: postErrorStatus,
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

