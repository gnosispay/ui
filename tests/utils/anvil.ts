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
  type Address,
  type Hex,
  pad,
  parseUnits,
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

const ERC20_TRANSFER_ABI = [
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
] as const;

const DUMMY_PRIVATE_KEY = "0x0000000000000000000000000000000000000000000000000000000000000001" as Hex;

async function impersonatedErc20Transfer(
  tokenAddress: Address,
  from: Address,
  to: Address,
  amount: bigint,
): Promise<void> {
  if (amount === 0n) {
    return;
  }

  const client = createAnvilClient();
  const walletClient = createAnvilWalletClient(DUMMY_PRIVATE_KEY);

  await client.impersonateAccount({ address: from });

  try {
    await walletClient.writeContract({
      address: tokenAddress,
      abi: ERC20_TRANSFER_ABI,
      functionName: "transfer",
      args: [to, amount],
      account: from,
    });
    await new Promise((resolve) => setTimeout(resolve, 200));
  } finally {
    await client.stopImpersonatingAccount({ address: from });
  }
}

/**
 * Sets an exact on-chain token balance on the Anvil fork.
 * Existing fork balances are adjusted up or down so tests can assert precise values.
 */
async function setExactTokenBalance(tokenAddress: Address, holderAddress: Address, targetBalance: bigint): Promise<void> {
  const client = createAnvilClient();
  const isNativeToken = tokenAddress.toLowerCase() === "0x0000000000000000000000000000000000000000";
  const [symbol, token] = Object.entries(GNOSIS_TOKENS).find(([_, entry]) => entry.address === tokenAddress) ?? [];
  const whale = token?.whale;

  if (!whale) {
    throw new Error(`No whale found for token ${symbol}`);
  }

  try {
    if (isNativeToken) {
      await client.setBalance({
        address: holderAddress,
        value: targetBalance,
      });
    } else {
      const currentBalance = await readOnChainBalance(tokenAddress, holderAddress);

      if (currentBalance > targetBalance) {
        await impersonatedErc20Transfer(tokenAddress, holderAddress, whale, currentBalance - targetBalance);
      } else if (currentBalance < targetBalance) {
        await impersonatedErc20Transfer(tokenAddress, whale, holderAddress, targetBalance - currentBalance);
      }
    }

    const finalBalance = await readOnChainBalance(tokenAddress, holderAddress);

    if (finalBalance !== targetBalance) {
      throw new Error(
        `Failed to set ${symbol} balance for ${holderAddress}: expected ${targetBalance.toString()}, got ${finalBalance.toString()}`,
      );
    }

    console.log(`✅ Set ${symbol} balance to ${targetBalance.toString()} for ${holderAddress}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to set ${symbol} balance using whale ${whale}: ${message}`);
  }
}

async function readOnChainBalance(tokenAddress: Address, holderAddress: Address): Promise<bigint> {
  const publicClient = createAnvilPublicClient();
  const isNativeToken = tokenAddress.toLowerCase() === "0x0000000000000000000000000000000000000000";

  if (isNativeToken) {
    const balance = (await publicClient.request({
      method: "eth_getBalance",
      params: [holderAddress, "latest"],
    })) as Hex;
    return BigInt(balance || "0x0");
  }

  const balance = (await publicClient.request({
    method: "eth_call",
    params: [
      {
        to: tokenAddress,
        data: `0x70a08231${pad(holderAddress, { size: 32 }).slice(2)}`,
      },
      "latest",
    ],
  })) as Hex;
  return BigInt(balance || "0x0");
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
    whale: "0x458cD345B4C05e8DF39d0A07220feb4Ec19F5e6f",
  },
  // GNO
  GNO: {
    address: "0x9C58BAcC331c9aa871AFD802DB6379a98e80CEdb" as Address,
    decimals: 18,
    whale: "0x458cD345B4C05e8DF39d0A07220feb4Ec19F5e6f",
  },
  xDAI: {
    address: "0x0000000000000000000000000000000000000000" as Address,
    decimals: 18,
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
  balances: Partial<Record<keyof typeof GNOSIS_TOKENS, string>>,
): Promise<void> {
  const promises: Promise<void>[] = [];

  // Handle ERC20 tokens
  for (const [symbol, amount] of Object.entries(balances)) {
    const tokenInfo = GNOSIS_TOKENS[symbol];
    if (tokenInfo) {
      const balanceWei = parseUnits(amount, tokenInfo.decimals);
      promises.push(setExactTokenBalance(tokenInfo.address, accountAddress, balanceWei));
    }
  }

  await Promise.all(promises);

  for (const [symbol, amount] of Object.entries(balances)) {
    const tokenInfo = GNOSIS_TOKENS[symbol as keyof typeof GNOSIS_TOKENS];
    if (!tokenInfo) {
      continue;
    }

    const expectedBalance = parseUnits(amount, tokenInfo.decimals);
    const actualBalance = await readOnChainBalance(tokenInfo.address, accountAddress);

    if (actualBalance !== expectedBalance) {
      throw new Error(
        `On-chain ${symbol} balance verification failed for ${accountAddress}: expected ${expectedBalance.toString()}, got ${actualBalance.toString()}`,
      );
    }
  }
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
