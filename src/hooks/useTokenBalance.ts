import { getBalance } from "wagmi/actions";
import { currencies, type CurrencyInfo } from "@/constants";
import { useState, useEffect, useCallback } from "react";
import { config } from "@/wagmi";
import { useUser } from "@/context/UserContext";
import type { Address } from "viem";

export interface CurrencyInfoWithBalance extends CurrencyInfo {
  balance: bigint;
}

export type CurrencyWithBalance = Record<string, CurrencyInfoWithBalance>;

export interface UseTokenBalanceResult {
  currenciesWithBalance: CurrencyWithBalance;
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
}

export const useTokenBalance = (): UseTokenBalanceResult => {
  const { safeConfig } = useUser();
  const [currenciesWithBalance, setCurrenciesWithBalance] = useState<CurrencyWithBalance>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  const fetchBalances = useCallback(async () => {
    if (!safeConfig?.address) {
      // Initialize with zero balances when no address
      const initialCurrencies: CurrencyWithBalance = {};
      for (const [symbol, currency] of Object.entries(currencies)) {
        initialCurrencies[symbol] = {
          ...currency,
          balance: 0n,
        };
      }
      setCurrenciesWithBalance(initialCurrencies);
      return;
    }

    setIsLoading(true);
    setIsError(false);

    try {
      const balancePromises = Object.values(currencies).map(async (currency) => {
        if (!currency.address) {
          return Promise.resolve({ value: 0n });
        }

        return getBalance(config, {
          address: safeConfig.address as Address,
          token: currency.address as Address,
        });
      });

      const balanceResults = await Promise.all(balancePromises);
      const newCurrencies: CurrencyWithBalance = {};

      for (const [index, result] of balanceResults.entries()) {
        newCurrencies[Object.keys(currencies)[index]] = {
          ...currencies[Object.keys(currencies)[index]],
          balance: result.value,
        };
      }

      setCurrenciesWithBalance(newCurrencies);
    } catch (error) {
      console.error("Error fetching token balances:", error);
      setIsError(true);

      // Set default balances on error
      const errorCurrencies: CurrencyWithBalance = {};
      for (const [key, currency] of Object.entries(currencies)) {
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
