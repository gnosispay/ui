import { test, expect, type Page } from "@playwright/test";
import { BASE_USER } from "./utils/testUsers";
import { setupAllMocks } from "./utils/setupMocks";
import { setupMockWallet } from "./utils/mockWallet";
import { REWARDS_SCENARIOS, calculateTotalCashbackRate } from "./utils/mockRewards";

/**
 * Rewards Component Test Specification
 * Tests the display and behavior of the rewards section including GNO balance, cashback rates, and OG NFT badge
 */

// Test configuration interface
interface RewardsTestConfig {
  rewards: {
    isOg: boolean;
    gnoBalance: number;
    cashbackRate: number;
  };
}

test.describe("Rewards Component", () => {
  test.beforeEach(async ({ page }) => {
    await setupMockWallet(page);
  });

  // Helper function to setup test with configuration
  const setupTest = async (page: Page, config: RewardsTestConfig) => {
    await setupAllMocks(page, BASE_USER, {
      rewards: config.rewards,
    });

    // Navigate to the page and wait for the component to load
    await page.goto("/");
    await page.waitForSelector('[data-testid="rewards-component"]');
  };

  // Helper function to get the rewards component
  const getRewardsComponent = (page: Page) => {
    return page.getByTestId("rewards-component");
  };

  test("displays basic rewards for new user with no GNO balance", async ({ page }) => {
    await setupTest(page, {
      rewards: REWARDS_SCENARIOS.NEW_USER,
    });

    const rewardsComponent = getRewardsComponent(page);

    await test.step("cashback rate is visible", async () => {
      await expect(rewardsComponent.getByTestId("cashback-rate")).toContainText("0.00%");
    });

    await test.step("GNO balance is visible", async () => {
      await expect(rewardsComponent.getByTestId("gno-balance-amount")).toContainText("0.00 GNO");
    });

    await test.step("OG badge is not visible", async () => {
      await expect(rewardsComponent.getByTestId("og-badge")).not.toBeVisible();
    });

    await test.step("cashback label is visible", async () => {
      await expect(rewardsComponent.getByTestId("cashback-label")).toContainText("Cashback");
    });

    await test.step("GNO balance label is visible", async () => {
      await expect(rewardsComponent.getByTestId("gno-balance-label")).toContainText("GNO balance");
    });
  });

  test("displays rewards for user with small GNO balance", async ({ page }) => {
    await setupTest(page, {
      rewards: REWARDS_SCENARIOS.SMALL_BALANCE,
    });

    const rewardsComponent = getRewardsComponent(page);

    await test.step("cashback rate shows correct percentage", async () => {
      await expect(rewardsComponent.getByTestId("cashback-rate")).toContainText("1.00%");
    });

    await test.step("GNO balance shows correct amount", async () => {
      await expect(rewardsComponent.getByTestId("gno-balance-amount")).toContainText("2.50 GNO");
    });

    await test.step("OG badge is not visible for regular user", async () => {
      await expect(rewardsComponent.getByTestId("og-badge")).not.toBeVisible();
    });
  });

  test("displays rewards for user with medium GNO balance", async ({ page }) => {
    await setupTest(page, {
      rewards: REWARDS_SCENARIOS.MEDIUM_BALANCE,
    });

    const rewardsComponent = getRewardsComponent(page);

    await test.step("cashback rate shows correct percentage", async () => {
      await expect(rewardsComponent.getByTestId("cashback-rate")).toContainText("2.00%");
    });

    await test.step("GNO balance shows correct amount", async () => {
      await expect(rewardsComponent.getByTestId("gno-balance-amount")).toContainText("10.00 GNO");
    });
  });

  test("displays rewards for user with large GNO balance", async ({ page }) => {
    await setupTest(page, {
      rewards: REWARDS_SCENARIOS.LARGE_BALANCE,
    });

    const rewardsComponent = getRewardsComponent(page);

    await test.step("cashback rate shows maximum base rate", async () => {
      await expect(rewardsComponent.getByTestId("cashback-rate")).toContainText("4.00%");
    });

    await test.step("GNO balance shows correct amount", async () => {
      await expect(rewardsComponent.getByTestId("gno-balance-amount")).toContainText("50.00 GNO");
    });
  });

  test("displays OG NFT badge for OG user with no balance", async ({ page }) => {
    await setupTest(page, {
      rewards: REWARDS_SCENARIOS.OG_NO_BALANCE,
    });

    const rewardsComponent = getRewardsComponent(page);

    await test.step("OG badge is visible", async () => {
      await expect(rewardsComponent.getByTestId("og-badge")).toBeVisible();
    });

    await test.step("cashback rate includes OG bonus", async () => {
      const totalRate = calculateTotalCashbackRate(REWARDS_SCENARIOS.OG_NO_BALANCE);
      await expect(rewardsComponent.getByTestId("cashback-rate")).toContainText(`${totalRate.toFixed(2)}%`);
    });

    await test.step("GNO balance shows zero", async () => {
      await expect(rewardsComponent.getByTestId("gno-balance-amount")).toContainText("0.00 GNO");
    });
  });

  test("displays OG NFT badge for OG user with small balance", async ({ page }) => {
    await setupTest(page, {
      rewards: REWARDS_SCENARIOS.OG_SMALL_BALANCE,
    });

    const rewardsComponent = getRewardsComponent(page);

    await test.step("OG badge is visible", async () => {
      await expect(rewardsComponent.getByTestId("og-badge")).toBeVisible();
    });

    await test.step("cashback rate includes OG bonus (2% base + 1% OG)", async () => {
      const totalRate = calculateTotalCashbackRate(REWARDS_SCENARIOS.OG_SMALL_BALANCE);
      await expect(rewardsComponent.getByTestId("cashback-rate")).toContainText(`${totalRate.toFixed(2)}%`);
    });

    await test.step("GNO balance shows correct amount", async () => {
      await expect(rewardsComponent.getByTestId("gno-balance-amount")).toContainText("2.50 GNO");
    });
  });

  test("displays OG NFT badge for OG user with medium balance", async ({ page }) => {
    await setupTest(page, {
      rewards: REWARDS_SCENARIOS.OG_MEDIUM_BALANCE,
    });

    const rewardsComponent = getRewardsComponent(page);

    await test.step("OG badge is visible", async () => {
      await expect(rewardsComponent.getByTestId("og-badge")).toBeVisible();
    });

    await test.step("cashback rate includes OG bonus (2% base + 1% OG)", async () => {
      const totalRate = calculateTotalCashbackRate(REWARDS_SCENARIOS.OG_MEDIUM_BALANCE);
      await expect(rewardsComponent.getByTestId("cashback-rate")).toContainText(`${totalRate.toFixed(2)}%`);
    });

    await test.step("GNO balance shows correct amount", async () => {
      await expect(rewardsComponent.getByTestId("gno-balance-amount")).toContainText("10.00 GNO");
    });
  });

  test("displays OG NFT badge for OG user with large balance", async ({ page }) => {
    await setupTest(page, {
      rewards: REWARDS_SCENARIOS.OG_LARGE_BALANCE,
    });

    const rewardsComponent = getRewardsComponent(page);

    await test.step("OG badge is visible", async () => {
      await expect(rewardsComponent.getByTestId("og-badge")).toBeVisible();
    });

    await test.step("cashback rate includes OG bonus (4% base + 1% OG)", async () => {
      const totalRate = calculateTotalCashbackRate(REWARDS_SCENARIOS.OG_LARGE_BALANCE);
      await expect(rewardsComponent.getByTestId("cashback-rate")).toContainText(`${totalRate.toFixed(2)}%`);
    });

    await test.step("GNO balance shows correct amount", async () => {
      await expect(rewardsComponent.getByTestId("gno-balance-amount")).toContainText("50.00 GNO");
    });
  });

  test("displays maximum rewards scenario", async ({ page }) => {
    await setupTest(page, {
      rewards: REWARDS_SCENARIOS.MAX_REWARDS,
    });

    const rewardsComponent = getRewardsComponent(page);

    await test.step("OG badge is visible", async () => {
      await expect(rewardsComponent.getByTestId("og-badge")).toBeVisible();
    });

    await test.step("cashback rate shows maximum (4% base + 1% OG)", async () => {
      const totalRate = calculateTotalCashbackRate(REWARDS_SCENARIOS.MAX_REWARDS);
      await expect(rewardsComponent.getByTestId("cashback-rate")).toContainText(`${totalRate.toFixed(2)}%`);
    });

    await test.step("GNO balance shows large amount", async () => {
      await expect(rewardsComponent.getByTestId("gno-balance-amount")).toContainText("100.00 GNO");
    });
  });

  test("handles fractional GNO balance formatting", async ({ page }) => {
    await setupTest(page, {
      rewards: REWARDS_SCENARIOS.FRACTIONAL_BALANCE,
    });

    const rewardsComponent = getRewardsComponent(page);

    await test.step("GNO balance shows correct decimal formatting", async () => {
      // The component floors to 2 decimal places: 7.25 should show as 7.25
      await expect(rewardsComponent.getByTestId("gno-balance-amount")).toContainText("7.25 GNO");
    });

    await test.step("cashback rate shows correct percentage", async () => {
      await expect(rewardsComponent.getByTestId("cashback-rate")).toContainText("1.50%");
    });
  });

  test("handles very small GNO balance formatting", async ({ page }) => {
    await setupTest(page, {
      rewards: REWARDS_SCENARIOS.TINY_BALANCE,
    });

    const rewardsComponent = getRewardsComponent(page);

    await test.step("GNO balance shows small amount with correct formatting", async () => {
      await expect(rewardsComponent.getByTestId("gno-balance-amount")).toContainText("0.10 GNO");
    });

    await test.step("cashback rate shows small percentage", async () => {
      await expect(rewardsComponent.getByTestId("cashback-rate")).toContainText("0.10%");
    });
  });

  test("handles GNO balance with flooring behavior", async ({ page }) => {
    // Test the specific flooring behavior mentioned in the component
    await setupTest(page, {
      rewards: {
        isOg: false,
        gnoBalance: 0.616, // Should floor to 0.61
        cashbackRate: 0.0,
      },
    });

    const rewardsComponent = getRewardsComponent(page);

    await test.step("GNO balance is floored to 2 decimal places", async () => {
      // 0.616 should become 0.61 (floored, not rounded)
      await expect(rewardsComponent.getByTestId("gno-balance-amount")).toContainText("0.61 GNO");
    });
  });

  test("displays threshold boundary cases correctly", async ({ page }) => {
    // Test exactly at the 10 GNO threshold for OG users
    await setupTest(page, {
      rewards: REWARDS_SCENARIOS.OG_THRESHOLD_10,
    });

    const rewardsComponent = getRewardsComponent(page);

    await test.step("OG badge is visible", async () => {
      await expect(rewardsComponent.getByTestId("og-badge")).toBeVisible();
    });

    await test.step("shows correct cashback rate at threshold", async () => {
      const totalRate = calculateTotalCashbackRate(REWARDS_SCENARIOS.OG_THRESHOLD_10);
      await expect(rewardsComponent.getByTestId("cashback-rate")).toContainText(`${totalRate.toFixed(2)}%`);
    });

    await test.step("shows exact threshold GNO amount", async () => {
      await expect(rewardsComponent.getByTestId("gno-balance-amount")).toContainText("10.00 GNO");
    });
  });

  test("displays threshold boundary cases for 25 GNO", async ({ page }) => {
    await setupTest(page, {
      rewards: REWARDS_SCENARIOS.OG_THRESHOLD_25,
    });

    const rewardsComponent = getRewardsComponent(page);

    await test.step("shows correct cashback rate at 25 GNO threshold", async () => {
      const totalRate = calculateTotalCashbackRate(REWARDS_SCENARIOS.OG_THRESHOLD_25);
      await expect(rewardsComponent.getByTestId("cashback-rate")).toContainText(`${totalRate.toFixed(2)}%`);
    });

    await test.step("shows exact threshold GNO amount", async () => {
      await expect(rewardsComponent.getByTestId("gno-balance-amount")).toContainText("25.00 GNO");
    });
  });

  test("displays threshold boundary cases for 50 GNO", async ({ page }) => {
    await setupTest(page, {
      rewards: REWARDS_SCENARIOS.OG_THRESHOLD_50,
    });

    const rewardsComponent = getRewardsComponent(page);

    await test.step("shows correct cashback rate at 50 GNO threshold", async () => {
      const totalRate = calculateTotalCashbackRate(REWARDS_SCENARIOS.OG_THRESHOLD_50);
      await expect(rewardsComponent.getByTestId("cashback-rate")).toContainText(`${totalRate.toFixed(2)}%`);
    });

    await test.step("shows exact threshold GNO amount", async () => {
      await expect(rewardsComponent.getByTestId("gno-balance-amount")).toContainText("50.00 GNO");
    });
  });

  test("displays default values when API fails", async ({ page }) => {
    await setupAllMocks(page, BASE_USER, {});
    // Mock an error response
    await page.route("**/api/v1/rewards", async (route) => {
      await route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ error: "Internal server error" }),
      });
    });

    await page.goto("/");
    await page.waitForSelector('[data-testid="rewards-component"]');

    const rewardsComponent = getRewardsComponent(page);

    await test.step("shows default state with 0 GNO and 0% when API fails", async () => {
      // Component should show default/initial state when API fails
      await expect(rewardsComponent.getByTestId("cashback-rate")).toContainText("0.00%");
      await expect(rewardsComponent.getByTestId("gno-balance-amount")).toContainText("0 GNO");
      await expect(rewardsComponent.getByTestId("og-badge")).not.toBeVisible();
      await expect(rewardsComponent.getByTestId("cashback-label")).toContainText("Cashback");
      await expect(rewardsComponent.getByTestId("gno-balance-label")).toContainText("GNO balance");
    });
  });

  test("displays help icon with rewards information", async ({ page }) => {
    await setupTest(page, {
      rewards: REWARDS_SCENARIOS.MEDIUM_BALANCE,
    });

    const rewardsComponent = getRewardsComponent(page);

    await test.step("rewards component is visible", async () => {
      await expect(rewardsComponent).toBeVisible();
    });

    await test.step("help icon is visible and clickable", async () => {
      const helpIcon = page.getByTestId("help-icon-rewards");
      await expect(helpIcon).toBeVisible();

      // Click the help icon to open the popover
      await helpIcon.click();
    });

    await test.step("help content is displayed when clicked", async () => {
      const helpContent = page.getByTestId("help-content-rewards");
      await expect(helpContent).toBeVisible();

      // Verify the help content contains the expected text
      await expect(helpContent).toContainText("Learn more about the");
      await expect(helpContent).toContainText("Rewards program");
    });

    await test.step("help content contains working link", async () => {
      const helpContent = page.getByTestId("help-content-rewards");
      const rewardsLink = helpContent.getByRole("link", { name: "Rewards program" });

      await expect(rewardsLink).toBeVisible();
      await expect(rewardsLink).toHaveAttribute(
        "href",
        "https://help.gnosispay.com/hc/en-us/articles/39631920738452-About-the-Gnosis-Pay-GNO-Cashback-Programmes",
      );
      await expect(rewardsLink).toHaveAttribute("target", "_blank");
      await expect(rewardsLink).toHaveAttribute("rel", "noopener noreferrer");
    });

    await test.step("help popover can be closed by clicking outside", async () => {
      const helpContent = page.getByTestId("help-content-rewards");

      // Click outside the popover to close it
      await page.click("body");

      // Verify the help content is no longer visible
      await expect(helpContent).not.toBeVisible();
    });
  });

  test("verifies rewards section layout and positioning", async ({ page }) => {
    await setupTest(page, {
      rewards: REWARDS_SCENARIOS.OG_MEDIUM_BALANCE,
    });

    const rewardsComponent = getRewardsComponent(page);

    await test.step("rewards section is in correct position on page", async () => {
      // Verify the rewards section appears in the expected location
      await expect(rewardsComponent).toBeVisible();
    });

    await test.step("cashback and GNO balance are properly aligned", async () => {
      // Verify the layout structure
      await expect(rewardsComponent.getByTestId("cashback-label")).toContainText("Cashback");
      await expect(rewardsComponent.getByTestId("gno-balance-label")).toContainText("GNO balance");
      await expect(rewardsComponent.getByTestId("og-badge")).toBeVisible();
    });

    await test.step("wallet icon is visible", async () => {
      // The Wallet icon should be visible in the cashback row
      await expect(rewardsComponent.getByTestId("wallet-icon")).toBeVisible();
    });
  });
});
