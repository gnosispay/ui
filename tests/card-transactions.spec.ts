import { test, expect, type Page } from "@playwright/test";
import { BASE_USER } from "./utils/testUsers";
import { setupAllMocks } from "./utils/setupMocks";
import { setupMockWallet } from "./utils/mockWallet";
import {
  CARD_TRANSACTIONS_SCENARIOS,
  createPayment,
  createRefund,
  createReversal,
  PaymentStatus,
} from "./utils/mockCardTransactions";
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
      // Create a custom mixed scenario with multi-currency transactions and specific dates
      const today = new Date("2024-01-16T10:15:00.000Z"); // January 16, 2024 at 10:15 UTC
      const yesterday = new Date("2024-01-15T16:45:00.000Z"); // January 15, 2024 at 16:45 UTC

      const mixedMultiCurrencyScenario = {
        count: 5,
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
          createPayment({
            threadId: "payment-failed-yesterday-1",
            isPending: false,
            createdAt: yesterday.toISOString(),
            merchant: { name: "Coffee Shop", city: "Berlin", country: { alpha2: "DE", name: "Germany" } },
            billingAmount: "4500000000000000000", // €4.50 (18 decimals)
            billingCurrency: mockCurrencies.EUR,
            transactionAmount: "4500000000000000000",
            transactionCurrency: mockCurrencies.EUR,
            status: PaymentStatus.INCORRECT_PIN, // Failed status
            mcc: "5814",
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
        // Since transactions are grouped by date, each group has its own indexing (0, 1, 2)
        // We should have 5 total transaction rows across 2 date groups (2 today, 3 yesterday)
        const allTransactionRows = cardTransactionsComponent.locator('[data-testid^="transaction-row-"]');
        await expect(allTransactionRows).toHaveCount(5);
      });

      await test.step("verify specific date headers", async () => {
        // Get all date headers and verify they show the correct dates
        const dateHeaders = cardTransactionsComponent.getByTestId("transaction-date-header");
        await expect(dateHeaders).toHaveCount(2);

        // First date header should show today's date (JAN 16, 2024)
        await expect(dateHeaders.first()).toContainText("JAN 16, 2024");

        // Second date header should show yesterday's date (JAN 15, 2024)
        await expect(dateHeaders.nth(1)).toContainText("JAN 15, 2024");
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

        // Yesterday's third transaction (Coffee Shop failed payment)
        const coffeeShopRow = yesterdayGroup.getByTestId("transaction-row-2");
        await expect(coffeeShopRow.getByTestId("transaction-merchant-name")).toContainText("Coffee Shop");

        // Verify failed transaction amount has strikethrough formatting
        const failedAmount = coffeeShopRow.getByTestId("transaction-amount");
        await expect(failedAmount).toContainText("- €4.50");
        await expect(failedAmount).toHaveClass(/line-through/);

        // Verify failed status is displayed (should show "Incorrect pin")
        await expect(coffeeShopRow).toContainText("Incorrect pin");
      });
    });
  });

  test.describe("Transaction Row Interaction and Modal Opening", () => {
    test("modal displays correct transaction data for a payment transaction", async ({ page }) => {
      // Use the singleCompleted scenario but with a specific date
      await setupTest(page, "singleCompleted");

      const cardTransactionsComponent = getCardTransactionsComponent(page);

      await test.step("open modal and verify content", async () => {
        // Wait for transaction row to be visible first
        const transactionRow = cardTransactionsComponent.getByTestId("transaction-row-0");
        await expect(transactionRow).toBeVisible();

        // Click transaction to open modal
        await transactionRow.click();

        const modal = page.getByTestId("transaction-details-modal");
        await expect(modal).toBeVisible();

        // Verify merchant name in modal header
        const modalMerchantName = modal.getByTestId("modal-merchant-name");
        await expect(modalMerchantName).toContainText("Grocery Store");

        // Verify the icon is carrot (for MCC 5411 - Grocery stores)
        const modalIcon = modal.getByTestId("modal-icon");
        await expect(modalIcon).toBeVisible();

        // Verify transaction date is formatted correctly
        const modalTransactionDate = modal.getByTestId("modal-transaction-date");
        await expect(modalTransactionDate).toBeVisible();
        // Date should be in format "MMM dd, yyyy 'at' HH:mm" - checking for specific date
        await expect(modalTransactionDate).toContainText("Jan 15, 2024 at 14:30");

        // Verify transaction amount
        const modalTransactionAmount = modal.getByTestId("modal-transaction-amount");
        await expect(modalTransactionAmount).toContainText("- €25.00");

        // Verify status
        const modalTransactionStatus = modal.getByTestId("modal-transaction-status");
        await expect(modalTransactionStatus).toContainText("Completed");

        // Verify cashback status is present
        const modalCashbackStatus = modal.getByTestId("modal-cashback-status");
        await expect(modalCashbackStatus).toBeVisible();
        await expect(modalCashbackStatus).toContainText("Eligible");

        // Verify country (singleCompleted has Germany)
        const modalCountry = modal.getByTestId("modal-country");
        await expect(modalCountry).toContainText("Germany");

        // Verify dispute button is present (transaction has threadId by default)
        const disputeButton = modal.getByTestId("dispute-transaction-button");
        await expect(disputeButton).toBeVisible();
        await expect(disputeButton).toContainText("Dispute Transaction");

        // Verify TxHash is present
        const modalTxHash = modal.getByTestId("modal-txhash");
        await expect(modalTxHash).toBeVisible();
        await expect(modalTxHash).toContainText("0x22cb");

        // Verify the external link button is present
        const modalTxHashExternalLink = modal.getByTestId("txhash-external-link");
        await expect(modalTxHashExternalLink).toBeVisible();

        // Note: The external link uses onClick with window.open(), not href attribute
        // So we just verify the button is present and clickable

        // Verify the card info (contains both type and number)
        const modalCardInfo = modal.getByTestId("modal-card-info");
        await expect(modalCardInfo).toBeVisible();
        await expect(modalCardInfo).toContainText("••• 1234");
      });

      await test.step("close modal by clicking outside", async () => {
        // Click outside modal (on the overlay)
        const dialogOverlay = page.locator('[data-slot="dialog-overlay"]');
        await dialogOverlay.click({ position: { x: 10, y: 10 } });

        // Verify modal closes
        const modal = page.getByTestId("transaction-details-modal");
        await expect(modal).not.toBeVisible();

        // Verify we're back to the transaction list
        const transactionRow = cardTransactionsComponent.getByTestId("transaction-row-0");
        await expect(transactionRow).toBeVisible();
      });
    });

    test("modal displays correct transaction data for a refund transaction", async ({ page }) => {
      // Use the singleRefund scenario
      await setupTest(page, "singleRefund");

      const cardTransactionsComponent = getCardTransactionsComponent(page);

      await test.step("open modal and verify refund content", async () => {
        const transactionRow = cardTransactionsComponent.getByTestId("transaction-row-0");
        await expect(transactionRow).toBeVisible();
        await transactionRow.click();

        const modal = page.getByTestId("transaction-details-modal");
        await expect(modal).toBeVisible();

        // Verify merchant name
        const modalMerchantName = modal.getByTestId("modal-merchant-name");
        await expect(modalMerchantName).toContainText("Amazon");

        // Verify refund amount is displayed (should be positive)
        const modalTransactionAmount = modal.getByTestId("modal-transaction-amount");
        await expect(modalTransactionAmount).toContainText("+ €19.99");

        // Verify refund status (main focus of this test)
        const modalTransactionStatus = modal.getByTestId("modal-transaction-status");
        await expect(modalTransactionStatus).toContainText("Refund");

        // Verify cashback status shows "Not eligible" for refunds
        const modalCashbackStatus = modal.getByTestId("modal-cashback-status");
        await expect(modalCashbackStatus).toBeVisible();
        await expect(modalCashbackStatus).toContainText("Not eligible");

        // Verify card information is displayed
        const modalCardInfo = modal.getByTestId("modal-card-info");
        await expect(modalCardInfo).toBeVisible();
        await expect(modalCardInfo).toContainText("••• 1234");

        // Verify date
        const modalTransactionDate = modal.getByTestId("modal-transaction-date");
        await expect(modalTransactionDate).toContainText("Jan 15, 2024 at 14:30");

        // Verify dispute button is NOT visible for refunds
        const disputeButton = modal.getByTestId("dispute-transaction-button");
        await expect(disputeButton).not.toBeVisible();
      });
    });

    test("modal displays correct transaction data for a reversal transaction", async ({ page }) => {
      // Use the singleReversal scenario
      await setupTest(page, "singleReversal");

      const cardTransactionsComponent = getCardTransactionsComponent(page);

      await test.step("open modal and verify reversal content", async () => {
        const transactionRow = cardTransactionsComponent.getByTestId("transaction-row-0");
        await expect(transactionRow).toBeVisible();
        await transactionRow.click();

        const modal = page.getByTestId("transaction-details-modal");
        await expect(modal).toBeVisible();

        // Verify merchant name
        const modalMerchantName = modal.getByTestId("modal-merchant-name");
        await expect(modalMerchantName).toContainText("Gas Station");

        // Verify reversal status (main focus of this test)
        const modalTransactionStatus = modal.getByTestId("modal-transaction-status");
        await expect(modalTransactionStatus).toContainText("Reversal");

        // Verify date
        const modalTransactionDate = modal.getByTestId("modal-transaction-date");
        await expect(modalTransactionDate).toContainText("Jan 15, 2024 at 14:30");

        // Verify dispute button is NOT visible for reversals
        const disputeButton = modal.getByTestId("dispute-transaction-button");
        await expect(disputeButton).not.toBeVisible();
      });
    });

    test("modal displays correct transaction data for a failed transaction", async ({ page }) => {
      // Use the singleFailed scenario
      await setupTest(page, "singleFailed");

      const cardTransactionsComponent = getCardTransactionsComponent(page);

      await test.step("open modal and verify failed transaction content", async () => {
        const transactionRow = cardTransactionsComponent.getByTestId("transaction-row-0");
        await expect(transactionRow).toBeVisible();
        await transactionRow.click();

        const modal = page.getByTestId("transaction-details-modal");
        await expect(modal).toBeVisible();

        // Verify merchant name
        const modalMerchantName = modal.getByTestId("modal-merchant-name");
        await expect(modalMerchantName).toContainText("Coffee Shop");

        // Verify failed transaction amount is displayed
        const modalTransactionAmount = modal.getByTestId("modal-transaction-amount");
        await expect(modalTransactionAmount).toContainText("- €3.50");

        // Verify failed status (main focus of this test)
        const modalTransactionStatus = modal.getByTestId("modal-transaction-status");
        await expect(modalTransactionStatus).toContainText("Incorrect pin");

        // Verify date
        const modalTransactionDate = modal.getByTestId("modal-transaction-date");
        await expect(modalTransactionDate).toContainText("Jan 15, 2024 at 14:30");
      });
    });
  });
});
