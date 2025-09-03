"use client";

import { useQuery } from "@tanstack/react-query";
import { useBalance } from "wagmi";
import { useState } from "react";
import { fetchApi } from "@/lib/api";

export interface AccountBalancesResponse {
  spendable: bigint;
  total: bigint;
  pending: bigint;
}

export const useAccountBalances = (
  address: `0x${string}`,
  tokenAddress: `0x${string}` | undefined,
) => {
  const [hasApiError, setHasApiError] = useState(false);

  const {
    data: onchainBalanceData,
    isError: isOnchainError,
    isLoading: isOnchainLoading,
  } = useBalance({
    address,
    token: tokenAddress,
    chainId: 100,
    query: {
      enabled: hasApiError,
    },
  });

  const getOnchainBalanceData = () => {
    if (!isOnchainLoading && !isOnchainError && onchainBalanceData) {
      return {
        spendable: onchainBalanceData.value,
        total: onchainBalanceData.value,
        pending: 0n,
      };
    }
    return undefined;
  };

  return useQuery({
    queryKey: ["accountBalancesQuery", address, tokenAddress],
    refetchInterval: 60 * 1000,
    queryFn: async (): Promise<AccountBalancesResponse | undefined> => {
      try {
        const { data } = await fetchApi(`/account-balances`);
        setHasApiError(false);
        return data;
      } catch (error) {
        console.log("Failed to fetch account balances from API, falling back to onchain data", error);
        setHasApiError(true); 
        
        const fallbackData = getOnchainBalanceData();
        if (fallbackData) {
          return fallbackData;
        }
        throw error;
      }
    },
  });
};
