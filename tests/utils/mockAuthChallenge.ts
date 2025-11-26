import jwt from "jsonwebtoken";
import type { Page } from "@playwright/test";
import type {
  PostApiV1AuthChallengeData,
  PostApiV1AuthChallengeResponses,
  Authorization,
} from "../../src/client/types.gen";
import type { TestUser } from "./testUsers";

// Use generated types from API client
type AuthChallengeRequest = PostApiV1AuthChallengeData["body"];
type AuthChallengeResponse = PostApiV1AuthChallengeResponses[200];
type JWTPayload = Authorization;

// Mock configuration
const JWT_SECRET = "test-secret-key";
const DEFAULT_CHAIN_ID = "100"; // Gnosis chain

/**
 * Configuration options for the auth challenge mock
 */
export interface MockAuthChallengeOptions {
  /** Chain ID for the JWT payload. Defaults to "100" (Gnosis chain) */
  chainId?: string;
  /** Custom JWT secret for signing. Defaults to "test-secret-key" */
  jwtSecret?: string;
  /** Delay in milliseconds before responding. Useful for testing loading states. Defaults to 0 */
  delay?: number;
}

/**
 * Generates a mock JWT token with the specified configuration
 *
 * @param ttlInSeconds - Token time-to-live in seconds (default: 3600 = 1 hour)
 * @param testUser - Test user data for the JWT payload
 * @param options - Additional configuration options for the JWT payload
 * @returns A signed JWT token string
 */
function generateMockJWT(
  ttlInSeconds: number = 3600,
  testUser: TestUser,
  options: MockAuthChallengeOptions = {},
): string {
  const now = Math.floor(Date.now() / 1000);

  // Only include userId if the user has signed up
  // This matches the real API behavior where userId is only present after signup
  const payload = {
    ...(testUser.hasSignedUp && { userId: testUser.userId }),
    signerAddress: testUser.signerAddress,
    chainId: options.chainId || DEFAULT_CHAIN_ID,
    iat: now,
    exp: now + ttlInSeconds,
    hasSignedUp: testUser.hasSignedUp,
  } as JWTPayload;

  return jwt.sign(payload, options.jwtSecret || JWT_SECRET);
}

/**
 * Sets up a mock for the `/api/v1/auth/challenge` endpoint in Playwright tests.
 *
 * This function intercepts POST requests to the auth challenge endpoint and returns
 * a mock JWT token response that matches the API specification.
 *
 * @param page - The Playwright page instance
 * @param testUser - Test user data for the JWT payload
 * @param options - Additional configuration options for the mock behavior
 *
 * @example
 * ```typescript
 * import { mockAuthChallenge } from "./utils/mockAuthChallenge";
 * import { TEST_USER_APPROVED } from "./testUsers";
 *
 * test("user authentication flow", async ({ page }) => {
 *   // Set up the auth challenge mock with test user data
 *   await mockAuthChallenge(page, TEST_USER_APPROVED);
 *
 *   // Your test code here...
 * });
 *
 * // With additional custom options
 * test("custom chain authentication", async ({ page }) => {
 *   await mockAuthChallenge({ page, testUser: TEST_USER_APPROVED, options: {
 *     chainId: "1", // Ethereum mainnet
 *   }});
 * });
 *
 * // With delay to test loading states
 * test("authentication loading state", async ({ page }) => {
 *   await mockAuthChallenge({ page, testUser: TEST_USER_APPROVED, options: {
 *     delay: 200, // Delay response by 200ms to test loading state
 *   }});
 * });
 * ```
 */
export async function mockAuthChallenge({
  page,
  testUser,
  options = {},
}: {
  page: Page;
  testUser: TestUser;
  options?: MockAuthChallengeOptions;
}): Promise<void> {
  await page.route("**/api/v1/auth/challenge", async (route) => {
    const request = route.request();

    if (request.method() === "POST") {
      try {
        const requestBody = (await request.postDataJSON()) as AuthChallengeRequest;
        const ttlInSeconds = requestBody.ttlInSeconds || 3600;

        const mockResponse: AuthChallengeResponse = {
          token: generateMockJWT(ttlInSeconds, testUser, options),
        };

        // Apply delay if specified (useful for testing loading states)
        if (options.delay && options.delay > 0) {
          await new Promise((resolve) => setTimeout(resolve, options.delay));
        }

        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(mockResponse),
        });
      } catch {
        // Return error response for invalid requests
        await route.fulfill({
          status: 401,
          contentType: "application/json",
          body: JSON.stringify({ error: "Invalid signature" }),
        });
      }
    } else {
      await route.continue();
    }
  });
}
