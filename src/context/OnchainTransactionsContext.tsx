import { type ReactNode, createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { groupByDate } from "@/utils/transactionUtils";
import type { Erc20TokenEvent } from "@/types/transaction";
import { useAuth } from "./AuthContext";
import { useUser } from "./UserContext";
import { fetchErc20Transfers } from "@/lib/fetchErc20Transfers";
import { extractErrorMessage } from "@/utils/errorHelpers";
import { subDays, formatISO } from "date-fns";
import { currencies } from "@/constants";
import type { Address } from "viem";

export const DEFAULT_ONCHAIN_TRANSACTIONS_DAYS = 30;

type OnchainTransactionsContextProps = {
  children: ReactNode | ReactNode[];
};

export type IOnchainTransactionsContext = {
  onchainTransactionsByDate: Record<string, Erc20TokenEvent[]>;
  onchainTransactionsLoading: boolean;
  onchainTransactionsError: string;
};

const OnchainTransactionsContext = createContext<IOnchainTransactionsContext | undefined>(undefined);

const OnchainTransactionsContextProvider = ({ children }: OnchainTransactionsContextProps) => {
  const { isAuthenticated } = useAuth();
  const { safeConfig } = useUser();
  const [onchainTransactionsByDate, setOnchainTransactionsByDate] = useState<Record<string, Erc20TokenEvent[]>>({});
  const [onchainTransactionsLoading, setOnchainTransactionsLoading] = useState(true);
  const [onchainTransactionsError, setOnchainTransactionsError] = useState("");

  const tokenAddress = useMemo(() => {
    if (!safeConfig?.tokenSymbol) return undefined;
    const safeCurrencyEntry = Object.values(currencies).find(
      (currency) => currency.tokenSymbol === safeConfig.tokenSymbol,
    );
    return safeCurrencyEntry?.address;
  }, [safeConfig?.tokenSymbol]);

  const fetchOnchainTransactions = useCallback(async () => {
    if (!safeConfig?.address || !tokenAddress) {
      setOnchainTransactionsLoading(false);
      return;
    }

    setOnchainTransactionsLoading(true);
    setOnchainTransactionsError("");

    const fromDate = subDays(new Date(), DEFAULT_ONCHAIN_TRANSACTIONS_DAYS);
    const formattedFromDate = formatISO(fromDate);

    const { data, error } = await fetchErc20Transfers({
      address: safeConfig.address as Address,
      tokenAddress: tokenAddress as Address,
      fromDate: formattedFromDate,
      skipSettlementTransfers: true,
    });

    if (error) {
      setOnchainTransactionsError(extractErrorMessage(error, "Error fetching onchain transactions"));
      console.error("Error fetching onchain transactions:", error);
    } else if (data) {
      setOnchainTransactionsByDate(groupByDate(data));
    }

    setOnchainTransactionsLoading(false);
  }, [safeConfig?.address, tokenAddress]);

  useEffect(() => {
    if (!isAuthenticated || !safeConfig?.address || !tokenAddress) {
      setOnchainTransactionsByDate({});
      setOnchainTransactionsLoading(false);
      return;
    }

    // Initial fetch
    fetchOnchainTransactions();

    const interval = 5 * 60 * 1000; // 5 minutes
    const intervalId = setInterval(() => {
      fetchOnchainTransactions();
    }, interval);

    return () => {
      clearInterval(intervalId);
    };
  }, [fetchOnchainTransactions, isAuthenticated, safeConfig?.address, tokenAddress]);

  const contextValue = useMemo(
    () => ({
      onchainTransactionsByDate,
      onchainTransactionsLoading,
      onchainTransactionsError,
    }),
    [onchainTransactionsByDate, onchainTransactionsLoading, onchainTransactionsError],
  );

  return <OnchainTransactionsContext.Provider value={contextValue}>{children}</OnchainTransactionsContext.Provider>;
};

const useOnchainTransactions = () => {
  const context = useContext(OnchainTransactionsContext);
  if (context === undefined) {
    throw new Error("useOnchainTransactions must be used within a OnchainTransactionsContextProvider");
  }
  return context;
};

export { OnchainTransactionsContextProvider, useOnchainTransactions };
