import { useTransactions } from "@/context/TransactionsContext";
import { TransactionType, type Transaction } from "@/types/transaction";
import { formatISO, isAfter, subDays } from "date-fns";
import { useMemo } from "react";

interface UseFilteredTransactionsProps {
  withIban: boolean;
  history: number;
  withOnchain: boolean;
  cardTokens?: string[];
}

export const useFilteredTransactions = ({ withIban, history, withOnchain }: UseFilteredTransactionsProps) => {
  const { transactions, isLoading, isError } = useTransactions();
  const filteredTransactions = useMemo(() => {
    if (!Object.keys(transactions).length || isLoading) return {};

    const filteredTransactions = Object.keys(transactions).reduce((acc: Record<string, Transaction[]>, date) => {
      const fromDate = subDays(new Date(), history);
      const formattedFromDate = fromDate ? formatISO(fromDate) : undefined;

      const txs = transactions[date].filter((tx) => {
        if (formattedFromDate) {
          return isAfter(tx.createdAt, formattedFromDate);
        }
        return true;
      });

      const filteredTxs = txs.filter((tx) => {
        if (!withIban) {
          return tx.type !== TransactionType.IBAN;
        }

        if (!withOnchain) {
          return tx.type !== TransactionType.ONCHAIN;
        }

        return true;
      });

      if (filteredTxs.length > 0) {
        acc[date] = filteredTxs;
      }
      return acc;
    }, {});

    return filteredTransactions;
  }, [transactions, withIban, withOnchain, history, isLoading]);

  return { filteredTransactions, isLoading, isError };
};
