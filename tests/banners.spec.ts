import { test, expect } from "@playwright/test";
import { createUserWithIban, createUserWithoutIban } from "./utils/testUsers";
import { setupAllMocks } from "./utils/setupMocks";
import { setupMockWallet } from "./utils/mockWallet";

test.describe("Home Page Banners", () => {
  test.beforeEach(async ({ page }) => {
    await setupMockWallet(page);
  });

  test("partner and IBAN banners display, navigate, and dismiss correctly", async ({ page }) => {
    // Setup mocks with user eligible for IBAN but without IBAN set
    const userWithoutIban = createUserWithoutIban();
    await setupAllMocks(page, userWithoutIban, {
      ibansAvailable: {
        available: true,
      },
    });

    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await test.step("verify partner banner is visible", async () => {
      const partnerBanner = page.getByTestId("partner-banner");
      await expect(partnerBanner).toBeVisible();
      await expect(partnerBanner).toContainText("Discover partner apps");
      await expect(partnerBanner).toContainText("For the best Gnosis Pay experience");
    });

    await test.step("verify IBAN banner is visible and clickable", async () => {
      const ibanBanner = page.getByTestId("iban-banner");
      await expect(ibanBanner).toBeVisible();
      await expect(ibanBanner).toContainText("Create your IBAN");
      await expect(ibanBanner).toContainText("Get an IBAN to receive funds");
    });

    await test.step("IBAN banner opens integration modal when clicked", async () => {
      const ibanBanner = page.getByTestId("iban-banner");

      // Click the banner
      await ibanBanner.click();

      // Verify the IBAN integration modal opens
      const modal = page.getByTestId("iban-integration-modal");
      await expect(modal).toBeVisible();

      // Verify modal title
      await expect(modal.getByText("Create Your IBAN")).toBeVisible();

      // Verify the "Authorize & Create IBAN" button is present
      await expect(modal.getByRole("button", { name: /Authorize & Create IBAN/i })).toBeVisible();

      // Verify the Cancel button is present
      await expect(modal.getByRole("button", { name: /Cancel/i })).toBeVisible();

      // Close the modal by clicking Cancel
      await modal.getByRole("button", { name: /Cancel/i }).click();

      // Verify modal is closed
      await expect(modal).not.toBeVisible();
    });

    await test.step("partner banner has correct link", async () => {
      const partnerBanner = page.getByTestId("partner-banner");

      // Get the href attribute and verify it's correct
      const href = await partnerBanner.getAttribute("href");
      expect(href).toBe("https://gnosispay.com/apps");

      // Note: Since this is an external link, we just verify the href is correct
      // rather than actually navigating to avoid external dependencies in tests
    });

    await test.step("dismiss partner banner", async () => {
      const partnerBanner = page.getByTestId("partner-banner");
      await expect(partnerBanner).toBeVisible();

      // Find and click the dismiss button
      const dismissButton = page.getByTestId("partner-banner-dismiss");
      await dismissButton.click();

      // Verify banner is no longer visible
      await expect(partnerBanner).not.toBeVisible();

      // Reload page and verify banner stays dismissed (stored in localStorage)
      await page.reload();
      await page.waitForLoadState("networkidle");
      await expect(partnerBanner).not.toBeVisible();
    });

    await test.step("dismiss IBAN banner", async () => {
      const ibanBanner = page.getByTestId("iban-banner");
      await expect(ibanBanner).toBeVisible();

      // Find and click the dismiss button
      const dismissButton = page.getByTestId("iban-banner-dismiss");
      await dismissButton.click();

      // Verify banner is no longer visible
      await expect(ibanBanner).not.toBeVisible();

      // Reload page and verify banner stays dismissed (stored in localStorage)
      await page.reload();
      await page.waitForLoadState("networkidle");
      await expect(ibanBanner).not.toBeVisible();
    });
  });

  test("IBAN banner does not show when user is not eligible for IBAN", async ({ page }) => {
    // Setup mocks with user who is not eligible for IBAN (available: false)
    const userWithoutIban = createUserWithoutIban();
    await setupAllMocks(page, userWithoutIban, {
      ibansAvailable: {
        available: false,
      },
    });

    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await test.step("verify IBAN banner is not visible when not eligible", async () => {
      const ibanBanner = page.getByTestId("iban-banner");
      await expect(ibanBanner).not.toBeVisible();
    });

    await test.step("verify partner banner is still visible", async () => {
      const partnerBanner = page.getByTestId("partner-banner");
      await expect(partnerBanner).toBeVisible();
    });
  });

  test("IBAN banner does not show when user already has an IBAN", async ({ page }) => {
    // Create a user with moneriumIban set in bankingDetails
    const userWithIban = createUserWithIban();

    // Setup mocks with user who has IBAN (even though eligible, banner shouldn't show)
    await setupAllMocks(page, userWithIban, {
      ibansAvailable: {
        available: true, // User is eligible but already has IBAN
      },
    });

    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await test.step("verify IBAN banner is not visible when user has IBAN", async () => {
      const ibanBanner = page.getByTestId("iban-banner");
      await expect(ibanBanner).not.toBeVisible();
    });

    await test.step("verify partner banner is still visible", async () => {
      const partnerBanner = page.getByTestId("partner-banner");
      await expect(partnerBanner).toBeVisible();
    });
  });
});
