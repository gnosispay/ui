import { test, expect } from "@playwright/test";
import { BASE_USER, USER_TEST_SIGNER_ADDRESS } from "./utils/testUsers";
import { setupAllMocks } from "./utils/setupMocks";
import { setupMockWallet } from "./utils/mockWallet";

/**
 * Account Button Test Specification
 * Verifies the RainbowKit account button in the header displays the
 * connected wallet's truncated address once the user is connected.
 */

// RainbowKit truncates addresses as `0xXX…XXXX` (first 4 chars + ellipsis + last 4).
const truncatedAddress = `${USER_TEST_SIGNER_ADDRESS.slice(0, 4)}\u2026${USER_TEST_SIGNER_ADDRESS.slice(-4)}`;

test.describe("Account Button", () => {
  test.beforeEach(async ({ page }) => {
    await setupMockWallet(page);
  });

  test("displays the connected wallet address in the header", async ({ page }) => {
    // Set up all mocks for a fully onboarded user
    await setupAllMocks(page, BASE_USER);

    // Navigate to home page
    await page.goto("/");

    // RainbowKit renders its account button (in the header) once connected
    const accountButton = page.getByTestId("rk-account-button");
    await expect(accountButton).toBeVisible();

    await test.step("account button shows the truncated connected address", async () => {
      await expect(accountButton).toContainText(truncatedAddress);
    });
  });
});
