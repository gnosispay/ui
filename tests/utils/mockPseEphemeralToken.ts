import type { Page } from "@playwright/test";

/**
 * Configuration for mocking the PSE ephemeral token endpoint
 */
export interface PseEphemeralTokenMockOptions {
  /** Custom ephemeral token value (default: "mocked-token") */
  ephemeralToken?: string;
  /** Custom expiration time in milliseconds from now (default: 3600000 = 1 hour) */
  expiresInMs?: number;
  /** Custom server URL (default: "http://localhost:8083/token") */
  serverUrl?: string;
  /** Whether the API should return an error */
  isError?: boolean;
  /** Custom error status code (default: 500) */
  errorStatus?: number;
}

/**
 * Sets up a mock for the PSE ephemeral token endpoint (`http://localhost:8083/token`) in Playwright tests.
 *
 * This function intercepts GET requests to the ephemeral token endpoint and returns
 * a token response that can be used by the PSE SDK.
 *
 * @param page - The Playwright page instance
 * @param options - Configuration options for the mock
 *
 * @example
 * ```typescript
 * import { mockPseEphemeralToken } from "./utils/mockPseEphemeralToken";
 *
 * test("PIN setup flow", async ({ page }) => {
 *   await mockPseEphemeralToken(page, {
 *     ephemeralToken: "custom-token-123"
 *   });
 * });
 * ```
 */
export async function mockPseEphemeralToken(
  page: Page,
  options: PseEphemeralTokenMockOptions = {},
): Promise<void> {
  const {
    ephemeralToken = "mocked-token",
    expiresInMs = 3600000, // 1 hour default
    serverUrl = "http://localhost:8083/token",
    isError = false,
    errorStatus = 500,
  } = options;

  await page.route(serverUrl, async (route) => {
    if (route.request().method() === "GET") {
      if (isError) {
        await route.fulfill({
          status: errorStatus,
          contentType: "application/json",
          body: JSON.stringify({
            success: false,
            message: "Failed to retrieve ephemeral token",
            statusCode: errorStatus,
          }),
        });
      } else {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            success: true,
            message: "Token retrieved successfully",
            responseObject: {
              data: {
                ephemeralToken,
                expiresAt: new Date(Date.now() + expiresInMs).toISOString(),
              },
            },
            statusCode: 200,
          }),
        });
      }
    } else {
      await route.continue();
    }
  });
}

