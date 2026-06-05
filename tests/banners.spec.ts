import { test, expect } from "@playwright/test";
import { BASE_USER } from "./utils/testUsers";
import { setupAllMocks } from "./utils/setupMocks";
import { setupMockWallet } from "./utils/mockWallet";
import { mockSafeMigration } from "./utils/mockSafeMigration";

const OLD_SAFE_NOT_AFFECTED_WITH_BALANCE = "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
const OLD_SAFE_NOT_AFFECTED_NO_BALANCE = "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb";
const OLD_SAFE_AFFECTED_WITH_BALANCE = "0xcccccccccccccccccccccccccccccccccccccccc";
const OLD_SAFE_AFFECTED_NO_BALANCE = "0xdddddddddddddddddddddddddddddddddddddddd";

const RECOVERY_CSV = [
  "old_safe_address,affected,pre_hack_balance_usd",
  `${OLD_SAFE_NOT_AFFECTED_WITH_BALANCE},FALSE,150.00`,
  `${OLD_SAFE_NOT_AFFECTED_NO_BALANCE},FALSE,0`,
  `${OLD_SAFE_AFFECTED_WITH_BALANCE},TRUE,75.50`,
  `${OLD_SAFE_AFFECTED_NO_BALANCE},TRUE,0`,
].join("\n");

async function setupBannerTest(page: Parameters<typeof setupAllMocks>[0], oldSafeAddress: string) {
  await setupAllMocks(page, BASE_USER);
  await mockSafeMigration({
    page,
    data: { hasOldSafe: true, oldSafeAddress, newSafeAddress: BASE_USER.safeAddress },
  });
  await page.route("**/safe-recovery-data.csv", (route) =>
    route.fulfill({ status: 200, contentType: "text/csv", body: RECOVERY_CSV }),
  );
  await page.goto("/");
  await page.waitForLoadState("networkidle");
}

test.describe("Incident banner - 4 cases", () => {
  test.beforeEach(async ({ page }) => {
    await setupMockWallet(page);
  });

  test("not affected, has balance - shows move funds CTA", async ({ page }) => {
    await setupBannerTest(page, OLD_SAFE_NOT_AFFECTED_WITH_BALANCE);
    const banner = page.getByTestId("incident-notice-banner");
    await expect(banner).toBeVisible();
    await expect(banner).toContainText("Your Gnosis Pay card is back up and running.");
    await expect(banner).toContainText("move them from your old Safe");
    await expect(banner.getByRole("link", { name: "Move my funds" })).toHaveAttribute("href", "/withdraw-legacy");
  });

  test("not affected, no balance - shows new Safe address message", async ({ page }) => {
    await setupBannerTest(page, OLD_SAFE_NOT_AFFECTED_NO_BALANCE);
    const banner = page.getByTestId("incident-notice-banner");
    await expect(banner).toBeVisible();
    await expect(banner).toContainText("Your Gnosis Pay card is back up and running.");
    await expect(banner).toContainText("Please only use the new Safe address going forward.");
    await expect(banner.getByRole("link", { name: "Move my funds" })).not.toBeVisible();
  });

  test("affected, has balance - shows restored balance message", async ({ page }) => {
    await setupBannerTest(page, OLD_SAFE_AFFECTED_WITH_BALANCE);
    const banner = page.getByTestId("incident-notice-banner");
    await expect(banner).toBeVisible();
    await expect(banner).toContainText("Your Gnosis Pay card is coming back.");
    await expect(banner).toContainText(
      "Funds are now being restored and will appear on your balance by EOD Sunday, June 7th.",
    );
    await expect(banner).toContainText("Do not use your old Safe address again");
  });

  test("affected, no balance - shows new Safe issued message", async ({ page }) => {
    await setupBannerTest(page, OLD_SAFE_AFFECTED_NO_BALANCE);
    const banner = page.getByTestId("incident-notice-banner");
    await expect(banner).toBeVisible();
    await expect(banner).toContainText("Your Gnosis Pay card is back up and running.");
    await expect(banner).toContainText("We've issued you a new Gnosis Pay Safe");
    await expect(banner).toContainText("Do not use your old Safe address again");
  });

  test("no old safe - banner not shown", async ({ page }) => {
    await setupAllMocks(page, BASE_USER);
    await mockSafeMigration({ page, data: { hasOldSafe: false } });
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await expect(page.getByTestId("incident-notice-banner")).not.toBeVisible();
  });
});

test.describe("Partner banner", () => {
  test.beforeEach(async ({ page }) => {
    await setupMockWallet(page);
  });

  test("displays, has correct link, and dismisses correctly", async ({ page }) => {
    await setupAllMocks(page, BASE_USER);
    await mockSafeMigration({ page, data: { hasOldSafe: false } });

    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const partnerBanner = page.getByTestId("partner-banner");
    await expect(partnerBanner).toBeVisible();
    await expect(partnerBanner).toContainText("Discover partner apps");
    await expect(partnerBanner).toContainText("For the best Gnosis Pay experience");
    await expect(partnerBanner).toHaveAttribute("href", "https://gnosispay.com/apps");

    await page.getByTestId("partner-banner-dismiss").click();
    await expect(partnerBanner).not.toBeVisible();

    await page.reload();
    await page.waitForLoadState("networkidle");
    await expect(partnerBanner).not.toBeVisible();
  });
});
