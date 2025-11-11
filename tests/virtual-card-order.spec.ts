import { test, expect } from "@playwright/test";
import { BASE_USER } from "./utils/testUsers";
import { setupAllMocks } from "./utils/setupMocks";
import { setupMockWallet } from "./utils/mockWallet";
import { CARD_SCENARIOS } from "./utils/mockCards";
import { mockVirtualCardCreation } from "./utils/mockVirtualCardCreation";

test.describe("Virtual Card Order", () => {
  test.beforeEach(async ({ page }) => {
    await setupMockWallet(page);
  });

  test("complete virtual card order flow from home page", async ({ page }) => {
    await setupAllMocks(page, BASE_USER, {
      cards: [CARD_SCENARIOS.SINGLE_VIRTUAL],
    });

    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await test.step("open card order modal from home page", async () => {
      const addCardButton = page.getByTestId("add-card-button");
      await expect(addCardButton).toBeVisible();
      await addCardButton.click();

      // Verify modal opens
      const modal = page.getByTestId("card-order-modal");
      await expect(modal).toBeVisible();
      await expect(modal.getByRole("heading", { name: "Order a card" })).toBeVisible();
    });

    await test.step("select virtual card option", async () => {
      const virtualCardOption = page.getByTestId("card-option-virtual-card");
      await expect(virtualCardOption).toBeVisible();
      await expect(virtualCardOption).toContainText("Virtual Card");
      await virtualCardOption.click();

      // Verify navigation to virtual card confirmation step
      const virtualCardStep = page.getByTestId("virtual-card-order-step");
      await expect(virtualCardStep).toBeVisible();
      await expect(page.getByRole("heading", { name: "Virtual card order" })).toBeVisible();
    });

    await test.step("verify virtual card confirmation content", async () => {
      const virtualCardStep = page.getByTestId("virtual-card-order-step");
      await expect(virtualCardStep).toBeVisible();

      // Verify buttons are present
      const backButton = page.getByTestId("back-button");
      const orderButton = page.getByTestId("order-virtual-card-button");
      await expect(backButton).toBeVisible();
      await expect(orderButton).toBeVisible();
      await expect(orderButton).toContainText("Order Virtual Card");
    });

    await test.step("navigate back to selection and forward again", async () => {
      const backButton = page.getByTestId("back-button");
      await backButton.click();

      // Verify we're back on the selection step
      await expect(page.getByRole("heading", { name: "Order a card" })).toBeVisible();
      await expect(page.getByTestId("card-option-virtual-card")).toBeVisible();
      await expect(page.getByTestId("card-option-physical-card")).toBeVisible();

      // Navigate to virtual card confirmation again
      await page.getByTestId("card-option-virtual-card").click();

      // Verify we're back on the confirmation step
      await expect(page.getByTestId("virtual-card-order-step")).toBeVisible();
      await expect(page.getByRole("heading", { name: "Virtual card order" })).toBeVisible();
    });

    await test.step("close modal and verify state resets", async () => {
      await page.keyboard.press("Escape");

      // Verify modal is closed
      const modal = page.getByTestId("card-order-modal");
      await expect(modal).not.toBeVisible();

      // Reopen modal and verify it starts at selection step
      await page.getByTestId("add-card-button").click();

      // Verify modal opens at selection step (not confirmation)
      await expect(page.getByRole("heading", { name: "Order a card" })).toBeVisible();
      await expect(page.getByTestId("card-option-virtual-card")).toBeVisible();
      await expect(page.getByTestId("card-option-physical-card")).toBeVisible();

      // Navigate to confirmation step for the order
      await page.getByTestId("card-option-virtual-card").click();
      await expect(page.getByTestId("virtual-card-order-step")).toBeVisible();
    });

    await test.step("order virtual card successfully", async () => {
      let cardsGetCallCount = 0;

      // Mock successful virtual card creation
      await mockVirtualCardCreation(page, { isError: false });

      // Track GET calls to /api/v1/cards to verify refresh is called
      await page.route("**/api/v1/cards", async (route) => {
        if (route.request().method() === "GET") {
          cardsGetCallCount++;
        }
        await route.continue();
      });

      const orderButton = page.getByTestId("order-virtual-card-button");
      await orderButton.click();

      // Verify success toast appears
      await expect(page.getByText("Virtual card ordered successfully")).toBeVisible();

      // Verify modal closes
      const modal = page.getByTestId("card-order-modal");
      await expect(modal).not.toBeVisible();

      // Wait for network to settle
      await page.waitForLoadState("networkidle");

      // Verify that the cards refresh API was called exactly once
      expect(cardsGetCallCount).toBe(1);
    });
  });

  test("display error when virtual card creation fails", async ({ page }) => {
    await setupAllMocks(page, BASE_USER, {
      cards: [CARD_SCENARIOS.SINGLE_VIRTUAL],
    });

    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await test.step("navigate to virtual card confirmation", async () => {
      await page.getByTestId("add-card-button").click();
      await page.getByTestId("card-option-virtual-card").click();
      await expect(page.getByTestId("virtual-card-order-step")).toBeVisible();
    });

    await test.step("mock API error and attempt to order card", async () => {
      // Mock the virtual card creation API to return an error (422 - Unprocessable Entity)
      await mockVirtualCardCreation(page, {
        isError: true,
        errorStatus: 422,
      });

      const orderButton = page.getByTestId("order-virtual-card-button");
      await orderButton.click();

      // Verify error toast appears with collapsed error
      await expect(page.getByText("Error ordering card")).toBeVisible();
      await expect(page.getByTestId("collapsed-error")).toBeVisible();
    });

    await test.step("verify modal remains open after error", async () => {
      // Modal should still be visible
      const modal = page.getByTestId("card-order-modal");
      await expect(modal).toBeVisible();
      await expect(page.getByTestId("virtual-card-order-step")).toBeVisible();

      // Button should be enabled again
      const orderButton = page.getByTestId("order-virtual-card-button");
      await expect(orderButton).toBeEnabled();
    });

    await test.step("close modal after error", async () => {
      await page.keyboard.press("Escape");

      // Verify modal closes
      const modal = page.getByTestId("card-order-modal");
      await expect(modal).not.toBeVisible();
    });
  });
});
