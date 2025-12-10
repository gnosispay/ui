import { test, expect } from "@playwright/test";
import { BASE_USER } from "./utils/testUsers";
import { setupAllMocks } from "./utils/setupMocks";
import { setupMockWallet } from "./utils/mockWallet";
import { CARD_SCENARIOS } from "./utils/mockCards";
import { createPayment } from "./utils/mockCardTransactions";
import { mockCurrencies } from "./utils/currencyUtils";

test.describe("Cards Page", () => {
  test.beforeEach(async ({ page }) => {
    await setupMockWallet(page);
  });

  // Helper to create transactions for cards using CARD_SCENARIOS tokens
  const createTransactionsForCards = () => {
    const today = new Date();
    return {
      count: 4,
      next: null,
      previous: null,
      results: [
        createPayment({
          threadId: "tx-virtual-1",
          cardToken: CARD_SCENARIOS.VIRTUAL.cardToken,
          createdAt: today.toISOString(),
          merchant: { name: "Virtual Card Merchant", city: "Berlin", country: { alpha2: "DE", name: "Germany" } },
          billingAmount: "10000000000000000000",
          billingCurrency: mockCurrencies.EUR,
        }),
        createPayment({
          threadId: "tx-physical-1",
          cardToken: CARD_SCENARIOS.PHYSICAL.cardToken,
          createdAt: today.toISOString(),
          merchant: { name: "Physical Card Merchant", city: "Paris", country: { alpha2: "FR", name: "France" } },
          billingAmount: "20000000000000000000",
          billingCurrency: mockCurrencies.EUR,
        }),
        createPayment({
          threadId: "tx-frozen-1",
          cardToken: CARD_SCENARIOS.FROZEN.cardToken,
          createdAt: today.toISOString(),
          merchant: { name: "Frozen Card Merchant", city: "London", country: { alpha2: "GB", name: "United Kingdom" } },
          billingAmount: "30000000000000000000",
          billingCurrency: mockCurrencies.EUR,
        }),
        createPayment({
          threadId: "tx-voided-1",
          cardToken: CARD_SCENARIOS.VOIDED.cardToken,
          createdAt: today.toISOString(),
          merchant: { name: "Voided Card Merchant", city: "Rome", country: { alpha2: "IT", name: "Italy" } },
          billingAmount: "40000000000000000000",
          billingCurrency: mockCurrencies.EUR,
        }),
      ],
    };
  };

  test.describe("Card Display and Status", () => {
    test("displays cards with correct statuses, hides voided cards by default, and toggles voided visibility", async ({
      page,
    }) => {
      const testCards = [
        CARD_SCENARIOS.VIRTUAL,
        CARD_SCENARIOS.DEACTIVATED_PHYSICAL_CARD,
        CARD_SCENARIOS.FROZEN,
        CARD_SCENARIOS.VOIDED,
      ];

      await setupAllMocks(page, BASE_USER, {
        cards: testCards,
        cardTransactions: createTransactionsForCards(),
      });

      await page.goto("/cards");
      await page.waitForLoadState("networkidle");

      await test.step("verify active virtual card is displayed", async () => {
        // The carousel should show the first card (active virtual) - using data-testid
        const cardPreview = page.getByTestId(`card-preview-${CARD_SCENARIOS.VIRTUAL.lastFourDigits}`);
        await expect(cardPreview).toBeVisible();
        await expect(cardPreview.getByTestId("card-last4")).toHaveText(CARD_SCENARIOS.VIRTUAL.lastFourDigits);
        await expect(cardPreview.getByTestId("card-type")).toHaveText("Virtual");

        // Should NOT have status overlay (frozen/void/etc)
        await expect(cardPreview.getByTestId("card-status-overlay-frozen")).not.toBeVisible();
        await expect(cardPreview.getByTestId("card-status-overlay-void")).not.toBeVisible();
      });

      await test.step("verify voided card is NOT displayed by default", async () => {
        // Count the dot indicators - should be 3 (not 4) since voided is hidden
        const dotsContainer = page.getByTestId("card-carousel-dots");
        await expect(dotsContainer.locator("button")).toHaveCount(3);

        // Voided card should not be in the DOM
        await expect(page.getByTestId(`card-preview-${CARD_SCENARIOS.VOIDED.lastFourDigits}`)).not.toBeVisible();
      });

      await test.step("navigate to frozen card and verify frozen overlay", async () => {
        // Click the dot for the frozen card
        const frozenDot = page.getByTestId(`card-carousel-dot-${CARD_SCENARIOS.FROZEN.lastFourDigits}`);
        await frozenDot.click();

        // Verify the frozen card is now selected using data-selected attribute
        const frozenCardItem = page.getByTestId(`card-carousel-item-${CARD_SCENARIOS.FROZEN.lastFourDigits}`);
        await expect(frozenCardItem).toHaveAttribute("data-selected", "true");

        // Verify frozen overlay is visible
        const frozenCardPreview = page.getByTestId(`card-preview-${CARD_SCENARIOS.FROZEN.lastFourDigits}`);
        await expect(frozenCardPreview.getByTestId("card-status-overlay-frozen")).toBeVisible();
        await expect(frozenCardPreview.getByTestId("card-last4")).toHaveText(CARD_SCENARIOS.FROZEN.lastFourDigits);
      });

      await test.step("navigate to deactivated physical card", async () => {
        // Click the dot for the deactivated physical card
        const deactivatedDot = page.getByTestId(
          `card-carousel-dot-${CARD_SCENARIOS.DEACTIVATED_PHYSICAL_CARD.lastFourDigits}`,
        );
        await deactivatedDot.click();

        // Verify the deactivated card is now selected
        const deactivatedCardItem = page.getByTestId(
          `card-carousel-item-${CARD_SCENARIOS.DEACTIVATED_PHYSICAL_CARD.lastFourDigits}`,
        );
        await expect(deactivatedCardItem).toHaveAttribute("data-selected", "true");

        // Verify card details
        const deactivatedCardPreview = page.getByTestId(
          `card-preview-${CARD_SCENARIOS.DEACTIVATED_PHYSICAL_CARD.lastFourDigits}`,
        );
        await expect(deactivatedCardPreview.getByTestId("card-last4")).toHaveText(
          CARD_SCENARIOS.DEACTIVATED_PHYSICAL_CARD.lastFourDigits,
        );
        await expect(deactivatedCardPreview.getByTestId("card-type")).toHaveText("Physical");

        // Should NOT have any status overlay (just not activated)
        await expect(deactivatedCardPreview.getByTestId("card-status-overlay-frozen")).not.toBeVisible();
        await expect(deactivatedCardPreview.getByTestId("card-status-overlay-void")).not.toBeVisible();
      });

      await test.step("toggle voided cards visibility via More menu", async () => {
        // Navigate back to first card to access More menu
        const virtualDot = page.getByTestId(`card-carousel-dot-${CARD_SCENARIOS.VIRTUAL.lastFourDigits}`);
        await virtualDot.click();

        // Click the "More" button to open dropdown
        const moreButton = page.getByTestId("card-action-more");
        await moreButton.click();

        // Find the "Hide voided cards" menu item
        const hideVoidedMenuItem = page.getByTestId("card-action-hide-voided-cards");
        await expect(hideVoidedMenuItem).toBeVisible();

        // Click the switch or the menu item to toggle
        const switchToggle = hideVoidedMenuItem.locator('button[role="switch"]');
        await switchToggle.click();

        // Close the dropdown menu by pressing Escape
        await page.keyboard.press("Escape");
      });

      await test.step("verify voided card is now visible", async () => {
        // Should now show 4 cards (wait for the voided dot to appear)
        const voidedDot = page.getByTestId(`card-carousel-dot-${CARD_SCENARIOS.VOIDED.lastFourDigits}`);
        await expect(voidedDot).toBeVisible();

        const dotsContainer = page.getByTestId("card-carousel-dots");
        await expect(dotsContainer.locator("button")).toHaveCount(4);

        // Navigate to voided card
        await voidedDot.click();

        // Verify the voided card is now selected
        const voidedCardItem = page.getByTestId(`card-carousel-item-${CARD_SCENARIOS.VOIDED.lastFourDigits}`);
        await expect(voidedCardItem).toHaveAttribute("data-selected", "true");

        // Verify voided overlay is visible
        const voidedCardPreview = page.getByTestId(`card-preview-${CARD_SCENARIOS.VOIDED.lastFourDigits}`);
        await expect(voidedCardPreview.getByTestId("card-status-overlay-void")).toBeVisible();
        await expect(voidedCardPreview.getByTestId("card-last4")).toHaveText(CARD_SCENARIOS.VOIDED.lastFourDigits);
      });

      await test.step("URL navigation: clicking card on home page navigates with cardIndex", async () => {
        // Visit home page
        await page.goto("/");
        await page.waitForLoadState("networkidle");

        // Click on the frozen card (ends in 9999)
        const frozenCard = page.getByRole("button", { name: /Go to card ending in 9999/ });
        await frozenCard.click();

        // Wait for navigation to cards page with correct cardIndex
        await page.waitForURL("**/cards?cardIndex=2");
        expect(page.url()).toContain("/cards?cardIndex=2");

        // Wait for page to load
        await page.waitForLoadState("networkidle");

        // The frozen card should be selected - verify the Unfreeze button is visible
        const unfreezeButton = page.getByTestId("card-action-unfreeze");
        await expect(unfreezeButton).toBeVisible();
      });

      await test.step("URL navigation: clicking another card on home page navigates correctly", async () => {
        // Navigate from home page by clicking the deactivated physical card (ends in 3333)
        await page.goto("/");
        await page.waitForLoadState("networkidle");

        const deactivatedCard = page.getByRole("button", { name: /Go to card ending in 3333/ });
        await deactivatedCard.click();

        // Wait for navigation to cards page with correct cardIndex
        await page.waitForURL("**/cards?cardIndex=1");
        expect(page.url()).toContain("/cards?cardIndex=1");

        // Wait for page to load
        await page.waitForLoadState("networkidle");

        // The deactivated physical card should be selected - verify the activate button is visible
        const activateButton = page.getByTestId("card-action-activate");
        await expect(activateButton).toBeVisible();
      });

      await test.step("URL navigation: dot click updates URL with cardIndex", async () => {
        await page.goto("/cards");
        await page.waitForLoadState("networkidle");

        // Navigate to frozen card using dot
        const frozenDot = page.getByTestId(`card-carousel-dot-${CARD_SCENARIOS.FROZEN.lastFourDigits}`);
        await frozenDot.click();

        // URL should update to include cardIndex=2
        await page.waitForURL("**/cards?cardIndex=2");
        expect(page.url()).toContain("cardIndex=2");
      });
    });
  });

  test.describe("Card Transactions, Actions, and Navigation", () => {
    test("transactions filter correctly, actions display correctly, and arrow navigation works", async ({ page }) => {
      const testCards = [
        CARD_SCENARIOS.VIRTUAL,
        CARD_SCENARIOS.FROZEN,
        CARD_SCENARIOS.DEACTIVATED_PHYSICAL_CARD,
        CARD_SCENARIOS.PHYSICAL,
      ];

      await setupAllMocks(page, BASE_USER, {
        cards: testCards,
        cardTransactions: createTransactionsForCards(),
      });

      // Set viewport to desktop size (lg breakpoint) so arrows are visible
      await page.setViewportSize({ width: 1280, height: 720 });

      await page.goto("/cards");
      await page.waitForLoadState("networkidle");

      await test.step("first card (virtual) shows correct transactions and actions", async () => {
        // First card (active virtual) should be selected by default
        // Verify transactions
        const transactionsComponent = page.getByTestId("card-transactions-component");
        await expect(transactionsComponent).toBeVisible();
        await expect(transactionsComponent.getByText("Virtual Card Merchant")).toBeVisible();
        await expect(transactionsComponent.getByText("Frozen Card Merchant")).not.toBeVisible();

        // Verify actions
        const freezeButton = page.getByTestId("card-action-freeze");
        await expect(freezeButton).toBeVisible();
        await expect(freezeButton).toBeEnabled();

        const unfreezeButton = page.getByTestId("card-action-unfreeze");
        await expect(unfreezeButton).not.toBeVisible();

        const activateButton = page.getByTestId("card-action-activate");
        await expect(activateButton).not.toBeVisible();

        const showDetailsButton = page.getByTestId("card-action-show-details");
        await expect(showDetailsButton).toBeVisible();
        await expect(showDetailsButton).toBeEnabled();

        const seePinButton = page.getByTestId("card-action-see-pin");
        await expect(seePinButton).toBeVisible();
        await expect(seePinButton).toBeDisabled();
      });

      await test.step("second card (frozen) shows correct transactions and actions", async () => {
        const frozenDot = page.getByTestId(`card-carousel-dot-${CARD_SCENARIOS.FROZEN.lastFourDigits}`);
        await frozenDot.click();

        // Verify transactions
        const transactionsComponent = page.getByTestId("card-transactions-component");
        await expect(transactionsComponent.getByText("Frozen Card Merchant")).toBeVisible();
        await expect(transactionsComponent.getByText("Virtual Card Merchant")).not.toBeVisible();

        // Verify actions
        const unfreezeButton = page.getByTestId("card-action-unfreeze");
        await expect(unfreezeButton).toBeVisible();
        await expect(unfreezeButton).toBeEnabled();

        const freezeButton = page.getByTestId("card-action-freeze");
        await expect(freezeButton).not.toBeVisible();
      });

      await test.step("deactivated physical card shows activate button", async () => {
        const deactivatedDot = page.getByTestId(
          `card-carousel-dot-${CARD_SCENARIOS.DEACTIVATED_PHYSICAL_CARD.lastFourDigits}`,
        );
        await deactivatedDot.click();

        const activateButton = page.getByTestId("card-action-activate");
        await expect(activateButton).toBeVisible();
        await expect(activateButton).toBeEnabled();
      });

      await test.step("clicking Activate opens confirmation dialog", async () => {
        const activateButton = page.getByTestId("card-action-activate");
        await activateButton.click();

        const dialog = page.locator('[role="dialog"]');
        await expect(dialog).toBeVisible();
        await expect(dialog.getByRole("heading", { name: "Activate Card" })).toBeVisible();
        await expect(dialog.getByText("Only activate your card if you have physically received it")).toBeVisible();

        const confirmButton = dialog.getByRole("button", { name: "Activate Card" });
        await expect(confirmButton).toBeVisible();

        // Close the dialog
        await page.keyboard.press("Escape");
      });

      await test.step("verify See PIN button is visible and enabled for physical cards", async () => {
        const seePinButton = page.getByTestId("card-action-see-pin");
        await expect(seePinButton).toBeVisible();
        await expect(seePinButton).toBeEnabled();
      });

      await test.step("virtual card shows void option in More menu", async () => {
        const virtualDot = page.getByTestId(`card-carousel-dot-${CARD_SCENARIOS.VIRTUAL.lastFourDigits}`);
        await virtualDot.click();

        const moreButton = page.getByTestId("card-action-more");
        await moreButton.click();

        const voidCardOption = page.getByTestId("card-action-void-card");
        await expect(voidCardOption).toBeVisible();
      });

      await test.step("clicking Void card opens confirmation dialog", async () => {
        const voidCardOption = page.getByTestId("card-action-void-card");
        await voidCardOption.click();

        const dialog = page.locator('[role="dialog"]');
        await expect(dialog).toBeVisible();
        await expect(dialog.getByRole("heading", { name: "Void Card" })).toBeVisible();
        await expect(dialog.getByText("Are you sure you want to void this card?")).toBeVisible();
        await expect(dialog.getByText("This action cannot be undone")).toBeVisible();

        // Close the dialog
        await page.keyboard.press("Escape");
      });

      await test.step("physical card More menu shows report option and hides void option", async () => {
        const physicalDot = page.getByTestId(`card-carousel-dot-${CARD_SCENARIOS.PHYSICAL.lastFourDigits}`);
        await physicalDot.click();

        const moreButton = page.getByTestId("card-action-more");
        await moreButton.click();

        // Check that void option is NOT visible for physical cards
        const voidCardOption = page.getByTestId("card-action-void-card");
        await expect(voidCardOption).not.toBeVisible();

        // Check that hide voided option is visible
        const hideVoidedOption = page.getByTestId("card-action-hide-voided-cards");
        await expect(hideVoidedOption).toBeVisible();

        // Check that report option is visible for activated physical cards
        const reportOption = page.getByTestId("card-action-report");
        await expect(reportOption).toBeVisible();
      });

      await test.step("clicking Report opens report modal", async () => {
        // Menu should still be open from previous step
        const reportOption = page.getByTestId("card-action-report");
        await expect(reportOption).toBeVisible();
        await reportOption.click();

        const reportAsLostButton = page.getByRole("button", { name: /lost/i });
        const reportAsStolenButton = page.getByRole("button", { name: /stolen/i });

        await expect(reportAsLostButton).toBeVisible();
        await expect(reportAsStolenButton).toBeVisible();

        // Close the report modal
        await page.keyboard.press("Escape");
        // Wait for modal and overlay to fully close
        await expect(reportAsLostButton).not.toBeVisible();
        const dialog = page.locator('[role="dialog"]');
        await expect(dialog).not.toBeVisible();
        // Wait for dialog overlay to disappear
        const overlay = page.locator('[data-slot="dialog-overlay"]');
        await expect(overlay).not.toBeVisible();
      });

      await test.step("arrow navigation works on desktop", async () => {
        // Ensure any modals/dialogs are closed
        const dialog = page.locator('[role="dialog"]');
        if (await dialog.isVisible().catch(() => false)) {
          await page.keyboard.press("Escape");
          await expect(dialog).not.toBeVisible();
        }

        // Wait for page to be ready
        await page.waitForLoadState("networkidle");

        // Navigate back to first card for arrow navigation test
        const virtualDot = page.getByTestId(`card-carousel-dot-${CARD_SCENARIOS.VIRTUAL.lastFourDigits}`);
        await expect(virtualDot).toBeVisible();
        await virtualDot.click({ force: true });

        // Find the carousel container (the group div that triggers hover)
        const carouselContainer = page.locator(".relative.group").first();

        // Hover over carousel to reveal arrows
        await carouselContainer.hover();
        const nextArrow = page.getByTestId("card-carousel-arrow-next");
        await expect(nextArrow).toBeVisible();

        // Click next arrow to navigate to second card
        await nextArrow.click();
        await page.waitForURL("**/cards?cardIndex=1");
        expect(page.url()).toContain("cardIndex=1");

        const frozenCardItem = page.getByTestId(`card-carousel-item-${CARD_SCENARIOS.FROZEN.lastFourDigits}`);
        await expect(frozenCardItem).toHaveAttribute("data-selected", "true");
        await expect(page.getByTestId("card-action-unfreeze")).toBeVisible();

        // Click next arrow again to navigate to third card
        await carouselContainer.hover();
        await nextArrow.click();
        await page.waitForURL("**/cards?cardIndex=2");
        expect(page.url()).toContain("cardIndex=2");

        const deactivatedCardItem = page.getByTestId(
          `card-carousel-item-${CARD_SCENARIOS.DEACTIVATED_PHYSICAL_CARD.lastFourDigits}`,
        );
        await expect(deactivatedCardItem).toHaveAttribute("data-selected", "true");
        await expect(page.getByTestId("card-action-activate")).toBeVisible();

        // Click previous arrow to go back
        await carouselContainer.hover();
        const prevArrow = page.getByTestId("card-carousel-arrow-prev");
        await prevArrow.click();
        await page.waitForURL("**/cards?cardIndex=1");
        expect(page.url()).toContain("cardIndex=1");

        const frozenCardItemAgain = page.getByTestId(`card-carousel-item-${CARD_SCENARIOS.FROZEN.lastFourDigits}`);
        await expect(frozenCardItemAgain).toHaveAttribute("data-selected", "true");
      });
    });
  });

  test.describe("Empty State", () => {
    test("displays empty state when no cards", async ({ page }) => {
      await setupAllMocks(page, BASE_USER, {
        cards: [],
      });

      await page.goto("/cards");
      await page.waitForLoadState("networkidle");

      await test.step("verify empty state message", async () => {
        await expect(page.getByText("No cards found")).toBeVisible();
      });

      await test.step("verify Add Card button is still visible", async () => {
        const addCardButton = page.getByRole("button", { name: /Add Card/i });
        await expect(addCardButton).toBeVisible();
      });
    });
  });
});
