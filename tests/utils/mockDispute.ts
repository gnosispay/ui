import type { Page, Route } from "@playwright/test";
import type { PostApiV1TransactionsByThreadIdDisputeData } from "../../src/client/types.gen";

/**
 * Type for dispute reason keys from the API
 */
type DisputeReason = PostApiV1TransactionsByThreadIdDisputeData["body"]["disputeReason"];

/**
 * Mock dispute reasons response - matches the API structure
 */
export const mockDisputeReasons: Record<DisputeReason, string> = {
  purchase_cancelled_but_no_refund_received: "Purchase cancelled but no refund received",
  problem_with_the_product_chargeback_: "Problem with the product (chargeback)",
  problem_with_service_subscription_chargeback: "Problem with service/subscription (chargeback)",
  wrong_installment_number: "Wrong installment number",
  wrong_value: "Wrong value",
  charged_more_than_once: "Charged more than once",
  unrecognized_transaction_report_fraudulent: "Unrecognized transaction (report fraudulent)",
};

/**
 * Sets up a mock for the `/api/v1/transactions/dispute` endpoint (GET - list dispute reasons)
 *
 * @param page - The Playwright page instance
 * @param reasonsOverride - Optional custom dispute reasons to return
 *
 * @example
 * ```typescript
 * import { mockDisputeReasons } from "./utils/mockDispute";
 *
 * test("dispute reasons load", async ({ page }) => {
 *   await mockDisputeReasonsEndpoint(page);
 *   // Your test code here...
 * });
 * ```
 */
export async function mockDisputeReasonsEndpoint(page: Page, reasonsOverride?: Record<string, string>): Promise<void> {
  const routeHandler = async (route: Route) => {
    const request = route.request();

    if (request.method() === "GET") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          result: reasonsOverride || mockDisputeReasons,
        }),
      });
    } else {
      await route.continue();
    }
  };

  await page.route("**/api/v1/transactions/dispute", routeHandler);
}

/**
 * Sets up a mock for the `/api/v1/transactions/{threadId}/dispute` endpoint (POST - submit dispute)
 *
 * @param page - The Playwright page instance
 * @param options - Configuration options
 * @param options.shouldFail - If true, returns an error response
 * @param options.errorMessage - Custom error message for failed submissions
 * @param options.statusCode - HTTP status code for the response (default: 201 for success, 400 for error)
 *
 * @example
 * ```typescript
 * import { mockDisputeSubmission } from "./utils/mockDispute";
 *
 * test("dispute submission success", async ({ page }) => {
 *   await mockDisputeSubmission(page);
 *   // Your test code here...
 * });
 *
 * test("dispute submission error", async ({ page }) => {
 *   await mockDisputeSubmission(page, { shouldFail: true, errorMessage: "Transaction already disputed" });
 *   // Your test code here...
 * });
 * ```
 */
export async function mockDisputeSubmission(
  page: Page,
  options?: {
    shouldFail?: boolean;
    errorMessage?: string;
    statusCode?: number;
  },
): Promise<void> {
  const { shouldFail = false, errorMessage = "Failed to submit dispute", statusCode } = options || {};

  const routeHandler = async (route: Route) => {
    const request = route.request();

    if (request.method() === "POST") {
      if (shouldFail) {
        await route.fulfill({
          status: statusCode || 400,
          contentType: "application/json",
          body: JSON.stringify({
            error: errorMessage,
          }),
        });
      } else {
        await route.fulfill({
          status: statusCode || 201,
          contentType: "application/json",
          body: JSON.stringify({
            result: {
              message: "Dispute submitted for review",
            },
          }),
        });
      }
    } else {
      await route.continue();
    }
  };

  await page.route("**/api/v1/transactions/*/dispute", routeHandler);
}
