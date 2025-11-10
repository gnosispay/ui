import { test, expect } from "@playwright/test";

test("No wallet connected", async ({ page }) => {
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
