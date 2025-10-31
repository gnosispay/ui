import { test, expect } from "@playwright/test";

// test("has correct title and wallet connection heading", async ({ page }) => {
//   await page.goto(homePage);

//   // Expect a title "to contain" a substring.
//   await expect(page).toHaveTitle("My Gnosis Pay");
//   await expect(page.getByRole("heading", { name: "Connect your wallet" })).toBeVisible();
// });

import { installMockWallet } from "@johanneskares/wallet-mock";
import { privateKeyToAccount } from "viem/accounts";
import { http } from "viem";
import { gnosis } from "viem/chains";

test("wallet connection flow - no wallet initially", async ({ page }) => {
  // First, test that without any wallet, we see the connect button
  await page.goto("/");

  // Should show connect wallet button when no wallet is available
  await expect(page.getByRole("button", { name: "Connect wallet" })).toBeVisible();
});

test("wallet connection flow - with mock wallet", async ({ page }) => {
  await installMockWallet({
    page,
    account: privateKeyToAccount("0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"),
    defaultChain: gnosis,
    transports: { [gnosis.id]: http() },
  });

  // Navigate to the page
  await page.goto("/");

  // Verify the button shows "Signing message..." text, is disabled, and shows loader
  const signingButton = page.getByRole("button", { name: "Signing message..." });
  await expect(signingButton).toBeVisible({ timeout: 5000 });
  await expect(signingButton).toBeDisabled();
});
