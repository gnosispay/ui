import { createAnvil, type Anvil } from "@viem/anvil";
import { execSync } from "node:child_process";
import { existsSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import {
  createPublicClient,
  createTestClient,
  createWalletClient,
  http,
  parseEther,
  type Address,
  type Hex,
  pad,
} from "viem";
import { gnosis } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";

/**
 * Default Foundry installation path for anvil binary
 */
const FOUNDRY_BIN_PATH = join(homedir(), ".foundry", "bin", "anvil");

/**
 * Gets the path to the anvil binary
 * Checks PATH first, then falls back to default Foundry installation location
 *
 * @returns The path to anvil binary, or null if not found
 */
export function getAnvilPath(): string | null {
  // First, check if anvil is in PATH
  try {
    execSync("anvil --version", { stdio: "pipe" });
    return "anvil";
  } catch {
    // Not in PATH, check default Foundry location
  }

  // Check default Foundry installation path
  if (existsSync(FOUNDRY_BIN_PATH)) {
    return FOUNDRY_BIN_PATH;
  }

  return null;
}

/**
 * Checks if Anvil (from Foundry) is installed and available
 *
 * @returns true if anvil is available, false otherwise
 */
export function isAnvilAvailable(): boolean {
  return getAnvilPath() !== null;
}

/**
 * Anvil RPC URL - default port
 */
export const ANVIL_RPC_URL = "http://127.0.0.1:8545";

/**
 * Gnosis Chain RPC URL for forking
 */
const GNOSIS_RPC_URL = "https://rpc.gnosischain.com";

/**
 * Creates a custom Gnosis chain config that points to Anvil
 */
export const anvilGnosisChain = {
  ...gnosis,
  rpcUrls: {
    default: { http: [ANVIL_RPC_URL] },
    public: { http: [ANVIL_RPC_URL] },
  },
} as const;

let anvilInstance: Anvil | null = null;

/**
 * Starts an Anvil instance forked from Gnosis chain
 *
 * Uses @viem/anvil which automatically downloads and manages the Anvil binary.
 *
 * @param options - Configuration options
 * @returns Promise that resolves when Anvil is ready
 *
 * @example
 * ```typescript
 * // In test.beforeAll
 * await startAnvil();
 *
 * // In test.afterAll
 * await stopAnvil();
 * ```
 */
/**
 * Checks if Anvil is already running on a given port
 */
async function isAnvilRunning(port: number): Promise<boolean> {
  try {
    const response = await fetch(`http://127.0.0.1:${port}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "eth_blockNumber", params: [] }),
    });
    return response.ok;
  } catch {
    return false;
  }
}

export async function startAnvil(
  options: {
    /** Port to run Anvil on (default: 8545) */
    port?: number;
    /** Block number to fork from (default: latest) */
    forkBlockNumber?: bigint;
    /** Chain ID to use (default: Gnosis = 100) */
    chainId?: number;
  } = {},
): Promise<void> {
  const { port = 8545, forkBlockNumber, chainId = 100 } = options;

  const anvilPath = getAnvilPath();
  if (!anvilPath) {
    throw new Error("Anvil not found. Install Foundry: https://getfoundry.sh");
  }

  // Check if Anvil is already running on this port
  if (await isAnvilRunning(port)) {
    console.log(`✅ Anvil already running on port ${port}, reusing existing instance`);
    // Create a "dummy" instance that won't try to start/stop
    // We'll just use the existing Anvil
    return;
  }

  console.log(`🔨 Starting Anvil fork of Gnosis chain on port ${port}...`);
  console.log(`   Using anvil binary: ${anvilPath}`);

  anvilInstance = createAnvil({
    anvilBinary: anvilPath,
    forkUrl: GNOSIS_RPC_URL,
    forkBlockNumber,
    port,
    chainId,
    // Auto-impersonate allows sending transactions from any address
    autoImpersonate: true,
  });

  await anvilInstance.start();
  console.log(`✅ Anvil started successfully on port ${port}`);
}

/**
 * Stops the running Anvil instance
 * Only stops if we started it (not if it was already running)
 */
export async function stopAnvil(): Promise<void> {
  if (anvilInstance) {
    console.log("🛑 Stopping Anvil...");
    await anvilInstance.stop();
    anvilInstance = null;
  } else {
    console.log("no instance to stop");
    return;
  }
}

/**
 * Creates a test client connected to Anvil with typed Anvil RPC methods
 */
export function createAnvilClient() {
  return createTestClient({
    chain: anvilGnosisChain,
    mode: "anvil",
    transport: http(ANVIL_RPC_URL),
  });
}

/**
 * Creates a public client connected to Anvil for read operations (eth_call, etc.)
 */
function createAnvilPublicClient() {
  return createPublicClient({
    chain: anvilGnosisChain,
    transport: http(ANVIL_RPC_URL),
  });
}

/**
 * Creates a wallet client connected to Anvil
 */
export function createAnvilWalletClient(privateKey: Hex) {
  return createWalletClient({
    chain: anvilGnosisChain,
    transport: http(ANVIL_RPC_URL),
    account: privateKeyToAccount(privateKey),
  });
}

/**
 * Sets the native token (xDAI) balance for an address
 *
 * @param address - The address to set balance for
 * @param balance - The balance in ether (e.g., "100" for 100 xDAI)
 */
export async function setNativeBalance(address: Address, balance: string): Promise<void> {
  const client = createAnvilClient();

  await client.setBalance({
    address,
    value: parseEther(balance),
  });
}

/**
 * Sets ERC20 balance by impersonating a whale address and transferring tokens
 * This is more reliable than storage manipulation for complex token contracts
 *
 * @param tokenAddress - The ERC20 token contract address
 * @param holderAddress - The address to set balance for
 * @param balance - The balance in wei (as bigint)
 */
async function setErc20BalanceViaTransfer(
  tokenAddress: Address,
  holderAddress: Address,
  balance: bigint,
): Promise<void> {
  const client = createAnvilClient();
  const publicClient = createAnvilPublicClient();

  // Check if token address is zero address (native token)
  const isNativeToken = tokenAddress.toLowerCase() === "0x0000000000000000000000000000000000000000";

  // Try to find a whale address on the fork that has tokens
  // Common addresses that might have tokens on Gnosis chain

  const [symbol, token] = Object.entries(GNOSIS_TOKENS).find(([_, token]) => token.address === tokenAddress) ?? [];

  const whale = token?.whale;
  if (!whale) {
    throw new Error(`No whale found for token ${symbol}`);
  }

  try {
    let whaleBalanceBigInt: bigint;

    if (isNativeToken) {
      // For native token, check native balance
      const whaleBalance = (await publicClient.request({
        method: "eth_getBalance",
        params: [whale, "latest"],
      })) as Hex;
      whaleBalanceBigInt = BigInt(whaleBalance || "0x0");
    } else {
      // For ERC20 token, check token balance
      const whaleBalance = (await publicClient.request({
        method: "eth_call",
        params: [
          {
            to: tokenAddress,
            data: `0x70a08231${pad(whale, { size: 32 }).slice(2)}`,
          },
          "latest",
        ],
      })) as Hex;
      whaleBalanceBigInt = BigInt(whaleBalance || "0x0");
    }

    if (whaleBalanceBigInt < balance) {
      console.log(`❌ Whale ${whale} has insufficient balance ${symbol}: ${whaleBalanceBigInt.toString()}`);
    }

    // Impersonate the whale
    await client.impersonateAccount({
      address: whale,
    });

    // Create wallet client with dummy private key (not needed when impersonating)
    // Use a dummy key - Anvil will accept transactions from impersonated address
    const dummyKey = "0x0000000000000000000000000000000000000000000000000000000000000001" as Hex;
    const walletClient = createAnvilWalletClient(dummyKey);

    if (isNativeToken) {
      // For native token, use standard transfer
      await walletClient.sendTransaction({
        to: holderAddress,
        value: balance,
        account: whale,
      });
    } else {
      // Transfer ERC20 tokens using wallet client
      // The account will be set to whaleAddress via impersonation
      await walletClient.writeContract({
        address: tokenAddress,
        abi: [
          {
            inputs: [
              { internalType: "address", name: "recipient", type: "address" },
              { internalType: "uint256", name: "amount", type: "uint256" },
            ],
            name: "transfer",
            outputs: [{ internalType: "bool", name: "success", type: "bool" }],
            stateMutability: "nonpayable",
            type: "function",
          },
        ],
        functionName: "transfer",
        args: [holderAddress, balance],
        account: whale,
      });
    }

    // Wait for transaction to be mined
    await new Promise((resolve) => setTimeout(resolve, 200));

    // Stop impersonating
    await client.stopImpersonatingAccount({
      address: whale,
    });

    // Verify balance was set
    let newBalanceBigInt: bigint;
    if (isNativeToken) {
      const newBalance = (await publicClient.request({
        method: "eth_getBalance",
        params: [holderAddress, "latest"],
      })) as Hex;
      newBalanceBigInt = BigInt(newBalance || "0x0");
    } else {
      const newBalance = (await publicClient.request({
        method: "eth_call",
        params: [
          {
            to: tokenAddress,
            data: `0x70a08231${pad(holderAddress, { size: 32 }).slice(2)}`,
          },
          "latest",
        ],
      })) as Hex;
      newBalanceBigInt = BigInt(newBalance || "0x0");
    }

    if (newBalanceBigInt >= balance) {
      console.log(
        `✅ Set ${symbol} balance via transfer from whale ${whale} (balance: ${newBalanceBigInt.toString()})`,
      );
      return;
    }
  } catch {
    console.log(`❌ Failed to set ${symbol} balance using whale ${whale}`);
  }
}

/**
 * Common token addresses on Gnosis Chain with their balance mapping slots
 */
export const GNOSIS_TOKENS = {
  // Monerium tokens - these are upgradeable proxies with ERC20Upgradeable
  // The _balances mapping is at slot 51 (0x33) in OpenZeppelin's ERC20Upgradeable
  EURe: {
    address: "0xcB444e90D8198415266c6a2724b7900fb12FC56E" as Address,
    decimals: 18,
    whale: "0xe34413f01B525A1Ec864D4c8265f949EC570B601",
  },
  GBPe: {
    address: "0x5Cb9073902F2035222B9749F231fBd4c3C22B3A3" as Address,
    decimals: 18,
    whale: "0x376D5C3a16E9d015e8C584bB2d278E25F0ccb27B",
  },
  // wstETH
  wstETH: {
    address: "0x6C76971f98945AE98dD7d4DFcA8711ebea946eA6" as Address,
    decimals: 18,
    whale: "0x509Ad7278A2F6530Bc24590C83E93fAF8fd46E99",
  },
  // GNO
  GNO: {
    address: "0x9C58BAcC331c9aa871AFD802DB6379a98e80CEdb" as Address,
    decimals: 18,
    whale: "0x458cD345B4C05e8DF39d0A07220feb4Ec19F5e6f",
  },
  XDAI: {
    address: "0x0000000000000000000000000000000000000000" as Address,
    decimals: 18,
    balanceSlot: 0,
    whale: "0xe91D153E0b41518A2Ce8Dd3D7944Fa863463a97d",
  },
} as const;

/**
 * Sets up token balances for a test account
 *
 * @param accountAddress - The address to set balances for
 * @param balances - Map of token symbols to balances (in human-readable format)
 *
 * @example
 * ```typescript
 * await setupTestBalances("0x1234...", {
 *   EURe: "1000",    // 1000 EURe
 *   wstETH: "5.5",   // 5.5 wstETH
 *   xDAI: "100",     // 100 xDAI (native token)
 * });
 * ```
 */
export async function setupTestBalances(
  accountAddress: Address,
  balances: Partial<Record<keyof typeof GNOSIS_TOKENS | "xDAI", string>>,
): Promise<void> {
  const promises: Promise<void>[] = [];

  // Handle native token (xDAI)
  if (balances.xDAI) {
    promises.push(setNativeBalance(accountAddress, balances.xDAI));
  }

  // Handle ERC20 tokens
  for (const [symbol, amount] of Object.entries(balances)) {
    if (symbol === "xDAI") continue;

    const tokenInfo = GNOSIS_TOKENS[symbol as keyof typeof GNOSIS_TOKENS];
    if (tokenInfo) {
      const balanceWei = BigInt(Math.floor(parseFloat(amount) * 10 ** tokenInfo.decimals));
      // Use auto-detection for all tokens to find the correct storage slot
      // This handles upgradeable proxies and different storage layouts
      promises.push(setErc20BalanceViaTransfer(tokenInfo.address, accountAddress, balanceWei));
    }
  }

  await Promise.all(promises);
}

/**
 * Mines a block on Anvil (useful after setting storage)
 * Verifies that a block was actually mined by checking block numbers
 */
export async function mineBlock(): Promise<void> {
  const client = createAnvilClient();
  const publicClient = createAnvilPublicClient();

  // Get the current block number before mining
  const blockBefore = await publicClient.getBlockNumber();

  // Mine a block
  await client.mine({
    blocks: 1,
  });

  // Get the block number after mining
  const blockAfter = await publicClient.getBlockNumber();

  // Verify that the block number increased
  if (blockAfter <= blockBefore) {
    throw new Error(
      `Block mining failed: block number did not increase (before: ${blockBefore}, after: ${blockAfter})`,
    );
  }
}
