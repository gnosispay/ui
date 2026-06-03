import { getBalance } from "wagmi/actions";
import { currencies as moneriumTokens, supportedTokens } from "@/constants";
import { useState, useEffect, useCallback } from "react";
import { wagmiAdapter } from "@/wagmi";
import type { Address } from "viem";
import type { TokenWithBalance } from "@/hooks/useTokenBalance";

export interface UseOldSafeBalancesResult {
  currenciesWithBalance: TokenWithBalance;
  hasBalance: boolean;
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
}

const tokens = { ...moneriumTokens, ...supportedTokens };

export const useOldSafeBalances = (safeAddress: Address | undefined): UseOldSafeBalancesResult => {
  const [currenciesWithBalance, setCurrenciesWithBalance] = useState<TokenWithBalance>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  const fetchBalances = useCallback(async () => {
    if (!safeAddress) {
      const initialTokens: TokenWithBalance = {};
      for (const [symbol, currency] of Object.entries(tokens)) {
        initialTokens[symbol] = {
          ...currency,
          balance: 0n,
        };
      }
      setCurrenciesWithBalance(initialTokens);
      setIsLoading(false);
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
          address: safeAddress,
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
      console.error("Error fetching old safe balances:", error);
      setIsError(true);

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
  }, [safeAddress]);

  useEffect(() => {
    fetchBalances();
  }, [fetchBalances]);

  const refetch = useCallback(() => {
    fetchBalances();
  }, [fetchBalances]);

  const hasBalance = Object.values(currenciesWithBalance).some((token) => token.balance > 0n);

  return {
    currenciesWithBalance,
    hasBalance,
    isLoading,
    isError,
    refetch,
  };
};
