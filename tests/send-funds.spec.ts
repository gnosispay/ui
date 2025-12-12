import { test, expect } from "@playwright/test";
import { BASE_USER } from "./utils/testUsers";
import { setupAllMocks } from "./utils/setupMocks";
import { setupMockWallet } from "./utils/mockWallet";

/**
 * Send Funds Modal Test Specification
 * Tests the custom token functionality and error handling for insufficient funds
 *
 * Uses real blockchain data from Gnosis Chain for wstETH token to test:
 * - Default token selection from safeConfig
 * - Currency switching functionality
 * - Custom token input and token info display
 * - Insufficient funds error for both standard and custom tokens
 * - Form validation behavior
 */

// wstETH token on Gnosis Chain - real contract
const WSTETH_ADDRESS = "0x6C76971f98945AE98dD7d4DFcA8711ebea946eA6";
const WSTETH_SYMBOL = "wstETH";
// The full name from the contract includes "from Mainnet" suffix
const WSTETH_NAME_PARTIAL = "Wrapped liquid staked Ether";

test.describe("Send Funds Modal", () => {
  test.beforeEach(async ({ page }) => {
    await setupMockWallet(page);
  });

  test("custom token functionality and insufficient funds error", async ({ page }) => {
    // Set up all mocks with the base user
    await setupAllMocks(page, BASE_USER);

    // Navigate to home page
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await test.step("open send funds modal", async () => {
      const sendFundsButton = page.getByTestId("send-funds-button");
      await expect(sendFundsButton).toBeVisible();
      await sendFundsButton.click();

      // Wait for modal to open
      const modal = page.locator('[role="dialog"]');
      await expect(modal).toBeVisible();
      await expect(modal.getByRole("heading", { name: "Send funds" })).toBeVisible();

      // Verify the warning alert about Gnosis Chain address is displayed
      await expect(page.getByRole("alert")).toContainText("Gnosis Chain address");
    });

    await test.step("enter recipient address", async () => {
      // Enter a valid test address
      const addressInput = page.getByTestId("send-funds-address-input");
      await expect(addressInput).toBeVisible();

      // Use a valid Gnosis Chain address for testing
      const testRecipientAddress = "0x1234567890123456789012345678901234567890";
      await addressInput.fill(testRecipientAddress);

      // Verify the address was entered correctly
      await expect(addressInput).toHaveValue(testRecipientAddress);
    });

    await test.step("verify default token is EUR from safeConfig", async () => {
      // Wait for the token selector to load
      const tokenSelector = page.getByTestId("token-selector");
      await expect(tokenSelector).toBeVisible({ timeout: 10000 });

      // Verify the default selected token is EUR (from BASE_USER.safeConfig.fiatSymbol)
      const selectedTokenSymbol = page.getByTestId("selected-token-symbol");
      await expect(selectedTokenSymbol).toHaveText("EURe");
    });

    await test.step("test insufficient funds error for standard token", async () => {
      // The test safe address has 0 EUR balance on the blockchain
      // Enter an amount to trigger insufficient balance error
      const amountInput = page.getByTestId("standard-token-amount-input");
      await expect(amountInput).toBeVisible();
      await amountInput.fill("100"); // Try to send 100 EUR

      // Wait for the error to appear
      const errorAlert = page.getByRole("alert").filter({ hasText: "Insufficient balance" });
      await expect(errorAlert).toBeVisible({ timeout: 5000 });

      // Verify the next button is disabled
      const nextButton = page.getByTestId("send-funds-next-button");
      await expect(nextButton).toBeDisabled();

      // Clear the amount for next steps
      await amountInput.fill("");
    });

    await test.step("verify can switch currency from EUR to GBP", async () => {
      // Click the token selector to open dropdown
      const tokenSelector = page.getByTestId("token-selector");
      await tokenSelector.click();

      // Wait for the dropdown to open and select GBP
      const gbpOption = page.getByRole("option", { name: /GBPe/i });
      await expect(gbpOption).toBeVisible();
      await gbpOption.click();

      // Verify the selected token changed to GBP
      const selectedTokenSymbol = page.getByTestId("selected-token-symbol");
      await expect(selectedTokenSymbol).toHaveText("GBPe");
    });

    await test.step("test insufficient funds error for GBP token", async () => {
      // The test safe address also has 0 GBP balance
      const amountInput = page.getByTestId("standard-token-amount-input");
      await amountInput.fill("50"); // Try to send 50 GBP

      // Wait for the error to appear
      const errorAlert = page.getByRole("alert").filter({ hasText: "Insufficient balance" });
      await expect(errorAlert).toBeVisible({ timeout: 5000 });

      // Verify the next button is disabled
      const nextButton = page.getByTestId("send-funds-next-button");
      await expect(nextButton).toBeDisabled();

      // Clear the amount for next steps
      await amountInput.fill("");
    });

    await test.step("verify can switch back to EUR", async () => {
      // Click the token selector to open dropdown
      const tokenSelector = page.getByTestId("token-selector");
      await tokenSelector.click();

      // Select EUR
      const eurOption = page.getByRole("option", { name: /EURe/i });
      await expect(eurOption).toBeVisible();
      await eurOption.click();

      // Verify the selected token changed back to EUR
      const selectedTokenSymbol = page.getByTestId("selected-token-symbol");
      await expect(selectedTokenSymbol).toHaveText("EURe");
    });

    await test.step("verify invalid address shows error", async () => {
      const addressInput = page.getByTestId("send-funds-address-input");

      // Enter an invalid address
      await addressInput.fill("invalid-address");

      // Wait for the error to appear
      const errorAlert = page.getByRole("alert").filter({ hasText: "Invalid address" });
      await expect(errorAlert).toBeVisible();

      // Restore valid address
      await addressInput.fill("0x1234567890123456789012345678901234567890");

      // Error should disappear
      await expect(errorAlert).not.toBeVisible();
    });

    await test.step("enable custom token mode", async () => {
      // Click the custom token switch
      const customTokenSwitch = page.getByTestId("custom-token-switch");
      await expect(customTokenSwitch).toBeVisible();
      await customTokenSwitch.click();

      // Verify the custom token input appears
      const customTokenInput = page.getByTestId("custom-token-address-input");
      await expect(customTokenInput).toBeVisible();
    });

    await test.step("verify invalid token address shows error", async () => {
      const customTokenInput = page.getByTestId("custom-token-address-input");

      // Enter an invalid address
      await customTokenInput.fill("not-a-valid-address");

      // Wait for the error to appear
      const errorAlert = page.getByRole("alert").filter({ hasText: "Invalid contract address" });
      await expect(errorAlert).toBeVisible();

      // Clear the input
      await customTokenInput.fill("");
      await expect(errorAlert).not.toBeVisible();
    });

    await test.step("enter wstETH token address and verify token info loads", async () => {
      // Enter the wstETH token address
      const customTokenInput = page.getByTestId("custom-token-address-input");
      await customTokenInput.fill(WSTETH_ADDRESS);

      // Wait for token info to load from blockchain
      const tokenInfo = page.getByTestId("custom-token-info");
      await expect(tokenInfo).toBeVisible({ timeout: 15000 });

      // Verify token symbol is displayed
      await expect(tokenInfo).toContainText(WSTETH_SYMBOL);

      // Verify token name contains expected text (actual name includes "from Mainnet")
      await expect(tokenInfo).toContainText(WSTETH_NAME_PARTIAL);
    });

    await test.step("verify amount input is available after token loads", async () => {
      // The amount input should now be visible
      const amountInput = page.getByTestId("custom-token-amount-input");
      await expect(amountInput).toBeVisible();

      // Amount label should be visible
      await expect(page.getByText("Amount")).toBeVisible();
    });

    await test.step("test insufficient funds error with positive amount", async () => {
      // Since the test Safe address has 0 wstETH balance,
      // any positive amount should trigger the insufficient balance error
      const amountInput = page.getByTestId("custom-token-amount-input");
      await amountInput.fill("0.001"); // Try to send 0.001 wstETH when balance is 0

      // Wait for the error to appear
      const errorAlert = page.getByRole("alert").filter({ hasText: "Insufficient balance" });
      await expect(errorAlert).toBeVisible({ timeout: 5000 });

      // Verify the next button is disabled when there's an insufficient balance error
      const nextButton = page.getByTestId("send-funds-next-button");
      await expect(nextButton).toBeDisabled();
    });

    await test.step("verify increasing amount still shows insufficient funds", async () => {
      // Try a larger amount - should still show error
      const amountInput = page.getByTestId("custom-token-amount-input");
      await amountInput.fill("100"); // Try to send 100 wstETH

      // Error should still be visible
      const errorAlert = page.getByRole("alert").filter({ hasText: "Insufficient balance" });
      await expect(errorAlert).toBeVisible();

      // Button should still be disabled
      const nextButton = page.getByTestId("send-funds-next-button");
      await expect(nextButton).toBeDisabled();
    });

    await test.step("verify clearing amount removes error", async () => {
      // Clear the amount
      const amountInput = page.getByTestId("custom-token-amount-input");
      await amountInput.fill("");

      // Error should disappear (no amount = no error, just disabled button)
      const errorAlert = page.getByRole("alert").filter({ hasText: "Insufficient balance" });
      await expect(errorAlert).not.toBeVisible();

      // Button should still be disabled (no amount entered)
      const nextButton = page.getByTestId("send-funds-next-button");
      await expect(nextButton).toBeDisabled();
    });

    await test.step("verify zero amount does not show insufficient funds error", async () => {
      // Enter zero
      const amountInput = page.getByTestId("custom-token-amount-input");
      await amountInput.fill("0");

      // No insufficient balance error for zero amount
      const errorAlert = page.getByRole("alert").filter({ hasText: "Insufficient balance" });
      await expect(errorAlert).not.toBeVisible();

      // Button should still be disabled (zero is not a valid amount)
      const nextButton = page.getByTestId("send-funds-next-button");
      await expect(nextButton).toBeDisabled();
    });

    await test.step("verify switching back to standard tokens clears custom token state", async () => {
      // First enter some amount in custom token
      const amountInput = page.getByTestId("custom-token-amount-input");
      await amountInput.fill("1");

      // Toggle back to standard token mode
      const customTokenSwitch = page.getByTestId("custom-token-switch");
      await customTokenSwitch.click();

      // The custom token input should no longer be visible
      const customTokenInput = page.getByTestId("custom-token-address-input");
      await expect(customTokenInput).not.toBeVisible();

      // The standard amount input (id="amount") should be visible
      const standardAmountInput = page.locator("#amount");
      await expect(standardAmountInput).toBeVisible({ timeout: 5000 });

      // The custom token info should not be visible
      const tokenInfo = page.getByTestId("custom-token-info");
      await expect(tokenInfo).not.toBeVisible();
    });
  });
});
