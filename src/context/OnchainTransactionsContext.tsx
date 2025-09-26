import { type ReactNode, createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { groupByDate } from "@/utils/transactionUtils";
import type { Erc20TokenEvent } from "@/types/transaction";
import { useAuth } from "./AuthContext";
import { useUser } from "./UserContext";
import { fetchErc20Transfers } from "@/lib/fetchErc20Transfers";
import { extractErrorMessage } from "@/utils/errorHelpers";
import { subDays, formatISO, format } from "date-fns";
import { currencies } from "@/constants";
import type { Address } from "viem";

export const DEFAULT_ONCHAIN_TRANSACTIONS_DAYS = 30;
export const LOAD_MORE_ONCHAIN_TRANSACTIONS_DAYS = 90;

type OnchainTransactionsContextProps = {
  children: ReactNode | ReactNode[];
};

export type IOnchainTransactionsContext = {
  onchainTransactionsByDate: Record<string, Erc20TokenEvent[]>;
  onchainTransactionsLoading: boolean;
  onchainTransactionsError: string;
  isLoadingMoreOnchainTransactions: boolean;
  loadMoreOnchainTransactions: () => void;
  currentOldestDate: Date | null;
  hasNextPage: boolean;
  setFetchingEnabled: (enabled: boolean) => void;
};

const OnchainTransactionsContext = createContext<IOnchainTransactionsContext | undefined>(undefined);

const OnchainTransactionsContextProvider = ({ children }: OnchainTransactionsContextProps) => {
  const { isAuthenticated } = useAuth();
  const { safeConfig } = useUser();
  const [onchainTransactionsByDate, setOnchainTransactionsByDate] = useState<Record<string, Erc20TokenEvent[]>>({});
  const [onchainTransactionsLoading, setOnchainTransactionsLoading] = useState(true);
  const [onchainTransactionsError, setOnchainTransactionsError] = useState("");
  const [isLoadingMoreOnchainTransactions, setIsLoadingMoreOnchainTransactions] = useState(false);
  const [currentOldestDate, setCurrentOldestDate] = useState<Date | null>(null);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [fetchingEnabled, setFetchingEnabled] = useState(false);
  const currentDaysLoadedRef = useRef(DEFAULT_ONCHAIN_TRANSACTIONS_DAYS);
  const currentOldestDateRef = useRef<Date | null>(null);

  const tokenAddress = useMemo(() => {
    if (!safeConfig?.tokenSymbol) return undefined;
    const safeCurrencyEntry = Object.values(currencies).find(
      (currency) => currency.tokenSymbol === safeConfig.tokenSymbol,
    );
    return safeCurrencyEntry?.address;
  }, [safeConfig?.tokenSymbol]);

  // Sync ref with state to avoid dependency issues
  useEffect(() => {
    currentOldestDateRef.current = currentOldestDate;
  }, [currentOldestDate]);

  const fetchOnchainTransactions = useCallback(
    async (isLoadMore = false) => {
      if (!safeConfig?.address || !tokenAddress) {
        if (isLoadMore) {
          setIsLoadingMoreOnchainTransactions(false);
        } else {
          setOnchainTransactionsLoading(false);
        }
        return;
      }

      if (isLoadMore) {
        setIsLoadingMoreOnchainTransactions(true);
      } else {
        setOnchainTransactionsLoading(true);
        currentDaysLoadedRef.current = DEFAULT_ONCHAIN_TRANSACTIONS_DAYS;
      }
      setOnchainTransactionsError("");

      let fromDate: Date;
      let toDate: Date | undefined;

      if (isLoadMore) {
        // Load more: fetch older transactions
        const currentOldest = currentOldestDateRef.current || subDays(new Date(), currentDaysLoadedRef.current);
        toDate = currentOldest;
        fromDate = subDays(currentOldest, LOAD_MORE_ONCHAIN_TRANSACTIONS_DAYS);
        currentDaysLoadedRef.current += LOAD_MORE_ONCHAIN_TRANSACTIONS_DAYS;
      } else {
        // Initial load: fetch recent transactions
        fromDate = subDays(new Date(), DEFAULT_ONCHAIN_TRANSACTIONS_DAYS);
      }

      const formattedFromDate = formatISO(fromDate);
      const formattedToDate = toDate ? formatISO(toDate) : undefined;

      const { data, error, reachedGenesisBlock } = await fetchErc20Transfers({
        address: safeConfig.address as Address,
        tokenAddress: tokenAddress as Address,
        fromDate: formattedFromDate,
        toDate: formattedToDate,
        skipSettlementTransfers: true,
      });

      if (error) {
        const errorMessage = isLoadMore
          ? `Error loading more transactions from ${format(fromDate, "MMM dd, yyyy")}`
          : "Error fetching onchain transactions";
        setOnchainTransactionsError(extractErrorMessage(error, errorMessage));
        console.error("Error fetching onchain transactions:", error);
      } else if (data !== undefined) {
        // Update hasNextPage based on whether we've reached genesis block
        if (reachedGenesisBlock) {
          setHasNextPage(false);
        }

        if (isLoadMore) {
          // Merge new transactions with existing ones (even if empty - that's fine)
          setOnchainTransactionsByDate((prev) => {
            const combined = [...Object.values(prev).flat(), ...data];
            return groupByDate(combined);
          });

          // Update the oldest date - use the search fromDate if no transactions found
          if (data.length > 0) {
            const oldestTransaction = data.reduce((oldest, tx) => (tx.date < oldest.date ? tx : oldest), data[0]);
            setCurrentOldestDate(oldestTransaction.date);
          } else {
            setCurrentOldestDate(fromDate);
          }
        } else {
          // Initial load - replace existing transactions
          setOnchainTransactionsByDate(groupByDate(data));
          setHasNextPage(true); // Reset hasNextPage on initial load

          // Set the oldest date from initial load
          if (data.length > 0) {
            const oldestTransaction = data.reduce((oldest, tx) => (tx.date < oldest.date ? tx : oldest), data[0]);
            setCurrentOldestDate(oldestTransaction.date);
          } else {
            setCurrentOldestDate(fromDate);
          }
        }
      }

      if (isLoadMore) {
        setIsLoadingMoreOnchainTransactions(false);
      } else {
        setOnchainTransactionsLoading(false);
      }
    },
    [safeConfig?.address, tokenAddress],
  );

  useEffect(() => {
    if (!fetchingEnabled || !isAuthenticated || !safeConfig?.address || !tokenAddress) {
      setOnchainTransactionsByDate({});
      setOnchainTransactionsLoading(false);
      setCurrentOldestDate(null);
      setHasNextPage(true);
      currentDaysLoadedRef.current = DEFAULT_ONCHAIN_TRANSACTIONS_DAYS;
      return;
    }

    // Initial fetch
    fetchOnchainTransactions(false);

    const interval = 5 * 60 * 1000; // 5 minutes
    const intervalId = setInterval(() => {
      fetchOnchainTransactions(false); // Always do initial fetch for periodic updates
    }, interval);

    return () => {
      clearInterval(intervalId);
    };
  }, [fetchingEnabled, fetchOnchainTransactions, isAuthenticated, safeConfig?.address, tokenAddress]);

  const loadMoreOnchainTransactions = useCallback(() => {
    if (!safeConfig?.address || !tokenAddress || isLoadingMoreOnchainTransactions || !hasNextPage) {
      return;
    }
    fetchOnchainTransactions(true);
  }, [safeConfig?.address, tokenAddress, isLoadingMoreOnchainTransactions, hasNextPage, fetchOnchainTransactions]);

  const contextValue = useMemo(
    () => ({
      onchainTransactionsByDate,
      onchainTransactionsLoading,
      onchainTransactionsError,
      isLoadingMoreOnchainTransactions,
      loadMoreOnchainTransactions,
      currentOldestDate,
      hasNextPage,
      setFetchingEnabled,
    }),
    [
      onchainTransactionsByDate,
      onchainTransactionsLoading,
      onchainTransactionsError,
      isLoadingMoreOnchainTransactions,
      loadMoreOnchainTransactions,
      currentOldestDate,
      hasNextPage,
    ],
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
