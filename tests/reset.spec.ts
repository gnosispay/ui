import { test, expect } from "@playwright/test";
import { setupMockWallet } from "./utils/mockWallet";
import { setupAllMocks } from "./utils/setupMocks";
import { mockSafeReset, SAFE_RESET_ERROR_SCENARIOS } from "./utils/mockSafeReset";
import { BASE_USER } from "./utils/testUsers";

test.describe("Reset Safe Account Flow", () => {
  test.beforeEach(async ({ page }) => {
    // Set up wallet mock and all API mocks for a normal user
    await setupMockWallet(page);
    await setupAllMocks(page, BASE_USER);
  });

  test("displays initial warning page with correct content", async ({ page }) => {
    // Navigate to reset page
    await page.goto("/reset");

    // Wait for the reset page to load
    await expect(page.getByTestId("reset-page")).toBeVisible();
    await expect(page.getByTestId("reset-warning-step")).toBeVisible();

    // Verify warning icon is displayed
    await expect(page.getByTestId("reset-warning-icon")).toBeVisible();

    // Verify warning text content
    await expect(page.getByRole("heading", { name: "Reset Safe Account" })).toBeVisible();
    await expect(page.getByText(/This action will permanently delete your Safe account/)).toBeVisible();
    await expect(page.getByText(/irreversible/)).toBeVisible();
    await expect(page.getByText(/Transfer any remaining funds/)).toBeVisible();

    // Verify reset button is present
    const resetButton = page.getByTestId("reset-confirm-button");
    await expect(resetButton).toBeVisible();
    await expect(resetButton).toHaveText("Reset Safe Account");
    await expect(resetButton).toBeEnabled();

    await mockSafeReset(page);

    await resetButton.click();

    // Wait for success step to appear
    await expect(page.getByTestId("reset-success-step")).toBeVisible();

    // Verify success icon is displayed
    await expect(page.getByTestId("reset-success-icon")).toBeVisible();

    // Verify success message
    await expect(page.getByRole("heading", { name: "Safe Account Reset Successfully" })).toBeVisible();
    await expect(page.getByTestId("reset-success-message")).toContainText(
      "Your Safe account has been permanently deleted",
    );

    // Verify navigation button is present
    const homeButton = page.getByRole("button", { name: "Go to Home" });
    await expect(homeButton).toBeVisible();

    // Click home button and verify navigation
    await homeButton.click();
    await expect(page).toHaveURL("/");
  });

  test("shows error when reset fails due to active card (422)", async ({ page }) => {
    // Mock 422 error - active card exists
    await mockSafeReset(page, SAFE_RESET_ERROR_SCENARIOS.activeCardExists);

    // Navigate to reset page
    await page.goto("/reset");

    // Wait for the warning step to be visible
    await expect(page.getByTestId("reset-warning-step")).toBeVisible();

    // Click the reset button
    const resetButton = page.getByTestId("reset-confirm-button");
    await resetButton.click();

    // Verify error alert is displayed with the correct message
    const errorAlert = page.getByTestId("reset-error-alert");
    await expect(errorAlert).toBeVisible();
    await expect(errorAlert).toContainText("active card exists");

    // Verify we're still on the warning step (not success)
    await expect(page.getByTestId("reset-warning-step")).toBeVisible();
    await expect(page.getByTestId("reset-success-step")).not.toBeVisible();

    // Verify the button is disabled after error
    await expect(resetButton).toBeDisabled();
  });
});
