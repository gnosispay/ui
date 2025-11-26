import { BASE_USER } from "./utils/testUsers";
import { setupAllMocks } from "./utils/setupMocks";
import { setupMockWallet } from "./utils/mockWallet";
import { mockPhysicalCardOrder } from "./utils/mockPhysicalCardOrder";
import { OrderStatus } from "./utils/mockOrder";
import { mockPseEphemeralToken } from "./utils/mockPseEphemeralToken";
import { mockPseIframe } from "./utils/mockPseIframe";
import { test, expect } from "@playwright/test";

test.describe("Physical Card Order", () => {
  test.beforeEach(async ({ page }) => {
    await setupMockWallet(page);
  });

  test("complete physical card order flow - happy path", async ({ page }) => {
    const orderId = "order-physical-happy-path";
    const cardToken = "card-token-physical-happy-path";

    await setupAllMocks(page, BASE_USER, {
      orders: [], // Start with no orders
    });

    // Set up mocks for physical card order endpoints
    await mockPhysicalCardOrder(page, {
      orderId,
      cardToken,
      initialStatus: OrderStatus.PENDING_TRANSACTION,
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

    await test.step("select physical card option", async () => {
      const physicalCardOption = page.getByTestId("card-option-physical-card");
      await expect(physicalCardOption).toBeVisible();
      await expect(physicalCardOption).toContainText("Physical Card");
      await physicalCardOption.click();

      // Verify navigation to card order form
      await expect(page).toHaveURL("/card-order/new");
      await page.waitForLoadState("networkidle");
    });

    await test.step("fill shipping address form", async () => {
      // Wait for form to be visible
      await expect(page.getByText("Order Physical Card")).toBeVisible();

      // Wait for form fields to be ready
      await expect(page.getByTestId("shipping-address-address1")).toBeVisible();

      // Get Continue button reference (form may be pre-populated from user data)
      const continueButton = page.getByRole("button", { name: "Continue" });

      // Fill address line 1
      const address1Input = page.getByTestId("shipping-address-address1");
      await expect(address1Input).toBeVisible();
      await address1Input.fill("123 Main Street");

      // Fill address line 2 (optional)
      const address2Input = page.getByTestId("shipping-address-address2");
      await expect(address2Input).toBeVisible();
      await address2Input.fill("Apt 4B");

      // Fill city
      const cityInput = page.getByTestId("shipping-address-city");
      await expect(cityInput).toBeVisible();
      await cityInput.fill("New York");

      // Fill postal code
      const postalCodeInput = page.getByTestId("shipping-address-postal-code");
      await expect(postalCodeInput).toBeVisible();
      await postalCodeInput.fill("10001");

      // Select country
      const countrySelect = page.getByTestId("shipping-address-country");
      await expect(countrySelect).toBeVisible();
      await countrySelect.click();

      // Wait for the dropdown to open and options to appear
      await expect(page.getByRole("listbox")).toBeVisible();
      await expect(page.getByRole("option", { name: "United States" })).toBeVisible();
      await page.getByRole("option", { name: "United States" }).click();

      // Verify the country was selected by checking the select contains the value
      await expect(countrySelect).toContainText("United States", { timeout: 5000 });

      await expect(continueButton).toBeEnabled();
    });

    await test.step("submit order and verify redirect", async () => {
      const continueButton = page.getByRole("button", { name: "Continue" });
      await expect(continueButton).toBeEnabled();
      await continueButton.click();

      // Wait for navigation to order confirmation page
      await expect(page).toHaveURL(`/card-order/${orderId}`, { timeout: 10000 });
      await page.waitForLoadState("networkidle");

      // Wait for the order to be fetched and displayed
      await expect(page.getByRole("heading", { name: "Confirm Order Details" })).toBeVisible({ timeout: 10000 });
    });

    await test.step("verify order details and price is 0", async () => {
      // Wait for order details to load
      await expect(page.getByRole("heading", { name: "Confirm Order Details" })).toBeVisible();

      // Wait for coupon to be applied (this happens automatically in AddressCheckStep)
      // The component shows a loading state while applying coupon
      // Wait for the "Create Card & Set PIN" button to be enabled, which indicates coupon is applied
      const createCardButton = page.getByRole("button", { name: "Create Card & Set PIN" });
      await expect(createCardButton).toBeEnabled({ timeout: 10000 });

      // Verify shipping address is displayed
      await expect(page.getByText("123 Main Street")).toBeVisible();
      await expect(page.getByText("Apt 4B")).toBeVisible();
      await expect(page.getByText("10001")).toBeVisible();
      await expect(page.getByText("New York")).toBeVisible();
      await expect(page.getByText("United States")).toBeVisible();

      // Verify price is 0 (after coupon is applied)
      // The coupon should be applied automatically, making totalAmount - discount = 0
      // Based on AddressCheckStep, it shows: "0.00 EURe" and "€ 0.00"
      await expect(page.getByText(/0\.00\s*EURe/i)).toBeVisible();
      await expect(page.getByText(/€\s*0\.00/i)).toBeVisible();
    });

    await test.step("complete order successfully", async () => {
      // Set up mocks for PSE endpoints before clicking the button
      await mockPseEphemeralToken(page, {
        ephemeralToken: "mocked-token",
      });

      const buttonText = "Complete PIN Setup";
      await mockPseIframe(page, {
        actionType: "DoneSettingPin",
        buttonText,
      });

      // Wait for the button to be ready (not loading)
      // The button might be disabled while coupon is being applied
      const createCardButton = page.getByRole("button", { name: "Create Card & Set PIN" });
      await expect(createCardButton).toBeVisible();

      // Wait for button to be enabled (coupon application complete)
      await expect(createCardButton).toBeEnabled({ timeout: 10000 });

      await createCardButton.click();

      // Wait for the order to complete and navigate to PIN setup
      // The order completion triggers navigation to SetPinStep
      // First, wait for network requests to complete
      await page.waitForLoadState("networkidle");

      // Verify we're on the PIN setup step (SetPinStep component)
      // The SetPinStep should show the heading
      await expect(page.getByRole("heading", { name: "Set Your Card PIN" })).toBeVisible({ timeout: 15000 });

      // Wait for the iframe container to be visible
      const iframeId = `pse-setpin-new-card-${cardToken}`;
      await expect(page.locator(`#${iframeId}`)).toBeVisible({ timeout: 10000 });

      // Wait for the iframe to load and verify its content
      // The PSE SDK creates an iframe inside the container div
      const iframe = page.frameLocator(`#${iframeId} iframe`);

      // Verify the mocked HTML content appears in the iframe
      await expect(iframe.getByText("PIN Setup Interface")).toBeVisible({ timeout: 10000 });
      await expect(iframe.getByText("Please enter your card PIN")).toBeVisible({ timeout: 10000 });

      // Click the button in the iframe to trigger DoneSettingPin action
      // This should send a postMessage to the parent, triggering onActionSuccess
      const completeButton = iframe.getByRole("button", { name: buttonText });
      await expect(completeButton).toBeVisible({ timeout: 10000 });
      await completeButton.click();

      // Verify that the action was triggered and navigation occurred
      // SetPinStep should navigate to /cards when DoneSettingPin action is received
      await expect(page).toHaveURL("/cards", { timeout: 10000 });
    });
  });
});
