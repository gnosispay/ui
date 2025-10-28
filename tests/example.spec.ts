import { test, expect } from "@playwright/test";

const homePage = "http://localhost:5173";

test("has correct title and wallet connection heading", async ({ page }) => {
  await page.goto(homePage);

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle("My Gnosis Pay");
  await expect(page.getByRole("heading", { name: "Connect your wallet" })).toBeVisible();
});
