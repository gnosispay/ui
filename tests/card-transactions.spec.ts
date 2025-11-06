import { test, expect, type Page } from "@playwright/test";
import { BASE_USER } from "./utils/testUsers";
import { setupAllMocks } from "./utils/setupMocks";
import { setupMockWallet } from "./utils/mockWallet";
import { CARD_TRANSACTIONS_SCENARIOS, createPayment, createRefund, createReversal } from "./utils/mockCardTransactions";
import { mockCurrencies } from "./utils/currencyUtils";

test.describe("Card Transactions Component", () => {
  test.beforeEach(async ({ page }) => {
    await setupMockWallet(page);
  });

  // Helper function to setup test with configuration
  const setupTest = async (page: Page, scenario: keyof typeof CARD_TRANSACTIONS_SCENARIOS) => {
    await setupAllMocks(page, BASE_USER, {
      cardTransactions: CARD_TRANSACTIONS_SCENARIOS[scenario],
    });

    // Navigate to the home page and wait for the transactions section to load
    await page.goto("/");
    // Wait for the Transactions section to be visible (it contains the CardTransactions component)
    await page.waitForSelector("text=Transactions", { timeout: 10000 });
  };

  // Helper function to get the card transactions component
  const getCardTransactionsComponent = (page: Page) => {
    return page.getByTestId("card-transactions-component");
  };

  test.describe("Basic Transaction List Display", () => {
    test("displays empty transaction state", async ({ page }) => {
      await setupTest(page, "empty");

      const cardTransactionsComponent = getCardTransactionsComponent(page);

      await test.step("card transactions component is visible", async () => {
        await expect(cardTransactionsComponent).toBeVisible();
      });

      await test.step("empty state displays with inbox icon", async () => {
        await expect(cardTransactionsComponent.getByTestId("empty-transactions-icon")).toBeVisible();
      });

      await test.step("empty state message is displayed", async () => {
        await expect(cardTransactionsComponent.getByTestId("empty-transactions-message")).toBeVisible();
      });

      await test.step("no transaction rows are visible", async () => {
        await expect(cardTransactionsComponent.getByTestId("transaction-row-0")).not.toBeVisible();
      });
    });

    test("displays single pending transaction", async ({ page }) => {
      await setupTest(page, "singlePending");

      const cardTransactionsComponent = getCardTransactionsComponent(page);

      await test.step("transaction row is visible", async () => {
        await expect(cardTransactionsComponent.getByTestId("transaction-row-0")).toBeVisible();
      });

      await test.step("date header shows current date", async () => {
        await expect(cardTransactionsComponent.getByTestId("transaction-date-header")).toBeVisible();
      });

      await test.step("merchant name Coffee Shop is displayed", async () => {
        await expect(cardTransactionsComponent.getByTestId("transaction-merchant-name")).toContainText("Coffee Shop");
      });

      await test.step("amount shows negative value for payment", async () => {
        await expect(cardTransactionsComponent.getByTestId("transaction-amount")).toContainText("- €3.50");
      });

      await test.step("pending status is shown", async () => {
        await expect(cardTransactionsComponent.getByTestId("transaction-status-pending")).toBeVisible();
      });
      await test.step("pending status help icon is visible", async () => {
        const pendingStatus = cardTransactionsComponent.getByTestId("transaction-status-pending");
        await expect(pendingStatus).toBeVisible();

        const helpIcon = page.getByTestId("help-icon-pending");
        await expect(helpIcon).toBeVisible();
      });

      await test.step("clicking help icon shows help content", async () => {
        const helpIcon = page.getByTestId("help-icon-pending");
        await helpIcon.click();

        const helpContent = page.getByTestId("help-content-pending");
        await expect(helpContent).toBeVisible();
        await expect(helpContent).toContainText("This transaction is awaiting settlement.");
      });

      await test.step("help content can be closed by clicking outside", async () => {
        const helpContent = page.getByTestId("help-content-pending");

        // Click outside the popover to close it
        await page.click("body");

        // Verify the help content is no longer visible
        await expect(helpContent).not.toBeVisible();
      });

      await test.step("transaction row is clickable", async () => {
        const transactionRow = cardTransactionsComponent.getByTestId("transaction-row-0");
        await expect(transactionRow).toBeVisible();
        await expect(transactionRow).toHaveAttribute("type", "button");
      });
    });

    test("displays single completed transaction", async ({ page }) => {
      await setupTest(page, "singleCompleted");

      const cardTransactionsComponent = getCardTransactionsComponent(page);

      await test.step("transaction row is visible", async () => {
        await expect(cardTransactionsComponent.getByTestId("transaction-row-0")).toBeVisible();
      });

      await test.step("merchant name Grocery Store is displayed", async () => {
        await expect(cardTransactionsComponent.getByTestId("transaction-merchant-name")).toContainText("Grocery Store");
      });

      await test.step("amount shows correct value", async () => {
        await expect(cardTransactionsComponent.getByTestId("transaction-amount")).toContainText("- €25.00");
      });

      await test.step("no pending status indicator", async () => {
        await expect(cardTransactionsComponent.getByTestId("transaction-status-pending")).not.toBeVisible();
      });
    });

    test("displays mixed transaction types with multi-currency", async ({ page }) => {
      // Create a custom mixed scenario with multi-currency transactions and mixed dates
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      const mixedMultiCurrencyScenario = {
        count: 4,
        next: null,
        previous: null,
        results: [
          // Today's transactions
          createPayment({
            threadId: "payment-eur-today-1",
            isPending: false,
            createdAt: today.toISOString(),
            merchant: { name: "Amazon", city: "Seattle", country: { alpha2: "US", name: "United States" } },
            billingAmount: "49990000000000000000", // €49.99 (18 decimals)
            billingCurrency: mockCurrencies.EUR,
            transactionAmount: "49990000000000000000",
            transactionCurrency: mockCurrencies.EUR,
            mcc: "5399",
          }),
          createRefund({
            threadId: "refund-eur-today-1",
            createdAt: today.toISOString(),
            merchant: { name: "Best Buy", city: "Seattle", country: { alpha2: "US", name: "United States" } },
            billingAmount: "19990000000000000000", // €19.99 refund (18 decimals)
            billingCurrency: mockCurrencies.EUR,
            transactionAmount: "19990000000000000000",
            transactionCurrency: mockCurrencies.EUR,
            refundAmount: "19990000000000000000",
            mcc: "5399",
          }),
          // Yesterday's transactions
          createReversal({
            threadId: "reversal-usd-yesterday-1",
            createdAt: yesterday.toISOString(),
            merchant: { name: "Gas Station", city: "New York", country: { alpha2: "US", name: "United States" } },
            billingAmount: "45000000000000000000", // €45.00 (converted from $50.00, 18 decimals)
            billingCurrency: mockCurrencies.EUR,
            transactionAmount: "50000000", // $50.00 original (6 decimals for USD)
            transactionCurrency: mockCurrencies.USD,
            reversalAmount: "50000000",
            mcc: "5542",
          }),
          createPayment({
            threadId: "payment-gbp-yesterday-1",
            isPending: true,
            createdAt: yesterday.toISOString(),
            merchant: { name: "London Shop", city: "London", country: { alpha2: "GB", name: "United Kingdom" } },
            billingAmount: "23000000000000000000", // €23.00 (converted from £20.00, 18 decimals)
            billingCurrency: mockCurrencies.EUR,
            transactionAmount: "20000000000000000000", // £20.00 original (18 decimals for GBP)
            transactionCurrency: mockCurrencies.GBP,
            mcc: "5411",
          }),
        ],
      };

      await setupAllMocks(page, BASE_USER, {
        cardTransactions: mixedMultiCurrencyScenario,
      });

      await page.goto("/");
      // Wait for the Transactions section to be visible
      await page.waitForSelector("text=Transactions", { timeout: 10000 });
      await page.waitForTimeout(1000);

      const cardTransactionsComponent = getCardTransactionsComponent(page);

      await test.step("multiple transaction rows are visible", async () => {
        // Since transactions are grouped by date, each group has its own indexing (0, 1)
        // We should have 4 total transaction rows across 2 date groups
        const allTransactionRows = cardTransactionsComponent.locator('[data-testid^="transaction-row-"]');
        await expect(allTransactionRows).toHaveCount(4);
      });

      await test.step("today's transactions show correct details", async () => {
        // Get the first date group (today's transactions)
        const dateGroups = cardTransactionsComponent
          .locator("> div")
          .filter({ has: page.getByTestId("transaction-date-header") });
        const todayGroup = dateGroups.first();

        // Today's first transaction (Amazon payment)
        const amazonRow = todayGroup.getByTestId("transaction-row-0");
        await expect(amazonRow.getByTestId("transaction-merchant-name")).toContainText("Amazon");
        await expect(amazonRow.getByTestId("transaction-amount")).toContainText("- €49.99");

        // Today's second transaction (Best Buy refund)
        const bestBuyRow = todayGroup.getByTestId("transaction-row-1");
        await expect(bestBuyRow.getByTestId("transaction-merchant-name")).toContainText("Best Buy");
        await expect(bestBuyRow.getByTestId("transaction-amount")).toContainText("+ €19.99");
        await expect(bestBuyRow.getByTestId("transaction-status-refund")).toBeVisible();
      });

      await test.step("yesterday's transactions show correct details", async () => {
        // Get the second date group (yesterday's transactions)
        const dateGroups = cardTransactionsComponent
          .locator("> div")
          .filter({ has: page.getByTestId("transaction-date-header") });
        const yesterdayGroup = dateGroups.nth(1);

        // Yesterday's first transaction (Gas Station reversal)
        const gasStationRow = yesterdayGroup.getByTestId("transaction-row-0");
        await expect(gasStationRow.getByTestId("transaction-merchant-name")).toContainText("Gas Station");
        await expect(gasStationRow.getByTestId("transaction-amount")).toContainText("+ €45.00");
        await expect(gasStationRow.getByTestId("transaction-status-reversal")).toBeVisible();

        // Yesterday's second transaction (London Shop pending payment)
        const londonShopRow = yesterdayGroup.getByTestId("transaction-row-1");
        await expect(londonShopRow.getByTestId("transaction-merchant-name")).toContainText("London Shop");
        await expect(londonShopRow.getByTestId("transaction-amount")).toContainText("- €23.00");
        await expect(londonShopRow.getByTestId("transaction-status-pending")).toBeVisible();
        // Secondary amount should show original currency - this will be in a separate div
        await expect(londonShopRow).toContainText("£20.00");
      });
    });
  });
});
