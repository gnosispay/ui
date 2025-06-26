import { useEffect, useState, useMemo } from "react";
import {
  groupByDate,
  mergeAndSortTransactions,
} from "@/utils/transactionUtils";
import { useCards } from "@/context/CardsContext";
import { isAfter, parseISO, formatISO } from "date-fns";
import type { Transaction } from "@/types/transaction";
import { currencies } from "@/constants";
import type { SafeConfig } from "@/client";
import type { Address } from "viem";

interface UseTransactionsPayload {
  transactions: Transaction[];
  dateGroupedTransactions: Record<string, Transaction[]>;
  orderedTransactions: string[];
  isLoading: boolean;
  isError: boolean;
}

interface UseTransactionsParams {
  fromDate?: Date;
  safeConfig: SafeConfig | undefined;
}

export const useTransactions = ({
  fromDate,
  safeConfig,
}: UseTransactionsParams): UseTransactionsPayload => {
  const { getTransactions, getIbanOrders, getOnchainTransfers } = useCards();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [dateGroupedTransactions, setDateGroupedTransactions] = useState<
    Record<string, Transaction[]>
  >({});
  const [orderedTransactions, setOrderedTransactions] = useState<string[]>([]);
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const formattedFromDate = fromDate ? formatISO(fromDate) : undefined;

  const memoizedSafeAddress = useMemo(
    () => safeConfig?.address,
    [safeConfig?.address]
  );
  const memoizedTokenAddress = useMemo(() => {
    if (!safeConfig?.tokenSymbol) return undefined;
    const safeCurrencyEntry = Object.values(currencies).find(
      (currency) => currency.tokenSymbol === safeConfig.tokenSymbol
    );
    return safeCurrencyEntry?.address;
  }, [safeConfig?.tokenSymbol]);

  useEffect(() => {
    if (!safeConfig || !safeConfig.address || !memoizedTokenAddress) {
      return;
    }

    setIsLoading(true);
    setIsError(false);

    Promise.all([
      getTransactions({
        fromDate: formattedFromDate,
      }),
      getIbanOrders(),
      getOnchainTransfers({
        address: memoizedSafeAddress as Address,
        tokenAddress: memoizedTokenAddress as Address,
        fromDate: formattedFromDate,
        skipSettlementTransfers: true,
      }),
    ])
      .then(
        ([
          fetchedCardTransactions,
          fetchedIbanOrders,
          fetchedOnchainSafeTransfers,
        ]) => {
          /**
           * For now, we're manually filtering IBAN orders by the placement date before setting
           * them in the state as this API endpoint still doesn't support filtering by date.
           *
           * However, when the API starts supporting this, we can remove the manual filtering
           * and filter the IBAN orders via the query params directly.
           */
          const ibanOrders = (fetchedIbanOrders || []).filter((order) =>
            fromDate ? isAfter(parseISO(order.meta.placedAt), fromDate) : true
          );

          const processedTransactions = mergeAndSortTransactions(
            fetchedCardTransactions,
            ibanOrders,
            fetchedOnchainSafeTransfers
          );
          const processedDateGroupedTransactions = groupByDate(
            processedTransactions
          );
          const processedOrderedTransactions = Object.keys(
            processedDateGroupedTransactions
          ).sort(
            (firstTxDate, secondTxDate) =>
              new Date(secondTxDate).getTime() - new Date(firstTxDate).getTime()
          );

          setTransactions(processedTransactions);
          setDateGroupedTransactions(processedDateGroupedTransactions);
          setOrderedTransactions(processedOrderedTransactions);
        }
      )
      .catch((error) => {
        setIsError(true);
        console.error("Error getting transactions: ", error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [
    getTransactions,
    getIbanOrders,
    getOnchainTransfers,
    formattedFromDate,
    fromDate,
    memoizedSafeAddress,
    memoizedTokenAddress,
    safeConfig,
  ]);

  return {
    transactions,
    dateGroupedTransactions,
    orderedTransactions,
    isLoading,
    isError,
  };
};
