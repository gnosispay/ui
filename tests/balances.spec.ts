import { test, expect, type Page } from "@playwright/test";
import { BASE_USER } from "./utils/testUsers";
import { setupAllMocks } from "./utils/setupMocks";
import { setupMockWallet } from "./utils/mockWallet";

/**
 * Balances Component Test Specification
 * Tests the display and behavior of account balances including spendable, pending, and unspendable amounts
 */

// Test configuration interface
interface TestConfig {
  accountBalances: {
    total: string;
    spendable: string;
    pending: string;
  };
  safeConfig?: {
    fiatSymbol: string;
    [key: string]: unknown;
  };
}

test.describe("Balances Component", () => {
  test.beforeEach(async ({ page }) => {
    await setupMockWallet(page);
  });

  // Helper function to setup test with configuration
  const setupTest = async (page: Page, config: TestConfig) => {
    await setupAllMocks(page, BASE_USER, {
      accountBalances: config.accountBalances,
      safeConfig: {
        ...BASE_USER.safeConfig,
        ...config.safeConfig,
      },
    });

    // Navigate to the page and wait for the component to load
    await page.goto("/");
    await page.waitForSelector('[data-testid="balances-component"]');
  };

  // Helper function to get the balances component
  const getBalancesComponent = (page: Page) => {
    return page.getByTestId("balances-component");
  };

  test("displays basic balance with no pending or unspendable amounts", async ({ page }) => {
    await setupTest(page, {
      accountBalances: {
        total: "1000000000000000000000",
        spendable: "1000000000000000000000",
        pending: "0",
      },
      safeConfig: {
        fiatSymbol: "EUR",
      },
    });

    const balancesComponent = getBalancesComponent(page);

    await test.step("balance amount is visible", async () => {
      await expect(balancesComponent.getByTestId("balance-amount")).toContainText("1,000.00");
    });

    await test.step("pending amount is not visible", async () => {
      await expect(balancesComponent.getByTestId("pending-amount")).not.toBeVisible();
    });

    await test.step("unspendable amount is not visible", async () => {
      await expect(balancesComponent.getByTestId("unspendable-amount")).not.toBeVisible();
    });
  });

  test("displays balance with pending amount", async ({ page }) => {
    await setupTest(page, {
      accountBalances: {
        total: "1050000000000000000000",
        spendable: "1000000000000000000000",
        pending: "50000000000000000000",
      },
      safeConfig: {
        fiatSymbol: "EUR",
      },
    });

    const balancesComponent = getBalancesComponent(page);

    await test.step("main balance is visible", async () => {
      await expect(balancesComponent.getByTestId("balance-amount")).toContainText("1,000.00");
    });

    await test.step("pending amount is visible", async () => {
      await expect(balancesComponent.getByTestId("pending-amount")).toContainText("50.00 pending");
    });
  });

  test("displays balance with unspendable amount", async ({ page }) => {
    await setupTest(page, {
      accountBalances: {
        total: "1075000000000000000000", // 1,075.00 tokens
        spendable: "1000000000000000000000", // 1,000.00 tokens
        pending: "0",
      },
      safeConfig: {
        fiatSymbol: "EUR",
      },
    });

    const balancesComponent = getBalancesComponent(page);

    await test.step("main balance is visible", async () => {
      await expect(balancesComponent.getByTestId("balance-amount")).toContainText("1,000.00");
    });

    await test.step("unspendable amount is visible", async () => {
      // The unspendable amount shows in the balances component
      await expect(balancesComponent.getByTestId("unspendable-amount")).toContainText("75.00 not spendable");

      // The alert with detailed message and actions appears elsewhere on the page
      const alert = page.getByRole("alert");
      await expect(alert).toBeVisible();
      await expect(alert).toContainText(
        "A deposit into your account did not pass validation check and €75.00 are unspendable",
      );

      // Check interactive elements within the alert
      const contactButton = alert.getByRole("button", { name: "contact support" });
      const helpCenterLink = alert.getByRole("link", { name: "visit our help center" });

      await expect(contactButton).toBeVisible();
      await expect(helpCenterLink).toBeVisible();
      await expect(helpCenterLink).toHaveAttribute("href", "https://help.gnosispay.com/");
    });
  });

  test("displays balance with both pending and unspendable amounts", async ({ page }) => {
    await setupTest(page, {
      accountBalances: {
        total: "1125000000000000000000", // 1,125.00 tokens (1000 + 50 + 75)
        spendable: "1000000000000000000000", // 1,000.00 tokens
        pending: "50000000000000000000", // 50.00 tokens
      },
      safeConfig: {
        fiatSymbol: "EUR",
      },
    });

    const balancesComponent = getBalancesComponent(page);

    await test.step("main balance is visible", async () => {
      await expect(balancesComponent.getByTestId("balance-amount")).toContainText("1,000.00");
    });

    await test.step("pending amount is visible", async () => {
      await expect(balancesComponent.getByTestId("pending-amount")).toContainText("50.00 pending");
    });

    await test.step("unspendable amount is visible", async () => {
      // The unspendable amount shows in the balances component
      await expect(balancesComponent.getByTestId("unspendable-amount")).toContainText("75.00 not spendable");

      // The alert with detailed message and actions appears elsewhere on the page
      const alert = page.getByRole("alert");
      await expect(alert).toBeVisible();
      await expect(alert).toContainText(
        "A deposit into your account did not pass validation check and €75.00 are unspendable",
      );

      // Check interactive elements within the alert
      const contactButton = alert.getByRole("button", { name: "contact support" });
      const helpCenterLink = alert.getByRole("link", { name: "visit our help center" });
      await expect(contactButton).toBeVisible();
      await expect(helpCenterLink).toBeVisible();
      await expect(helpCenterLink).toHaveAttribute("href", "https://help.gnosispay.com/");
    });
  });

  test("handles different currency formats - USD", async ({ page }) => {
    await setupTest(page, {
      accountBalances: {
        total: "1000000000",
        spendable: "1000000000",
        pending: "0",
      },
      safeConfig: {
        fiatSymbol: "USD",
      },
    });

    const balancesComponent = getBalancesComponent(page);

    await test.step("displays USD format", async () => {
      await expect(balancesComponent.getByTestId("balance-amount")).toContainText("$1,000.00");
    });
  });

  test("handles different currency formats - GBP", async ({ page }) => {
    await setupTest(page, {
      accountBalances: {
        total: "1000000000000000000000",
        spendable: "1000000000000000000000",
        pending: "0",
      },
      safeConfig: {
        fiatSymbol: "GBP",
      },
    });

    const balancesComponent = getBalancesComponent(page);

    await test.step("displays GBP format", async () => {
      await expect(balancesComponent.getByTestId("balance-amount")).toContainText("£1,000.00");
    });
  });

  test("handles edge cases with zero balances", async ({ page }) => {
    await setupTest(page, {
      accountBalances: {
        total: "0",
        spendable: "0",
        pending: "0",
      },
      safeConfig: {
        fiatSymbol: "EUR",
      },
    });

    const balancesComponent = getBalancesComponent(page);

    await test.step("displays zero balance correctly", async () => {
      await expect(balancesComponent.getByTestId("balance-amount")).toContainText("€0.00");
    });
  });
});
