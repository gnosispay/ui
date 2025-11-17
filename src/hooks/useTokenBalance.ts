import { getBalance } from "wagmi/actions";
import { currencies as moneriumTokens, supportedTokens, type TokenInfo } from "@/constants";
import { useState, useEffect, useCallback } from "react";
import { wagmiAdapter } from "@/wagmi";
import { useUser } from "@/context/UserContext";
import type { Address } from "viem";

export interface TokenInfoWithBalance extends TokenInfo {
  balance: bigint;
}

export type TokenWithBalance = Record<string, TokenInfoWithBalance>;

export interface UseTokenBalanceResult {
  currenciesWithBalance: TokenWithBalance;
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
}

const tokens = { ...moneriumTokens, ...supportedTokens };

export const useTokenBalance = (): UseTokenBalanceResult => {
  const { safeConfig } = useUser();
  const [currenciesWithBalance, setCurrenciesWithBalance] = useState<TokenWithBalance>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  const fetchBalances = useCallback(async () => {
    if (!safeConfig?.address) {
      // Initialize with zero balances when no address
      const initialTokens: TokenWithBalance = {};
      for (const [symbol, currency] of Object.entries(tokens)) {
        initialTokens[symbol] = {
          ...currency,
          balance: 0n,
        };
      }
      setCurrenciesWithBalance(initialTokens);
      return;
    }

    setIsLoading(true);
    setIsError(false);

    try {
      const balancePromises = Object.values(tokens).map(async (token) => {
        if (!token.address) {
          return Promise.resolve({ value: 0n });
        }

        return getBalance(wagmiAdapter.wagmiConfig, {
          address: safeConfig.address as Address,
          token: token.address !== supportedTokens.XDAI.address ? (token.address as Address) : undefined,
        });
      });

      const balanceResults = await Promise.all(balancePromises);
      const newCurrencies: TokenWithBalance = {};

      for (const [index, result] of balanceResults.entries()) {
        newCurrencies[Object.keys(tokens)[index]] = {
          ...tokens[Object.keys(tokens)[index]],
          balance: result.value,
        };
      }

      setCurrenciesWithBalance(newCurrencies);
    } catch (error) {
      console.error("Error fetching token balances:", error);
      setIsError(true);

      // Set default balances on error
      const errorCurrencies: TokenWithBalance = {};
      for (const [key, currency] of Object.entries(tokens)) {
        errorCurrencies[key] = {
          ...currency,
          balance: 0n,
        };
      }
      setCurrenciesWithBalance(errorCurrencies);
    } finally {
      setIsLoading(false);
    }
  }, [safeConfig]);

  useEffect(() => {
    fetchBalances();
  }, [fetchBalances]);

  const refetch = useCallback(() => {
    fetchBalances();
  }, [fetchBalances]);

  return {
    currenciesWithBalance,
    isLoading,
    isError,
    refetch,
  };
};
