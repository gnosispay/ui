import { getBalance, readContract } from "wagmi/actions";
import type { Address } from "viem";
import type { Config } from "wagmi";
import { ERC20_ABI } from "./abis/ERC20Abi";
import { supportedTokens } from "@/constants";

/**
 * Fetches the balance of a token for a given address.
 * Uses getBalance for native tokens and readContract for ERC20 tokens.
 *
 * @param config - Wagmi config instance
 * @param address - The address to check the balance for
 * @param tokenAddress - The token contract address (use supportedTokens.XDAI.address for native token)
 * @returns Promise resolving to the token balance as bigint
 */
export const getTokenBalance = async (
  config: Config,
  address: Address,
  tokenAddress: string | undefined,
): Promise<bigint> => {
  if (!tokenAddress) {
    return 0n;
  }

  // Native token (XDAI) has address 0x0000000000000000000000000000000000000000
  const isNativeToken = tokenAddress === supportedTokens.XDAI.address;

  if (isNativeToken) {
    // Use getBalance without token parameter for native token
    const result = await getBalance(config, {
      address,
    });
    return result.value;
  }

  // Use readContract for ERC20 tokens
  const balance = await readContract(config, {
    address: tokenAddress as Address,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: [address],
  });

  return balance as bigint;
};
