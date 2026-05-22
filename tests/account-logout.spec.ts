import { test, expect } from "@playwright/test";
import { getAddress } from "viem";
import { LOCALSTORAGE_JWT_KEY } from "../src/context/AuthContext";
import { setupMockWallet } from "./utils/mockWallet";
import { setupAllMocks } from "./utils/setupMocks";
import { BASE_USER, USER_TEST_SIGNER_ADDRESS } from "./utils/testUsers";

test.describe("Account logout", () => {
  test("clears JWT, shows login screen, and does not auto-trigger SIWE", async ({ page }) => {
    const jwtStorageKey = `${LOCALSTORAGE_JWT_KEY}.${getAddress(USER_TEST_SIGNER_ADDRESS)}`;

    let authChallengeCount = 0;
    let authNonceCount = 0;

    page.on("request", (request) => {
      const url = request.url();
      if (url.includes("/api/v1/auth/challenge") && request.method() === "POST") {
        authChallengeCount += 1;
      }
      if (url.includes("/api/v1/auth/nonce") && request.method() === "GET") {
        authNonceCount += 1;
      }
    });

    await setupMockWallet(page);
    await setupAllMocks(page, BASE_USER);

    await page.goto("/account");

    const logoutButton = page.getByTestId("logout-button");
    await expect(logoutButton).toBeVisible();

    const challengeCountBeforeLogout = authChallengeCount;
    const nonceCountBeforeLogout = authNonceCount;

    await logoutButton.click();

    await expect(page.getByRole("heading", { name: "Login" })).toBeVisible();
    await expect(page.getByText("Please sign the message request to login.")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Connect your wallet" })).not.toBeVisible();
    await expect(page.getByRole("button", { name: "Sign message" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Signing message..." })).not.toBeVisible();

    const storedJwt = await page.evaluate((key) => localStorage.getItem(key), jwtStorageKey);
    expect(storedJwt).toBeNull();

    const jwtKeys = await page.evaluate((prefix) => {
      return Object.keys(localStorage).filter((key) => key.startsWith(prefix));
    }, LOCALSTORAGE_JWT_KEY);
    expect(jwtKeys).toHaveLength(0);

    await expect.poll(() => authChallengeCount).toBe(challengeCountBeforeLogout);
    await expect.poll(() => authNonceCount).toBe(nonceCountBeforeLogout);
  });
});
