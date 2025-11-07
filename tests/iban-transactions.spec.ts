import { test, expect, type Page } from "@playwright/test";
import { BASE_USER, createUserWithoutIban } from "./utils/testUsers";
import { setupAllMocks } from "./utils/setupMocks";
import { setupMockWallet } from "./utils/mockWallet";
import { IBAN_ORDER_SCENARIOS } from "./utils/mockIbanOrders";

test.describe("IBAN Transactions Component", () => {
  test.beforeEach(async ({ page }) => {
    await setupMockWallet(page);
  });

  // Helper function to setup test with configuration
  const setupTest = async (page: Page, scenario: keyof typeof IBAN_ORDER_SCENARIOS) => {
    await setupAllMocks(page, BASE_USER, {
      ibanOrders: IBAN_ORDER_SCENARIOS[scenario],
    });

    // Navigate to the home page and wait for the transactions section to load
    await page.goto("/");
    // Wait for the Transactions section to be visible
    await page.waitForSelector("text=Transactions", { timeout: 10000 });

    // Click on IBAN tab - use getByRole for better reliability
    await page.getByRole("button", { name: "IBAN" }).click();
  };

  // Helper function to get the IBAN transactions component
  const getIbanTransactionsComponent = (page: Page) => {
    return page.getByTestId("iban-transactions-component");
  };

  test.describe("Basic Transaction List Display", () => {
    test("displays empty transaction state", async ({ page }) => {
      await setupTest(page, "empty");

      const ibanTransactionsComponent = getIbanTransactionsComponent(page);

      await test.step("IBAN transactions component is visible", async () => {
        await expect(ibanTransactionsComponent).toBeVisible();
      });

      await test.step("empty state displays with inbox icon", async () => {
        await expect(ibanTransactionsComponent.getByTestId("empty-iban-transactions-icon")).toBeVisible();
      });

      await test.step("empty state message is displayed", async () => {
        await expect(ibanTransactionsComponent.getByTestId("empty-iban-transactions-message")).toBeVisible();
        await expect(ibanTransactionsComponent.getByTestId("empty-iban-transactions-message")).toContainText(
          "No IBAN transactions to display",
        );
      });

      await test.step("no transaction rows are visible", async () => {
        await expect(ibanTransactionsComponent.getByTestId("iban-transaction-row-0")).not.toBeVisible();
      });
    });

    test("displays mixed transaction types (incoming, outgoing, pending, rejected) with multiple dates", async ({
      page,
    }) => {
      await setupTest(page, "mixed");

      const ibanTransactionsComponent = getIbanTransactionsComponent(page);

      await test.step("multiple transaction rows are visible", async () => {
        const allTransactionRows = ibanTransactionsComponent.locator('[data-testid^="iban-transaction-row-"]');
        await expect(allTransactionRows).toHaveCount(8);
      });

      await test.step("verify specific date headers", async () => {
        const dateHeaders = ibanTransactionsComponent.getByTestId("iban-transaction-date-header");
        await expect(dateHeaders).toHaveCount(2);

        // First date header should show today's date (JAN 16, 2024)
        await expect(dateHeaders.first()).toContainText("JAN 16, 2024");

        // Second date header should show yesterday's date (JAN 15, 2024)
        await expect(dateHeaders.nth(1)).toContainText("JAN 15, 2024");
      });

      await test.step("today's transactions show correct details", async () => {
        // Get the first date group (today's transactions)
        const dateGroups = ibanTransactionsComponent
          .locator("> div")
          .filter({ has: page.getByTestId("iban-transaction-date-header") });
        const todayGroup = dateGroups.first();

        // Today's first transaction (Emma Davis incoming) - tests incoming transaction type
        const emmaRow = todayGroup.getByTestId("iban-transaction-row-0");
        await expect(emmaRow).toBeVisible();
        await expect(emmaRow).toHaveAttribute("type", "button");
        await expect(emmaRow.getByTestId("iban-transaction-title")).toContainText("From Emma Davis");
        await expect(emmaRow.getByTestId("iban-transaction-amount")).toContainText("+ €500.00");
        await expect(emmaRow.getByTestId("iban-transaction-memo")).toContainText("Invoice payment");

        // Today's second transaction (Frank Miller outgoing) - tests outgoing transaction type and no memo
        const frankRow = todayGroup.getByTestId("iban-transaction-row-1");
        await expect(frankRow).toBeVisible();
        await expect(frankRow.getByTestId("iban-transaction-title")).toContainText("To Frank Miller");
        await expect(frankRow.getByTestId("iban-transaction-amount")).toContainText("- €75.50");
        await expect(frankRow.getByTestId("iban-transaction-memo")).not.toBeVisible();

        // Today's third transaction (GBP Sender) - tests GBP currency
        const gbpRow = todayGroup.getByTestId("iban-transaction-row-2");
        await expect(gbpRow).toBeVisible();
        await expect(gbpRow.getByTestId("iban-transaction-title")).toContainText("From GBP Sender");
        await expect(gbpRow.getByTestId("iban-transaction-amount")).toContainText("+ £400.00");
        await expect(gbpRow.getByTestId("iban-transaction-memo")).toContainText("GBP payment");

        // Today's fourth transaction (USD Recipient) - tests USD currency and no memo
        const usdRow = todayGroup.getByTestId("iban-transaction-row-3");
        await expect(usdRow).toBeVisible();
        await expect(usdRow.getByTestId("iban-transaction-title")).toContainText("To USD Recipient");
        await expect(usdRow.getByTestId("iban-transaction-amount")).toContainText("- $600.00");
        await expect(usdRow.getByTestId("iban-transaction-memo")).not.toBeVisible();
      });

      await test.step("yesterday's transactions show correct details", async () => {
        // Get the second date group (yesterday's transactions)
        const dateGroups = ibanTransactionsComponent
          .locator("> div")
          .filter({ has: page.getByTestId("iban-transaction-date-header") });
        const yesterdayGroup = dateGroups.nth(1);

        // Yesterday's first transaction (Grace Lee incoming)
        const graceRow = yesterdayGroup.getByTestId("iban-transaction-row-0");
        await expect(graceRow).toBeVisible();
        await expect(graceRow.getByTestId("iban-transaction-title")).toContainText("From Grace Lee");
        await expect(graceRow.getByTestId("iban-transaction-amount")).toContainText("+ €1,200.00");
        await expect(graceRow.getByTestId("iban-transaction-memo")).toContainText("Contract payment");

        // Yesterday's second transaction (Henry Taylor outgoing)
        const henryRow = yesterdayGroup.getByTestId("iban-transaction-row-1");
        await expect(henryRow).toBeVisible();
        await expect(henryRow.getByTestId("iban-transaction-title")).toContainText("To Henry Taylor");
        await expect(henryRow.getByTestId("iban-transaction-amount")).toContainText("- €250.00");
        await expect(henryRow.getByTestId("iban-transaction-memo")).toContainText("Utility bill");

        // Yesterday's third transaction (Ivy Anderson pending) - tests pending transaction type and no memo
        const ivyRow = yesterdayGroup.getByTestId("iban-transaction-row-2");
        await expect(ivyRow).toBeVisible();
        await expect(ivyRow.getByTestId("iban-transaction-title")).toContainText("From Ivy Anderson");
        await expect(ivyRow.getByTestId("iban-transaction-amount")).toContainText("+ €300.00");
        await expect(ivyRow.getByTestId("iban-transaction-memo")).not.toBeVisible();

        // Yesterday's fourth transaction (David Wilson rejected) - tests rejected transaction type
        const davidRow = yesterdayGroup.getByTestId("iban-transaction-row-3");
        await expect(davidRow).toBeVisible();
        await expect(davidRow.getByTestId("iban-transaction-title")).toContainText("To David Wilson");
        await expect(davidRow.getByTestId("iban-transaction-amount")).toContainText("- €500.00");
        await expect(davidRow.getByTestId("iban-transaction-memo")).toContainText("Failed payment");
      });

      await test.step("modal displays correct data for incoming transaction (Emma)", async () => {
        const dateGroups = ibanTransactionsComponent
          .locator("> div")
          .filter({ has: page.getByTestId("iban-transaction-date-header") });
        const todayGroup = dateGroups.first();
        const emmaRow = todayGroup.getByTestId("iban-transaction-row-0");

        await emmaRow.click();

        const modal = page.getByTestId("bank-transfer-details-modal");
        await expect(modal).toBeVisible();
        await expect(modal.getByTestId("modal-transfer-title")).toContainText("Incoming Bank Transfer");
        await expect(modal.getByTestId("modal-transfer-amount")).toContainText("+ €500.00");
        await expect(modal.getByTestId("modal-transfer-status")).toContainText("Completed");
        await expect(modal.getByTestId("modal-counterpart-name")).toContainText("Emma Davis");
        await expect(modal.getByTestId("modal-iban")).toContainText("DE89370400440532013000");
        await expect(modal.getByTestId("modal-currency")).toContainText("EUR");
        await expect(modal.getByTestId("modal-memo")).toContainText("Invoice payment");
        await expect(modal.getByTestId("copy-iban-button")).toBeVisible();
        await expect(modal.getByTestId("copy-order-id-button")).toBeVisible();

        // Test copy IBAN button functionality
        await page.context().grantPermissions(["clipboard-read", "clipboard-write"]);
        await modal.getByTestId("copy-iban-button").click();
        const copiedIban = await page.evaluate(() => navigator.clipboard.readText());
        expect(copiedIban).toBe("DE89370400440532013000");

        // Test copy Order ID button functionality
        await modal.getByTestId("copy-order-id-button").click();
        const copiedOrderId = await page.evaluate(() => navigator.clipboard.readText());
        expect(copiedOrderId).toBe("incoming-today-1");

        await page.keyboard.press("Escape");
        await expect(modal).not.toBeVisible();
      });

      await test.step("modal displays correct data for outgoing transaction (Frank)", async () => {
        const dateGroups = ibanTransactionsComponent
          .locator("> div")
          .filter({ has: page.getByTestId("iban-transaction-date-header") });
        const todayGroup = dateGroups.first();
        const frankRow = todayGroup.getByTestId("iban-transaction-row-1");

        await frankRow.click();

        const modal = page.getByTestId("bank-transfer-details-modal");
        await expect(modal).toBeVisible();
        await expect(modal.getByTestId("modal-transfer-title")).toContainText("Outgoing Bank Transfer");
        await expect(modal.getByTestId("modal-transfer-amount")).toContainText("- €75.50");
        await expect(modal.getByTestId("modal-transfer-status")).toContainText("Completed");
        await expect(modal.getByTestId("modal-counterpart-name")).toContainText("Frank Miller");
        await expect(modal.getByTestId("modal-iban")).toContainText("GB33BUKB20201555555555");
        await expect(modal.getByTestId("modal-currency")).toContainText("EUR");
        // Verify memo is not visible for transactions without memo
        await expect(modal.getByTestId("modal-memo")).not.toBeVisible();

        await page.keyboard.press("Escape");
        await expect(modal).not.toBeVisible();
      });

      await test.step("modal displays correct data for GBP transaction", async () => {
        const dateGroups = ibanTransactionsComponent
          .locator("> div")
          .filter({ has: page.getByTestId("iban-transaction-date-header") });
        const todayGroup = dateGroups.first();
        const gbpRow = todayGroup.getByTestId("iban-transaction-row-2");

        await gbpRow.click();

        const modal = page.getByTestId("bank-transfer-details-modal");
        await expect(modal).toBeVisible();
        await expect(modal.getByTestId("modal-transfer-amount")).toContainText("+ £400.00");
        await expect(modal.getByTestId("modal-currency")).toContainText("GBP");
        await expect(modal.getByTestId("modal-memo")).toContainText("GBP payment");

        await page.keyboard.press("Escape");
        await expect(modal).not.toBeVisible();
      });

      await test.step("modal displays correct data for USD transaction without memo", async () => {
        const dateGroups = ibanTransactionsComponent
          .locator("> div")
          .filter({ has: page.getByTestId("iban-transaction-date-header") });
        const todayGroup = dateGroups.first();
        const usdRow = todayGroup.getByTestId("iban-transaction-row-3");

        await usdRow.click();

        const modal = page.getByTestId("bank-transfer-details-modal");
        await expect(modal).toBeVisible();
        await expect(modal.getByTestId("modal-transfer-title")).toContainText("Outgoing Bank Transfer");
        await expect(modal.getByTestId("modal-transfer-amount")).toContainText("- $600.00");
        await expect(modal.getByTestId("modal-currency")).toContainText("USD");
        await expect(modal.getByTestId("modal-memo")).not.toBeVisible();

        await page.keyboard.press("Escape");
        await expect(modal).not.toBeVisible();
      });

      await test.step("modal displays correct data for pending transaction (Ivy)", async () => {
        const dateGroups = ibanTransactionsComponent
          .locator("> div")
          .filter({ has: page.getByTestId("iban-transaction-date-header") });
        const yesterdayGroup = dateGroups.nth(1);
        const ivyRow = yesterdayGroup.getByTestId("iban-transaction-row-2");

        await ivyRow.click();

        const modal = page.getByTestId("bank-transfer-details-modal");
        await expect(modal).toBeVisible();
        await expect(modal.getByTestId("modal-transfer-status")).toContainText("Pending");
        await expect(modal.getByTestId("modal-counterpart-name")).toContainText("Ivy Anderson");
        await expect(modal.getByTestId("modal-memo")).not.toBeVisible();

        await page.keyboard.press("Escape");
        await expect(modal).not.toBeVisible();
      });

      await test.step("modal displays correct data for rejected transaction (David)", async () => {
        const dateGroups = ibanTransactionsComponent
          .locator("> div")
          .filter({ has: page.getByTestId("iban-transaction-date-header") });
        const yesterdayGroup = dateGroups.nth(1);
        const davidRow = yesterdayGroup.getByTestId("iban-transaction-row-3");

        await davidRow.click();

        const modal = page.getByTestId("bank-transfer-details-modal");
        await expect(modal).toBeVisible();
        await expect(modal.getByTestId("modal-transfer-status")).toContainText("Rejected");
        await expect(modal.getByTestId("modal-counterpart-name")).toContainText("David Wilson");
        await expect(modal.getByTestId("modal-memo")).toContainText("Failed payment");

        // Close modal by clicking outside
        const dialogOverlay = page.locator('[data-slot="dialog-overlay"]');
        await dialogOverlay.click({ position: { x: 10, y: 10 } });
        await expect(modal).not.toBeVisible();
      });
    });
  });

  test.describe("IBAN Tab Visibility", () => {
    test("IBAN tab is not visible when user is not eligible for IBAN", async ({ page }) => {
      // Create a user without IBAN and not eligible
      const userWithoutIban = createUserWithoutIban();

      // Setup mocks with user who is not eligible for IBAN
      await setupAllMocks(page, userWithoutIban, {
        ibansAvailable: {
          available: false,
        },
      });

      await page.goto("/");
      await page.waitForSelector("text=Transactions", { timeout: 10000 });

      await test.step("verify IBAN tab is not visible", async () => {
        const ibanTab = page.getByRole("button", { name: "IBAN", exact: true });
        await expect(ibanTab).not.toBeVisible();
      });

      await test.step("verify Card tab is still visible", async () => {
        const cardTab = page.getByRole("button", { name: "Card", exact: true });
        await expect(cardTab).toBeVisible();
      });
    });

    test("IBAN tab is not visible when user has no IBAN set", async ({ page }) => {
      // Create a user without moneriumIban in bankingDetails
      const userWithoutIban = createUserWithoutIban();

      // Setup mocks with user who doesn't have IBAN
      await setupAllMocks(page, userWithoutIban, {
        ibansAvailable: {
          available: true, // User is eligible but hasn't created IBAN yet
        },
      });

      await page.goto("/");
      await page.waitForSelector("text=Transactions", { timeout: 10000 });

      await test.step("verify IBAN tab is not visible", async () => {
        const ibanTab = page.getByRole("button", { name: "IBAN", exact: true });
        await expect(ibanTab).not.toBeVisible();
      });

      await test.step("verify Card tab is still visible", async () => {
        const cardTab = page.getByRole("button", { name: "Card", exact: true });
        await expect(cardTab).toBeVisible();
      });
    });
  });
});
