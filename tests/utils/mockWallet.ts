import { installMockWallet } from "@johanneskares/wallet-mock";
import { privateKeyToAccount } from "viem/accounts";
import { type Address, http } from "viem";
import { gnosis } from "viem/chains";
import type { Page } from "@playwright/test";
import { USER_TEST_PRIVATE_KEY } from "./testUsers";

/**
 * Configuration options for mock wallet setup
 */
export interface MockWalletOptions {
  /** Custom chain to use instead of Gnosis chain */
  chain?: typeof gnosis;
  /** Custom private key to use instead of the test user's key */
  privateKey?: string;
}

/**
 * Sets up a mock wallet for testing with standard Gnosis Pay configuration.
 *
 * This utility function configures the mock wallet with:
 * - Gnosis chain as the default chain
 * - HTTP transport for the chain
 * - The default test private key (USER_TEST_PRIVATE_KEY)
 *
 * @param page - The Playwright page instance
 * @param testUser - Optional test user (for context only, private key comes from default)
 * @param options - Optional configuration overrides
 *
 * @example
 * ```typescript
 * import { setupMockWallet } from "./utils/mockWallet";
 * import { TEST_USER_APPROVED } from "./utils/testUsers";
 *
 * test("wallet functionality", async ({ page }) => {
 *   // Set up mock wallet with default private key
 *   await setupMockWallet(page, TEST_USER_APPROVED);
 *
 *   // Your test code here...
 * });
 *
 * // With custom private key
 * test("custom wallet", async ({ page }) => {
 *   await setupMockWallet(page, TEST_USER_APPROVED, {
 *     privateKey: "0x123..."
 *   });
 * });
 * ```
 */
export async function setupMockWallet(page: Page, options: MockWalletOptions = {}): Promise<void> {
  const chain = options.chain || gnosis;
  const privateKey = options.privateKey || USER_TEST_PRIVATE_KEY;

  await installMockWallet({
    page,
    account: privateKeyToAccount(privateKey as Address),
    defaultChain: chain,
    transports: { [chain.id]: http() },
  });
}

/**
 * Sets up a mock wallet using a specific private key.
 * Useful when you need to use a hardcoded private key for testing.
 *
 * @param page - The Playwright page instance
 * @param privateKey - The private key to use for the wallet (defaults to USER_TEST_PRIVATE_KEY)
 * @param options - Optional configuration overrides
 */
export async function setupMockWalletWithPrivateKey(
  page: Page,
  privateKey: string = USER_TEST_PRIVATE_KEY,
  options: Pick<MockWalletOptions, "chain"> = {},
): Promise<void> {
  const chain = options.chain || gnosis;

  await installMockWallet({
    page,
    account: privateKeyToAccount(privateKey as Address),
    defaultChain: chain,
    transports: { [chain.id]: http() },
  });
}
