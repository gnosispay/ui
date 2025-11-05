import { test, expect } from "@playwright/test";
import { setupAllMocks } from "./utils/setupMocks";
import { setupMockWallet } from "./utils/mockWallet";
import { BASE_USER } from "./utils/testUsers";
import { createAddressDisplayRegex } from "./utils/addressUtils";

test("No wallet initially", async ({ page }) => {
  // First, test that without any wallet, we see the connect button
  await page.goto("/");

  // Should show connect wallet button when no wallet is available
  await expect(page.getByRole("button", { name: "Connect wallet" })).toBeVisible();
  await page.getByRole("button", { name: "Connect wallet" }).click();

  // expect to see the AppKit modal
  await expect(page.getByTestId("w3m-modal-card")).toBeVisible();

  // make sure the Zendesk widget is visible with title title="Button to launch messaging window"
  await expect(page.getByTitle("Button to launch messaging window")).toBeVisible();
  //
});

test("Mock wallet", async ({ page }) => {
  const testUser = BASE_USER;
  // Set up all API mocks for the test user
  await setupAllMocks(page, testUser);

  await setupMockWallet(page);

  // Navigate to the page
  await page.goto("/");

  // make sure the Zendesk widget is visible
  await expect(page.getByTitle("Button to launch messaging window")).toBeVisible();

  await expect(page.getByRole("button", { name: createAddressDisplayRegex(testUser.signerAddress) })).toBeVisible();

  await expect(page.getByRole("heading", { name: "Balance" })).toBeVisible();
});
