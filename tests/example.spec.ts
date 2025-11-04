import { test, expect } from "@playwright/test";
import { installMockWallet } from "@johanneskares/wallet-mock";
import { privateKeyToAccount } from "viem/accounts";
import { http } from "viem";
import { gnosis } from "viem/chains";
import { mockAuthChallenge } from "./utils/mockAuthChallenge";
import { mockUser, TEST_USER_APPROVED } from "./utils/mockUser";
import { mockSafeConfig } from "./utils/mockSafeConfig";
import { mockRewards } from "./utils/mockRewards";
import { mockAccountBalances } from "./utils/mockAccountBalances";
import { mockCards } from "./utils/mockCards";
import { mockDelayRelay } from "./utils/mockDelayRelay";
import { mockOrder } from "./utils/mockOrder";
import { mockIbansAvailable } from "./utils/mockIbansAvailable";
import { mockCardTransactions } from "./utils/mockCardTransactions";

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
  // Set up all the API mocks
  await mockAuthChallenge(page);
  await mockUser(page, TEST_USER_APPROVED);
  await mockSafeConfig(page, TEST_USER_APPROVED, TEST_USER_APPROVED.safeConfig);
  await mockRewards(page, TEST_USER_APPROVED, TEST_USER_APPROVED.rewards);
  await mockAccountBalances(page, TEST_USER_APPROVED, TEST_USER_APPROVED.accountBalances);
  await mockCards(page, TEST_USER_APPROVED, TEST_USER_APPROVED.cards);
  await mockDelayRelay(page, TEST_USER_APPROVED, TEST_USER_APPROVED.delayRelay);
  await mockOrder(page, TEST_USER_APPROVED, TEST_USER_APPROVED.orders);
  await mockIbansAvailable(page, TEST_USER_APPROVED, TEST_USER_APPROVED.ibansAvailable);
  await mockCardTransactions(page, TEST_USER_APPROVED, TEST_USER_APPROVED.cardTransactions);

  await installMockWallet({
    page,
    account: privateKeyToAccount("0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"),
    defaultChain: gnosis,
    transports: { [gnosis.id]: http() },
  });

  // Navigate to the page
  await page.goto("/");

  // make sure the Zendesk widget is visible
  await expect(page.getByTitle("Button to launch messaging window")).toBeVisible();

  await expect(page.getByRole("button", { name: /0xf3\.\.\.b92266/ })).toBeVisible();

  await expect(page.getByRole("heading", { name: "Balance" })).toBeVisible();
});
