import { test, expect } from "@playwright/test";
import { BASE_USER, USER_TEST_SIGNER_ADDRESS } from "./utils/testUsers";
import { setupAllMocks } from "./utils/setupMocks";
import { setupMockWallet } from "./utils/mockWallet";
import { ANVIL_RPC_URL, isAnvilAvailable, setupTestBalances, startAnvil, stopAnvil } from "./utils/anvil";
import type { Address } from "viem";

/**
 * Account Button Test Specification
 * Tests the account-kit account button component to verify it displays
 * the correct address and balance properties
 */

// Run tests sequentially to avoid Anvil state interference
test.describe.configure({ mode: "serial" });

test.describe("Account Button", () => {
  test.beforeEach(async ({ page }) => {
    // Ensure Anvil is stopped for this test (it doesn't use Anvil)
    await stopAnvil();
    await setupMockWallet(page);
  });

  test("displays account button with correct address and balance properties", async ({ page }) => {
    // Set up all mocks for fully onboarded user
    await setupAllMocks(page, BASE_USER);

    // Navigate to home page
    await page.goto("/");

    // Wait for the account button to be visible (it's in the header)
    const accountButton = page.getByTestId("account-button");
    await expect(accountButton).toBeVisible();

    await test.step("account button has address property", async () => {
      const address = await accountButton.getAttribute("address");
      expect(address).toBeDefined();
      expect(address).toBeTruthy();
      // Verify it matches the exact test user address
      expect(address).toBe(USER_TEST_SIGNER_ADDRESS);
    });

    await test.step("account button has balance property", async () => {
      // Wait for the balance to be "0.000 XDAI" with timeout
      await expect(accountButton).toHaveAttribute("balance", "0.000 XDAI", { timeout: 10000 });
    });
  });
});

const anvilAvailable = isAnvilAvailable();

test.describe("Account Button with Anvil", () => {
  test.beforeEach(async ({ page }) => {
    await startAnvil();
    // Point the mock wallet to Anvil if available
    await setupMockWallet(page, {
      rpcUrl: anvilAvailable ? ANVIL_RPC_URL : undefined,
    });
  });

  test.afterEach(async () => {
    await stopAnvil();
  });

  test("displays account button with 100 XDAI balance", async ({ page }) => {
    // Set up 111 XDAI for the signer address (account button shows connected wallet balance)
    await setupTestBalances(USER_TEST_SIGNER_ADDRESS as Address, {
      xDAI: "111",
    });

    // Set up all mocks for fully onboarded user
    await setupAllMocks(page, BASE_USER);

    // Navigate to home page
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Wait for the account button to be visible (it's in the header)
    const accountButton = page.getByTestId("account-button");
    await expect(accountButton).toBeVisible();

    await test.step("account button displays 100 XDAI balance", async () => {
      // Wait for the balance to update (account button may need time to fetch from chain)
      await expect(accountButton).toHaveAttribute("balance", "111.000 XDAI", { timeout: 10000 });
    });
  });
});
