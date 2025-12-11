import { test, expect } from "@playwright/test";
import { BASE_USER } from "./utils/testUsers";
import { setupAllMocks } from "./utils/setupMocks";
import { setupMockWallet } from "./utils/mockWallet";
import { CARD_SCENARIOS } from "./utils/mockCards";

test.describe("Home Page - Cards Component", () => {
  test.beforeEach(async ({ page }) => {
    await setupMockWallet(page);
  });

  test("displays virtual and physical cards with correct information and navigation", async ({ page }) => {
    // Compose a mix of cards with different statuses for comprehensive testing
    const testCards = [
      CARD_SCENARIOS.VIRTUAL,
      CARD_SCENARIOS.PHYSICAL,
      CARD_SCENARIOS.FROZEN,
      CARD_SCENARIOS.EXPIRED,
      CARD_SCENARIOS.PIN_BLOCKED,
      CARD_SCENARIOS.VOIDED,
    ];

    await setupAllMocks(page, BASE_USER, {
      cards: testCards,
    });

    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await test.step("verify virtual card displays correctly", async () => {
      const virtualCard = page.getByRole("button", { name: /Go to card ending in 1234/ });
      await expect(virtualCard).toBeVisible();
      await expect(virtualCard).toContainText("1234");
      await expect(virtualCard).toContainText("Virtual");
    });

    await test.step("verify physical card displays correctly", async () => {
      const physicalCard = page.getByRole("button", { name: /Go to card ending in 5678/ });
      await expect(physicalCard).toBeVisible();
      await expect(physicalCard).toContainText("5678");
      await expect(physicalCard).toContainText("Physical");
    });

    await test.step("verify frozen card displays status", async () => {
      const frozenCard = page.getByRole("button", { name: /Go to card ending in 9999/ });
      await expect(frozenCard).toBeVisible();
      await expect(frozenCard).toContainText("9999");
      await expect(frozenCard).toContainText("Physical");
      await expect(frozenCard).toContainText("Frozen");

      // Verify the Snowflake overlay icon is present
      const snowflakeIcon = frozenCard.locator("svg.lucide-snowflake");
      await expect(snowflakeIcon).toBeVisible();
    });

    await test.step("verify expired card displays status with alert triangle overlay", async () => {
      const expiredCard = page.getByRole("button", { name: /Go to card ending in 7777/ });
      await expect(expiredCard).toBeVisible();
      await expect(expiredCard).toContainText("7777");
      await expect(expiredCard).toContainText("Physical");
      await expect(expiredCard).toContainText("Expired");

      // Verify the TriangleAlert overlay icon is present
      const alertTriangleIcon = expiredCard.locator("svg.lucide-triangle-alert");
      await expect(alertTriangleIcon).toBeVisible();
    });

    await test.step("verify pin blocked card displays status with alert triangle overlay", async () => {
      const pinBlockedCard = page.getByRole("button", { name: /Go to card ending in 8888/ });
      await expect(pinBlockedCard).toBeVisible();
      await expect(pinBlockedCard).toContainText("8888");
      await expect(pinBlockedCard).toContainText("Physical");
      await expect(pinBlockedCard).toContainText("Pin Blocked");

      // Verify the TriangleAlert overlay icon is present
      const alertTriangleIcon = pinBlockedCard.locator("svg.lucide-triangle-alert");
      await expect(alertTriangleIcon).toBeVisible();
    });

    await test.step("verify voided card is not displayed", async () => {
      // Voided cards should be filtered out and not displayed
      const voidedCard = page.getByRole("button", { name: /Go to card ending in 0000/ });
      await expect(voidedCard).toHaveCount(0);

      // Verify only 5 cards are displayed (not 6, because voided is filtered out)
      const allCards = page.getByRole("button", { name: /Go to card ending in/ });
      await expect(allCards).toHaveCount(5);
    });

    await test.step("verify first card navigates to /cards", async () => {
      const firstCard = page.getByRole("button", { name: /Go to card ending in 1234/ });
      await firstCard.click();

      // Wait for navigation
      await page.waitForURL("**/cards");
      expect(page.url()).toContain("/cards");
      expect(page.url()).not.toContain("cardIndex");
    });

    await test.step("verify second card navigates to /cards?cardIndex=1", async () => {
      // Go back to home
      await page.goto("/");
      await page.waitForLoadState("networkidle");

      const secondCard = page.getByRole("button", { name: /Go to card ending in 5678/ });
      await secondCard.click();

      // Wait for navigation
      await page.waitForURL("**/cards?cardIndex=1");
      expect(page.url()).toContain("/cards?cardIndex=1");
    });

    await test.step("verify third card navigates to /cards?cardIndex=2", async () => {
      // Go back to home
      await page.goto("/");
      await page.waitForLoadState("networkidle");

      const thirdCard = page.getByRole("button", { name: /Go to card ending in 9999/ });
      await thirdCard.click();

      // Wait for navigation
      await page.waitForURL("**/cards?cardIndex=2");
      expect(page.url()).toContain("/cards?cardIndex=2");
    });
  });

  test("displays add card button and opens modal", async ({ page }) => {
    await setupAllMocks(page, BASE_USER, {
      cards: [CARD_SCENARIOS.VIRTUAL],
    });

    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await test.step("verify add card button is visible", async () => {
      const addCardButton = page.getByRole("button", { name: /Add card/i });
      await expect(addCardButton).toBeVisible();

      // The "Add card" text is in a sibling div, not inside the button
      const addCardText = page.locator("text=Add card").first();
      await expect(addCardText).toBeVisible();
    });

    await test.step("clicking add card button opens modal", async () => {
      const addCardButton = page.getByRole("button", { name: /Add card/i });
      await addCardButton.click();

      // Verify the cards order modal opens
      const modal = page.locator('[role="dialog"]');
      await expect(modal).toBeVisible();

      // Verify modal has card order content
      await expect(modal.getByRole("heading", { name: /Order a card/i })).toBeVisible();
    });
  });

  test("displays empty state when user has no cards", async ({ page }) => {
    await setupAllMocks(page, BASE_USER, {
      cards: CARD_SCENARIOS.EMPTY,
    });

    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await test.step("verify only add card button is visible", async () => {
      const addCardButton = page.getByRole("button", { name: /Add card/i });
      await expect(addCardButton).toBeVisible();

      // Verify no card items are displayed
      const cardButtons = page.getByRole("button", { name: /Go to card ending in/ });
      await expect(cardButtons).toHaveCount(0);
    });
  });

  test("displays View details link to cards page", async ({ page }) => {
    await setupAllMocks(page, BASE_USER, {
      cards: [CARD_SCENARIOS.VIRTUAL],
    });

    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await test.step("verify View details link is present", async () => {
      const viewDetailsLink = page.getByRole("link", { name: /View details/i });
      await expect(viewDetailsLink).toBeVisible();
    });

    await test.step("clicking View details navigates to /cards", async () => {
      const viewDetailsLink = page.getByRole("link", { name: /View details/i });
      await viewDetailsLink.click();

      await page.waitForURL("**/cards");
      expect(page.url()).toContain("/cards");
    });
  });
});
