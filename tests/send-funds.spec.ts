import { test, expect } from "@playwright/test";
import { BASE_USER } from "./utils/testUsers";
import { setupAllMocks } from "./utils/setupMocks";
import { setupMockWallet } from "./utils/mockWallet";
import {
  ANVIL_RPC_URL,
  GNOSIS_TOKENS,
  isAnvilAvailable,
  setupTestBalances,
  startAnvil,
  stopAnvil,
} from "./utils/anvil";
import type { Address } from "viem";

const wstETHInfo = {
  address: GNOSIS_TOKENS.wstETH.address,
  symbol: "wstETH",
  name: "Wrapped liquid staked Ether",
};

const anvilAvailable = isAnvilAvailable();

test.describe("Send Funds Modal with Anvil", () => {
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

  test("custom token functionality and insufficient funds error", async ({ page }) => {
    await setupTestBalances(BASE_USER.safeAddress as Address, {
      EURe: "1000",
      wstETH: "2.5",
      xDAI: "100",
    });

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
      await expect(page.getByRole("alert").filter({ hasText: "Gnosis Chain address" })).toBeVisible();
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

    await test.step("enter a valid recipient address", async () => {
      // Enter a valid test address
      const addressInput = page.getByTestId("send-funds-address-input");
      await expect(addressInput).toBeVisible();

      // Use a valid Gnosis Chain address for testing
      const testRecipientAddress = "0x1234567890123456789012345678901234567890";
      await addressInput.fill(testRecipientAddress);

      // Verify the address was entered correctly
      await expect(addressInput).toHaveValue(testRecipientAddress);

      const errorAlert = page.getByRole("alert").filter({ hasText: "Invalid address" });
      await expect(errorAlert).not.toBeVisible();
    });

    await test.step("verify default token is EUR from safeConfig", async () => {
      // Wait for the token selector to load
      const tokenSelector = page.getByTestId("token-selector");
      await expect(tokenSelector).toBeVisible({ timeout: 10000 });

      // Verify the default selected token is EUR (from BASE_USER.safeConfig.fiatSymbol)
      const selectedTokenSymbol = page.getByTestId("selected-token-symbol");
      await expect(selectedTokenSymbol).toHaveText("EURe");
    });

    await test.step("test valid EUR amount)", async () => {
      const amountInput = page.getByTestId("standard-token-amount-input");
      await expect(amountInput).toBeVisible();

      //token amount should be 1000
      const tokenBalance = page.getByTestId("token-balance");
      await expect(tokenBalance).toBeVisible();
      await expect(tokenBalance).toHaveText("1000");

      await amountInput.fill("100"); // Try to send 100 EUR

      const errorAlert = page.getByRole("alert").filter({ hasText: "Insufficient balance" });
      await expect(errorAlert).not.toBeVisible();
      const nextButton = page.getByTestId("send-funds-next-button");
      await expect(nextButton).toBeEnabled();

      // Click Next to go to confirmation screen
      await nextButton.click();

      // Verify confirmation screen displays correct EURe data
      await test.step("verify confirmation screen displays EURe data", async () => {
        // Wait for confirmation screen to appear
        const confirmButton = page.getByTestId("send-funds-confirm-button");
        await expect(confirmButton).toBeVisible();

        // Verify "You're sending" section shows 100 EURe
        const sendingLabel = page.getByText("You're sending");
        await expect(sendingLabel).toBeVisible();

        // Verify the amount (100) is displayed
        const amountDisplay = page.getByTestId("confirm-amount");
        await expect(amountDisplay).toBeVisible();
        await expect(amountDisplay).toHaveText("100");

        // Verify token symbol (€) is displayed
        const tokenSymbol = page.getByTestId("confirm-token-symbol");
        await expect(tokenSymbol).toBeVisible();
        await expect(tokenSymbol).toHaveText("€");

        // Verify recipient address is displayed
        const recipientLabel = page.getByTestId("confirm-to-label");
        await expect(recipientLabel).toBeVisible();
        const recipientAddress = page.getByTestId("confirm-to-address");
        await expect(recipientAddress).toBeVisible();
        await expect(recipientAddress).toHaveText("0x1234567890123456789012345678901234567890");
      });

      // Click Back to return to form
      const backButton = page.getByRole("button", { name: "Back" });
      await expect(backButton).toBeVisible();
      await backButton.click();

      // Verify we're back on the form and amount input has the value reset
      await expect(amountInput).toBeVisible();
      await expect(amountInput).toHaveValue("");

      const addressInput = page.getByTestId("send-funds-address-input");
      const testRecipientAddress = "0x1234567890123456789012345678901234567890";
      await addressInput.fill(testRecipientAddress);
    });

    await test.step("test amount available and max button", async () => {
      const amountInput = page.getByTestId("standard-token-amount-input");

      const maxButton = page.getByTestId("standard-token-max-button");
      await expect(maxButton).toBeVisible();

      await maxButton.click();
      await expect(amountInput).toHaveValue("1000");

      const errorAlert = page.getByRole("alert").filter({ hasText: "Insufficient balance" });
      await expect(errorAlert).not.toBeVisible();
      const nextButton = page.getByTestId("send-funds-next-button");
      await expect(nextButton).toBeEnabled();

      await amountInput.fill("");
    });

    await test.step("test insufficient funds error for standard token", async () => {
      const amountInput = page.getByTestId("standard-token-amount-input");
      await expect(amountInput).toBeVisible();

      await amountInput.fill("2000"); // Try to send 2000 EUR (we only have 1000)

      // Wait for the error to appear
      const errorAlert = page.getByRole("alert").filter({ hasText: "Insufficient balance" });
      await expect(errorAlert).toBeVisible({ timeout: 5000 });

      // Verify the next button is disabled
      const nextButton = page.getByTestId("send-funds-next-button");
      await expect(nextButton).toBeDisabled();
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

      // make sure the input is empty
      const amountInput = page.getByTestId("standard-token-amount-input");
      await expect(amountInput).toHaveValue("");
    });

    await test.step("test insufficient funds error for GBP token", async () => {
      const tokenBalance = page.getByTestId("token-balance");
      await expect(tokenBalance).toBeVisible();
      await expect(tokenBalance).toHaveText("0");

      const amountInput = page.getByTestId("standard-token-amount-input");
      await amountInput.fill("1000"); // Try to send 1000 GBP (we only have 0)

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
      await customTokenInput.fill(wstETHInfo.address);

      // Wait for token info to load from blockchain
      const tokenInfo = page.getByTestId("custom-token-info");
      await expect(tokenInfo).toBeVisible({ timeout: 15000 });

      // Verify token symbol is displayed
      await expect(tokenInfo).toContainText(wstETHInfo.symbol);

      // Verify token name contains expected text
      await expect(tokenInfo).toContainText(wstETHInfo.name);

      // make sure the amount balance is correct and the max button is visible
      const tokenBalance = page.getByTestId("token-balance");
      await expect(tokenBalance).toBeVisible();
      await expect(tokenBalance).toHaveText("2.5");

      const maxButton = page.getByTestId("custom-token-max-button");
      await expect(maxButton).toBeVisible();

      // click the max button and verify the amount balance is correct
      await maxButton.click();
      const customTokenAmountInput = page.getByTestId("custom-token-amount-input");
      await expect(customTokenAmountInput).toHaveValue("2.5");
      const nextButton = page.getByTestId("send-funds-next-button");

      const errorAlert = page.getByRole("alert").filter({ hasText: "Insufficient balance" });
      await expect(errorAlert).not.toBeVisible();

      await expect(nextButton).toBeEnabled();

      // Click Next to go to confirmation screen
      await nextButton.click();

      // Verify confirmation screen displays correct wstETH data
      await test.step("verify confirmation screen displays wstETH data", async () => {
        // Wait for confirmation screen to appear
        const confirmButton = page.getByTestId("send-funds-confirm-button");
        await expect(confirmButton).toBeVisible();

        // Verify "You're sending" section shows 2.5 wstETH
        const sendingLabel = page.getByText("You're sending");
        await expect(sendingLabel).toBeVisible();

        // Verify the amount (2.5) is displayed
        const amountDisplay = page.locator("text=/^2\\.5$/");
        await expect(amountDisplay).toBeVisible();

        // Verify token symbol (wstETH) is displayed
        const tokenSymbol = page.getByText("wstETH");
        await expect(tokenSymbol).toBeVisible();
      });

      // Click Back to return to form
      const backButton = page.getByRole("button", { name: "Back" });
      await expect(backButton).toBeVisible();
      await backButton.click();

      // Verify we're back on the form and amount input has the value reset
      await expect(customTokenAmountInput).not.toBeVisible();
    });

    await test.step("test insufficient funds error with positive amount", async () => {
      // Enable custom token mode
      const customTokenSwitch = page.getByTestId("custom-token-switch");
      await expect(customTokenSwitch).toBeVisible();
      await customTokenSwitch.click();

      // Enter wstETH token address
      const customTokenInput = page.getByTestId("custom-token-address-input");
      await expect(customTokenInput).toBeVisible();
      await customTokenInput.fill(wstETHInfo.address);

      // Wait for token info to load
      await expect(page.getByTestId("custom-token-info")).toBeVisible({ timeout: 15000 });

      // Now we can test the amount input
      const amountInput = page.getByTestId("custom-token-amount-input");

      await amountInput.fill("5"); // Try to send 5 wstETH (we only have 2.5)

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

      // The standard amount input should be visible
      const standardAmountInput = page.getByTestId("standard-token-amount-input");
      await expect(standardAmountInput).toBeVisible({ timeout: 5000 });

      // The custom token info should not be visible
      const tokenInfo = page.getByTestId("custom-token-info");
      await expect(tokenInfo).not.toBeVisible();
    });
  });
});

test.describe("Send Funds Modal without Anvil", () => {
  test.beforeEach(async ({ page }) => {
    await setupMockWallet(page, {
      rpcUrl: undefined,
    });
  });

  test("shows error when connected account is not a Safe owner", async ({ page }) => {
    // Set up all mocks but mock owners with a different address (not the connected wallet)
    // This simulates the case where the connected wallet is not an owner
    await setupAllMocks(page, BASE_USER, {
      owners: {
        owners: ["0x1111111111111111111111111111111111111111"], // Different address, not the connected wallet
      },
    });

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
    });

    await test.step("verify error message appears for non-owner account", async () => {
      // Verify the error message is displayed
      const errorAlert = page
        .getByRole("alert")
        .filter({ hasText: "You must be connected with an account that is a signer of the Gnosis Pay account" });
      await expect(errorAlert).toBeVisible();

      // Verify the Next button is disabled
      const nextButton = page.getByTestId("send-funds-next-button");
      await expect(nextButton).toBeDisabled();
    });
  });
});
