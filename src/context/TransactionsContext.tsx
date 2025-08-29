import { type ReactNode, createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { groupByDate, mergeAndSortTransactions } from "@/utils/transactionUtils";
import { isAfter, parseISO, formatISO, subDays } from "date-fns";
import type { Transaction } from "@/types/transaction";
import { currencies } from "@/constants";
import { useUser } from "./UserContext";
import { useAuth } from "./AuthContext";
import { fetchErc20Transfers } from "@/lib/fetchErc20Transfers";
import type { Address } from "viem";
import { getApiV1IbansOrders, getApiV1CardsTransactions } from "@/client";

const DEFAULT_TRANSACTIONS_HISTORY = 30;

type TransactionsContextProps = {
  children: ReactNode | ReactNode[];
};

interface GetTxParams {
  cardTokens?: string[];
  fromDate?: string;
}

interface GetOnchainTransfersParams {
  address: Address;
  tokenAddress: Address;
  fromDate?: string;
  skipSettlementTransfers: boolean;
}

export type ITransactionsContext = {
  isLoading: boolean;
  isError: boolean;
  transactions: Record<string, Transaction[]>;
};

type GetTransactionsParams = {
  history: number;
  withIban: boolean;
  withOnchain: boolean;
};

const TransactionsContext = createContext<ITransactionsContext | undefined>(undefined);

const TransactionsContextProvider = ({ children }: TransactionsContextProps) => {
  const { isAuthenticated } = useAuth();
  const { safeConfig } = useUser();
  const [transactions, setTransactions] = useState<Record<string, Transaction[]>>({});
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const tokenAddress = useMemo(() => {
    if (!safeConfig?.tokenSymbol) return undefined;
    const safeCurrencyEntry = Object.values(currencies).find(
      (currency) => currency.tokenSymbol === safeConfig.tokenSymbol,
    );
    return safeCurrencyEntry?.address;
  }, [safeConfig?.tokenSymbol]);

  const getCardTransactions = useCallback(async ({ cardTokens, fromDate }: GetTxParams = {}) => {
    const { data, error } = await getApiV1CardsTransactions({
      query: {
        cardTokens: cardTokens?.join(","),
        after: fromDate,
      },
    });

    if (error) {
      console.error("Error getting transactions: ", error);
      return;
    }

    return data.results;
  }, []);

  const getIbanOrders = useCallback(async () => {
    const { data, error } = await getApiV1IbansOrders();

    if (error) {
      console.error("Error getting IBAN orders: ", error);
      return;
    }

    return data?.data;
  }, []);

  const getOnchainTransfers = useCallback(
    async ({ address, tokenAddress, fromDate, skipSettlementTransfers }: GetOnchainTransfersParams) => {
      const { data, error } = await fetchErc20Transfers({
        address,
        tokenAddress,
        fromDate,
        skipSettlementTransfers,
      });

      if (error) {
        console.error("Error getting onchain Safe transfers: ", error);
        return;
      }

      return data;
    },
    [],
  );

  const fetchTransactions = useCallback(
    ({ history = DEFAULT_TRANSACTIONS_HISTORY, withIban, withOnchain }: GetTransactionsParams) => {
      if (!safeConfig || !safeConfig.address || !tokenAddress) {
        return;
      }

      const fromDate = subDays(new Date(), history);
      const formattedFromDate = fromDate ? formatISO(fromDate) : undefined;

      setIsLoading(true);
      setIsError(false);

      Promise.all([
        withIban && getIbanOrders(),
        withOnchain
          ? getOnchainTransfers({
              address: safeConfig.address as Address,
              tokenAddress: tokenAddress as Address,
              fromDate: formattedFromDate,
              skipSettlementTransfers: true,
            })
          : undefined,
        getCardTransactions({
          fromDate: formattedFromDate,
        }),
      ])
        .then(([fetchedIbanOrders, fetchedOnchainSafeTransfers, fetchedCardTransactions]) => {
          /**
           * For now, we're manually filtering IBAN orders by the placement date before setting
           * them in the state as this API endpoint still doesn't support filtering by date.
           *
           * However, when the API starts supporting this, we can remove the manual filtering
           * and filter the IBAN orders via the query params directly.
           */
          const ibanOrders = (fetchedIbanOrders || []).filter((order) =>
            fromDate ? isAfter(parseISO(order.meta.placedAt), fromDate) : true,
          );

          const processedTransactions = mergeAndSortTransactions(
            fetchedCardTransactions,
            ibanOrders,
            fetchedOnchainSafeTransfers,
          );
          const processedDateGroupedTransactions = groupByDate(processedTransactions);
          setTransactions(processedDateGroupedTransactions);
        })
        .catch((error) => {
          setIsError(true);
          console.error("Error getting transactions: ", error);
          return undefined;
        })
        .finally(() => {
          setIsLoading(false);
        });
    },
    [getCardTransactions, getIbanOrders, getOnchainTransfers, tokenAddress, safeConfig],
  );

  useEffect(() => {
    if (!isAuthenticated) return;

    // Initial fetch
    fetchTransactions({
      history: DEFAULT_TRANSACTIONS_HISTORY,
      withIban: true,
      withOnchain: true,
    });

    const interval = 3 * 60 * 1000; // 3 minutes
    const intervalId = setInterval(() => {
      fetchTransactions({
        history: DEFAULT_TRANSACTIONS_HISTORY,
        withIban: true,
        withOnchain: true,
      });
    }, interval);

    return () => {
      clearInterval(intervalId);
    };
  }, [isAuthenticated, fetchTransactions]);

  return (
    <TransactionsContext.Provider value={{ isLoading, isError, transactions }}>{children}</TransactionsContext.Provider>
  );
};

const useTransactions = () => {
  const context = useContext(TransactionsContext);
  if (context === undefined) {
    throw new Error("useTransactions must be used within a TransactionsContextProvider");
  }
  return context;
};

export { TransactionsContextProvider, useTransactions };
