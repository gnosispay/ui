import type { Event } from "@/client";
import { TransactionSkeleton } from "./transaction-skeleton";
import { TransactionRow } from "./transaction-row";
import { TransactionFetchingAlert } from "./transaction-fetching-alert";
import { InboxIcon } from "lucide-react";
import { useCardTransactions } from "@/context/CardTransactionsContext";
import { Button } from "@/components/ui/button";
import { useMemo, useCallback } from "react";

export const CardTransactions = () => {
  const {
    cardTransactionsByDate,
    cardTransactionsLoading,
    cardTransactionsError,
    hasNextPage,
    isLoadingMoreCardTransactions,
    loadMoreCardTransactions,
    nextTransactionRangeTo,
  } = useCardTransactions();

  const handleLoadMore = useCallback(() => {
    loadMoreCardTransactions();
  }, [loadMoreCardTransactions]);

  const transactionsByDate = useMemo(() => cardTransactionsByDate, [cardTransactionsByDate]);

  const loadMoreButtonText = useMemo(() => {
    if (isLoadingMoreCardTransactions && nextTransactionRangeTo) {
      return `Loading last ${nextTransactionRangeTo} transactions...`;
    }

    if (isLoadingMoreCardTransactions) {
      return "Loading...";
    }

    return "Load More";
  }, [isLoadingMoreCardTransactions, nextTransactionRangeTo]);

  if (cardTransactionsLoading) {
    return <TransactionSkeleton />;
  }

  if (cardTransactionsError) {
    return <TransactionFetchingAlert />;
  }

  return (
    <>
      {Object.keys(transactionsByDate).length === 0 && (
        <div className="flex flex-col items-center justify-center py-8">
          <InboxIcon className="w-10 h-10 mb-2 text-secondary" />
          <div className="text-center text-secondary">No card transactions to display</div>
        </div>
      )}

      {Object.keys(transactionsByDate).map((date) => (
        <div key={date}>
          <div className="text-xs text-secondary mb-2 p-2">{date}</div>
          {(transactionsByDate as Record<string, Event[]>)[date].map((tx: Event) => {
            const id = `${tx.createdAt}${tx.merchant?.name || ""}${tx.kind}`;
            return <TransactionRow key={id} transaction={tx} />;
          })}
        </div>
      ))}

      {hasNextPage && (
        <div className="flex justify-center p-4">
          <Button
            variant="outline"
            onClick={handleLoadMore}
            disabled={isLoadingMoreCardTransactions}
            loading={isLoadingMoreCardTransactions}
            className="w-full"
          >
            {loadMoreButtonText}
          </Button>
        </div>
      )}
    </>
  );
};
