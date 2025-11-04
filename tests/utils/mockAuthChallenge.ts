import jwt from "jsonwebtoken";
import type { Page } from "@playwright/test";
import type { PostApiV1AuthChallengeData, Authorization } from "../../src/client/types.gen";

// Use generated types from API client
type AuthChallengeRequest = PostApiV1AuthChallengeData["body"];
type JWTPayload = Authorization;

// Mock configuration
const MOCK_USER_ID = "test-user-12345";
const JWT_SECRET = "test-secret-key";
const DEFAULT_SIGNER_ADDRESS = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";
const DEFAULT_CHAIN_ID = "100"; // Gnosis chain

/**
 * Configuration options for the auth challenge mock
 */
export interface MockAuthChallengeOptions {
  /** Custom user ID for the JWT payload. Defaults to "test-user-12345" */
  userId?: string;
  /** Custom signer address for the JWT payload. Defaults to "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266" */
  signerAddress?: string;
  /** Custom chain ID for the JWT payload. Defaults to "100" (Gnosis chain) */
  chainId?: string;
  /** Whether the user has signed up. Defaults to true */
  hasSignedUp?: boolean;
  /** Custom JWT secret for signing. Defaults to "test-secret-key" */
  jwtSecret?: string;
}

/**
 * Generates a mock JWT token with the specified configuration
 *
 * @param ttlInSeconds - Token time-to-live in seconds (default: 3600 = 1 hour)
 * @param options - Configuration options for the JWT payload
 * @returns A signed JWT token string
 */
function generateMockJWT(ttlInSeconds: number = 3600, options: MockAuthChallengeOptions = {}): string {
  const now = Math.floor(Date.now() / 1000);
  const payload: JWTPayload = {
    userId: options.userId || MOCK_USER_ID,
    signerAddress: options.signerAddress || DEFAULT_SIGNER_ADDRESS,
    chainId: options.chainId || DEFAULT_CHAIN_ID,
    iat: now,
    exp: now + ttlInSeconds,
    hasSignedUp: options.hasSignedUp ?? true,
  };

  return jwt.sign(payload, options.jwtSecret || JWT_SECRET);
}

/**
 * Sets up a mock for the `/api/v1/auth/challenge` endpoint in Playwright tests.
 *
 * This function intercepts POST requests to the auth challenge endpoint and returns
 * a mock JWT token response that matches the API specification.
 *
 * @param page - The Playwright page instance
 * @param options - Configuration options for the mock behavior
 *
 * @example
 * ```typescript
 * import { mockAuthChallenge } from "./utils/mockAuthChallenge";
 *
 * test("user authentication flow", async ({ page }) => {
 *   // Set up the auth challenge mock
 *   await mockAuthChallenge(page);
 *
 *   // Your test code here...
 * });
 *
 * // With custom options
 * test("custom user authentication", async ({ page }) => {
 *   await mockAuthChallenge(page, {
 *     userId: "custom-user-123",
 *     hasSignedUp: false
 *   });
 * });
 * ```
 */
export async function mockAuthChallenge(page: Page, options: MockAuthChallengeOptions = {}): Promise<void> {
  await page.route("**/api/v1/auth/challenge", async (route) => {
    const request = route.request();

    if (request.method() === "POST") {
      try {
        const requestBody = (await request.postDataJSON()) as AuthChallengeRequest;
        const ttlInSeconds = requestBody.ttlInSeconds || 3600;

        const mockResponse = {
          token: generateMockJWT(ttlInSeconds, options),
        };

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

/**
 * Utility function to decode a JWT token for testing purposes
 *
 * @param token - The JWT token string to decode
 * @returns The decoded JWT payload
 */
export function decodeJWT(token: string): JWTPayload {
  return jwt.decode(token) as JWTPayload;
}

/**
 * Constants exported for use in tests
 */
export const AUTH_MOCK_CONSTANTS = {
  MOCK_USER_ID,
  DEFAULT_SIGNER_ADDRESS,
  DEFAULT_CHAIN_ID,
  JWT_SECRET,
} as const;
