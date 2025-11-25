import type { Page } from "@playwright/test";
import type {
  PostApiV1SafeDeployResponse,
  PostApiV1SafeDeployError,
  PostApiV1SafeDeployErrors,
  GetApiV1SafeDeployResponse,
  GetApiV1SafeDeployError,
} from "../../src/client/types.gen";

/**
 * Valid error status codes for the safe deployment POST endpoint
 */
type SafeDeployErrorStatus = keyof PostApiV1SafeDeployErrors;

/**
 * Deployment status types
 */
type DeploymentStatus = "not_deployed" | "processing" | "ok" | "failed";

/**
 * Configuration for mocking the safe deployment endpoints
 */
export interface SafeDeploymentMockOptions {
  /** Whether POST /safe/deploy should return an error */
  postIsError?: boolean;
  /** Whether GET /safe/deploy should return an error */
  getIsError?: boolean;
  /** Custom POST response */
  postResponse?: PostApiV1SafeDeployResponse;
  /** Custom GET response */
  getResponse?: GetApiV1SafeDeployResponse;
  /** Custom POST error response */
  postErrorResponse?: PostApiV1SafeDeployError;
  /** Custom GET error response */
  getErrorResponse?: GetApiV1SafeDeployError;
  /** Custom POST error status code (default: 422). Must be one of: 401, 403, 422, 500 */
  postErrorStatus?: SafeDeployErrorStatus;
  /** Deployment status for GET endpoint (default: "ok") */
  deploymentStatus?: DeploymentStatus;
  /** Simulate progressive deployment (not_deployed -> processing -> ok) */
  simulateProgression?: boolean;
}

/**
 * Sets up mocks for the safe deployment endpoints in Playwright tests.
 *
 * This function intercepts POST requests to `/api/v1/safe/deploy` (trigger deployment)
 * and GET requests to `/api/v1/safe/deploy` (check deployment status).
 *
 * @param page - The Playwright page instance
 * @param options - Configuration options for the mock
 *
 * @example
 * ```typescript
 * import { mockSafeDeployment } from "./utils/mockSafeDeployment";
 *
 * test("successful safe deployment", async ({ page }) => {
 *   await mockSafeDeployment(page, {
 *     deploymentStatus: "ok"
 *   });
 * });
 *
 * test("safe deployment with progression", async ({ page }) => {
 *   await mockSafeDeployment(page, {
 *     simulateProgression: true
 *   });
 * });
 *
 * test("safe deployment error - already exists", async ({ page }) => {
 *   await mockSafeDeployment(page, {
 *     postIsError: true,
 *     postErrorStatus: 422,
 *     postErrorResponse: { error: "Safe account already exists" }
 *   });
 * });
 * ```
 */
export async function mockSafeDeployment(page: Page, options: SafeDeploymentMockOptions = {}): Promise<void> {
  const {
    postIsError = false,
    getIsError = false,
    postResponse,
    getResponse,
    postErrorResponse,
    getErrorResponse,
    postErrorStatus = 422,
    deploymentStatus = "ok",
    simulateProgression = false,
  } = options;

  // Track progression state
  let currentStatus: DeploymentStatus = simulateProgression ? "not_deployed" : deploymentStatus;
  let getCallCount = 0;

  // Default POST response - accepted
  const defaultPostResponse: PostApiV1SafeDeployResponse = {
    status: "processing",
  };

  const finalPostResponse = postResponse || defaultPostResponse;

  // Default POST error response
  const defaultPostErrorResponse: PostApiV1SafeDeployError = {
    error: "Safe account already exists",
  } as PostApiV1SafeDeployError;

  const finalPostErrorResponse = postErrorResponse || defaultPostErrorResponse;

  // Default GET error response
  const defaultGetErrorResponse: GetApiV1SafeDeployError = {
    message: "Internal server error",
  } as GetApiV1SafeDeployError;

  const finalGetErrorResponse = getErrorResponse || defaultGetErrorResponse;

  // Mock POST /safe/deploy endpoint
  await page.route("**/api/v1/safe/deploy", async (route) => {
    if (route.request().method() === "POST") {
      if (postIsError) {
        await route.fulfill({
          status: postErrorStatus,
          contentType: "application/json",
          body: JSON.stringify(finalPostErrorResponse),
        });
      } else {
        // When POST is called, move to processing if simulating progression
        if (simulateProgression && currentStatus === "not_deployed") {
          currentStatus = "processing";
        }
        await route.fulfill({
          status: 202,
          contentType: "application/json",
          body: JSON.stringify(finalPostResponse),
        });
      }
    } else if (route.request().method() === "GET") {
      if (getIsError) {
        await route.fulfill({
          status: 500,
          contentType: "application/json",
          body: JSON.stringify(finalGetErrorResponse),
        });
      } else {
        // Simulate progression: not_deployed -> processing -> ok
        if (simulateProgression) {
          getCallCount++;
          // After 2 GET calls in processing, move to ok
          if (currentStatus === "processing" && getCallCount >= 2) {
            currentStatus = "ok";
          }
        }

        const responseData: GetApiV1SafeDeployResponse = getResponse || {
          status: currentStatus,
        };

        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(responseData),
        });
      }
    } else {
      await route.continue();
    }
  });
}
