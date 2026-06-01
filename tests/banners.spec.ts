import { test, expect } from "@playwright/test";
import { BASE_USER } from "./utils/testUsers";
import { setupAllMocks } from "./utils/setupMocks";
import { setupMockWallet } from "./utils/mockWallet";

test.describe("Home Page Banners", () => {
  test.beforeEach(async ({ page }) => {
    await setupMockWallet(page);
  });

  test("withdraw banner displays and has correct link", async ({ page }) => {
    await setupAllMocks(page, BASE_USER);

    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await test.step("verify withdraw banner is visible", async () => {
      const withdrawBanner = page.getByTestId("withdraw-banner");
      await expect(withdrawBanner).toBeVisible();
      await expect(withdrawBanner).toContainText("Withdraw your funds");
      await expect(withdrawBanner).toContainText("Transfer your balance to an external wallet");
    });

    await test.step("withdraw banner has correct link", async () => {
      const withdrawBanner = page.getByTestId("withdraw-banner");

      const href = await withdrawBanner.getAttribute("href");
      expect(href).toBe("/withdraw");
    });
  });

  test("partner banner displays, has correct link, and dismisses correctly", async ({ page }) => {
    await setupAllMocks(page, BASE_USER);

    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await test.step("verify partner banner is visible", async () => {
      const partnerBanner = page.getByTestId("partner-banner");
      await expect(partnerBanner).toBeVisible();
      await expect(partnerBanner).toContainText("Discover partner apps");
      await expect(partnerBanner).toContainText("For the best Gnosis Pay experience");
    });

    await test.step("partner banner has correct link", async () => {
      const partnerBanner = page.getByTestId("partner-banner");

      const href = await partnerBanner.getAttribute("href");
      expect(href).toBe("https://gnosispay.com/apps");
    });

    await test.step("dismiss partner banner", async () => {
      const partnerBanner = page.getByTestId("partner-banner");
      await expect(partnerBanner).toBeVisible();

      const dismissButton = page.getByTestId("partner-banner-dismiss");
      await dismissButton.click();

      await expect(partnerBanner).not.toBeVisible();

      await page.reload();
      await page.waitForLoadState("networkidle");
      await expect(partnerBanner).not.toBeVisible();
    });
  });
});
