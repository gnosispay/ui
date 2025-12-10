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
    });
  });

  test.describe("Card Transactions Filtering", () => {
    test("displays only transactions for the currently selected card", async ({ page }) => {
      const testCards = [CARD_SCENARIOS.VIRTUAL, CARD_SCENARIOS.FROZEN];

      await setupAllMocks(page, BASE_USER, {
        cards: testCards,
        cardTransactions: createTransactionsForCards(),
      });

      await page.goto("/cards");
      await page.waitForLoadState("networkidle");

      await test.step("verify first card shows its transactions", async () => {
        // First card (active virtual) should be selected by default
        const transactionsComponent = page.getByTestId("card-transactions-component");
        await expect(transactionsComponent).toBeVisible();

        // Should show Virtual Card Merchant transaction
        await expect(transactionsComponent.getByText("Virtual Card Merchant")).toBeVisible();

        // Should NOT show other card transactions
        await expect(transactionsComponent.getByText("Frozen Card Merchant")).not.toBeVisible();
      });

      await test.step("navigate to second card and verify its transactions", async () => {
        // Click the dot for the frozen card
        const frozenDot = page.getByTestId(`card-carousel-dot-${CARD_SCENARIOS.FROZEN.lastFourDigits}`);
        await frozenDot.click();

        // Wait for transactions to update
        const transactionsComponent = page.getByTestId("card-transactions-component");

        // Should show Frozen Card Merchant transaction
        await expect(transactionsComponent.getByText("Frozen Card Merchant")).toBeVisible();

        // Should NOT show first card transactions
        await expect(transactionsComponent.getByText("Virtual Card Merchant")).not.toBeVisible();
      });
    });
  });

  test.describe("Card Actions Functionality", () => {
    test("card actions display correctly for different card states and types", async ({ page }) => {
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

      await page.goto("/cards");
      await page.waitForLoadState("networkidle");

      await test.step("active virtual card shows freeze button and hides activate button", async () => {
        // First card (active virtual) should be selected by default
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

      await test.step("frozen card shows unfreeze button", async () => {
        const frozenDot = page.getByTestId(`card-carousel-dot-${CARD_SCENARIOS.FROZEN.lastFourDigits}`);
        await frozenDot.click();

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
      });
    });
  });

  test.describe("URL Navigation and Card Selection", () => {
    test("cardIndex URL parameter selects correct card", async ({ page }) => {
      const testCards = [CARD_SCENARIOS.VIRTUAL, CARD_SCENARIOS.FROZEN, CARD_SCENARIOS.DEACTIVATED_PHYSICAL_CARD];

      await setupAllMocks(page, BASE_USER, {
        cards: testCards,
        cardTransactions: createTransactionsForCards(),
      });

      await test.step("navigate to cards with cardIndex=1", async () => {
        // Visit home page first
        await page.goto("/");
        await page.waitForLoadState("networkidle");

        // Click on the frozen card (second card, ends in 9999)
        const frozenCard = page.getByRole("button", { name: /Go to card ending in 9999/ });
        await frozenCard.click();

        // Wait for navigation to cards page with correct cardIndex
        await page.waitForURL("**/cards?cardIndex=1");
        expect(page.url()).toContain("/cards?cardIndex=1");

        // Wait for page to load
        await page.waitForLoadState("networkidle");

        // The second card (frozen) should be selected
        // Verify the Unfreeze button is visible (frozen card shows Unfreeze, not Freeze)
        const unfreezeButton = page.getByTestId("card-action-unfreeze");
        await expect(unfreezeButton).toBeVisible();
      });

      await test.step("navigate to cards with cardIndex=2", async () => {
        // Navigate from home page by clicking the deactivated physical card (third card, ends in 3333)
        await page.goto("/");
        await page.waitForLoadState("networkidle");

        const deactivatedCard = page.getByRole("button", { name: /Go to card ending in 3333/ });
        await deactivatedCard.click();

        // Wait for navigation to cards page with correct cardIndex
        await page.waitForURL("**/cards?cardIndex=2");
        expect(page.url()).toContain("/cards?cardIndex=2");

        // Wait for page to load
        await page.waitForLoadState("networkidle");

        // The third card (deactivated physical) should be selected
        // Verify the activate button is visible
        const activateButton = page.getByTestId("card-action-activate");
        await expect(activateButton).toBeVisible();
      });

      await test.step("navigate to first card has no cardIndex param", async () => {
        await page.goto("/cards");
        await page.waitForLoadState("networkidle");

        // Navigate to frozen card (second card)
        const frozenDot = page.getByTestId(`card-carousel-dot-${CARD_SCENARIOS.FROZEN.lastFourDigits}`);
        await frozenDot.click();

        // URL should update to include cardIndex=1
        await page.waitForURL("**/cards?cardIndex=1");
        expect(page.url()).toContain("cardIndex=1");
      });
    });

    test("arrow navigation works on desktop", async ({ page }) => {
      const testCards = [CARD_SCENARIOS.VIRTUAL, CARD_SCENARIOS.FROZEN, CARD_SCENARIOS.DEACTIVATED_PHYSICAL_CARD];

      await setupAllMocks(page, BASE_USER, {
        cards: testCards,
        cardTransactions: createTransactionsForCards(),
      });

      // Set viewport to desktop size (lg breakpoint) so arrows are visible
      await page.setViewportSize({ width: 1280, height: 720 });

      await page.goto("/cards");
      await page.waitForLoadState("networkidle");

      // Find the carousel container (the group div that triggers hover)
      const carouselContainer = page.locator(".relative.group").first();

      await test.step("hover over carousel to reveal arrows", async () => {
        await carouselContainer.hover();

        // Wait for arrows to become visible (they have opacity transition)
        const nextArrow = page.getByTestId("card-carousel-arrow-next");
        await expect(nextArrow).toBeVisible();
      });

      await test.step("click next arrow to navigate to second card", async () => {
        const nextArrow = page.getByTestId("card-carousel-arrow-next");
        await nextArrow.click();

        // Verify URL updates to cardIndex=1
        await page.waitForURL("**/cards?cardIndex=1");
        expect(page.url()).toContain("cardIndex=1");

        // Verify second card (frozen) is now selected
        const frozenCardItem = page.getByTestId(`card-carousel-item-${CARD_SCENARIOS.FROZEN.lastFourDigits}`);
        await expect(frozenCardItem).toHaveAttribute("data-selected", "true");

        // Verify Unfreeze button is visible
        await expect(page.getByTestId("card-action-unfreeze")).toBeVisible();
      });

      await test.step("click next arrow again to navigate to third card", async () => {
        // Hover again to keep arrows visible
        await carouselContainer.hover();

        const nextArrow = page.getByTestId("card-carousel-arrow-next");
        await nextArrow.click();

        // Verify URL updates to cardIndex=2
        await page.waitForURL("**/cards?cardIndex=2");
        expect(page.url()).toContain("cardIndex=2");

        // Verify third card (deactivated physical) is now selected
        const deactivatedCardItem = page.getByTestId(
          `card-carousel-item-${CARD_SCENARIOS.DEACTIVATED_PHYSICAL_CARD.lastFourDigits}`,
        );
        await expect(deactivatedCardItem).toHaveAttribute("data-selected", "true");

        // Verify Activate button is visible
        await expect(page.getByTestId("card-action-activate")).toBeVisible();
      });

      await test.step("click previous arrow to go back", async () => {
        // Hover again to keep arrows visible
        await carouselContainer.hover();

        const prevArrow = page.getByTestId("card-carousel-arrow-prev");
        await prevArrow.click();

        // Verify URL updates back to cardIndex=1
        await page.waitForURL("**/cards?cardIndex=1");
        expect(page.url()).toContain("cardIndex=1");

        // Verify second card (frozen) is selected again
        const frozenCardItem = page.getByTestId(`card-carousel-item-${CARD_SCENARIOS.FROZEN.lastFourDigits}`);
        await expect(frozenCardItem).toHaveAttribute("data-selected", "true");
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
