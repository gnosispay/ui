import { useEffect, useState } from "react";
import { groupByDate, mergeAndSortTransactions } from "@/utils/transactionUtils";
import { useCards } from "@/context/CardsContext";
import { isAfter, parseISO } from "date-fns";
import type { Transaction } from "@/types/transaction";

interface UseTransactionsPayload {
  transactions: Transaction[];
  dateGroupedTransactions: Record<string, Transaction[]>;
  orderedTransactions: string[];
  isLoading: boolean;
  isError: boolean;
}

interface UseTransactionsParams {
  fromDate?: Date;
}

export const useTransactions = ({ fromDate }: UseTransactionsParams): UseTransactionsPayload => {
  const { getTransactions, getIbanOrders } = useCards();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [dateGroupedTransactions, setDateGroupedTransactions] = useState<Record<string, Transaction[]>>({});
  const [orderedTransactions, setOrderedTransactions] = useState<string[]>([]);
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAllTransactions = async () => {
      try {
        setIsLoading(true);
        setIsError(false);

        const [fetchedCardTransactions, fetchedIbanOrders] = await Promise.all([
          getTransactions({ fromDate: fromDate?.toISOString() }),
          getIbanOrders(),
        ]);

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

        const processedTransactions = mergeAndSortTransactions(fetchedCardTransactions, ibanOrders);
        const processedDateGroupedTransactions = groupByDate(processedTransactions);
        const processedOrderedTransactions = Object.keys(processedDateGroupedTransactions).sort(
          (firstTxDate, secondTxDate) => new Date(secondTxDate).getTime() - new Date(firstTxDate).getTime(),
        );

        setTransactions(processedTransactions);
        setDateGroupedTransactions(processedDateGroupedTransactions);
        setOrderedTransactions(processedOrderedTransactions);
      } catch (error) {
        setIsError(true);
        console.error("Error getting transactions: ", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllTransactions();
  }, [getTransactions, getIbanOrders, fromDate]);

  return {
    transactions,
    dateGroupedTransactions,
    orderedTransactions,
    isLoading,
    isError,
  };
};
