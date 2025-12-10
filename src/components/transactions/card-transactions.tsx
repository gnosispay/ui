import { TransactionSkeleton } from "./transaction-skeleton";
import { TransactionRow } from "./transaction-row";
import { TransactionFetchingAlert } from "./transaction-fetching-alert";
import { InboxIcon } from "lucide-react";
import { useCardTransactions } from "@/context/CardTransactionsContext";
import { useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";

interface CardTransactionsProps {
  cardToken?: string;
}

export const CardTransactions = ({ cardToken }: CardTransactionsProps) => {
  const {
    cardTransactionsByTokenDate,
    cardTransactionsLoading,
    cardTransactionsError,
    hasNextPage,
    isLoadingMoreCardTransactions,
    loadMoreCardTransactions,
    transactionCount,
    nextTransactionRangeTo,
  } = useCardTransactions();

  const transactions = useMemo(
    () => !!cardToken && cardTransactionsByTokenDate[cardToken],
    [cardTransactionsByTokenDate, cardToken],
  );

  const handleLoadMore = useCallback(() => {
    loadMoreCardTransactions();
  }, [loadMoreCardTransactions]);

  const loadMoreButtonText = useMemo(() => {
    if (isLoadingMoreCardTransactions && nextTransactionRangeTo) {
      return `Loading last ${nextTransactionRangeTo} transactions...`;
    }

    if (isLoadingMoreCardTransactions) {
      return "Loading...";
    }

    return "Load More";
  }, [isLoadingMoreCardTransactions, nextTransactionRangeTo]);

  if (!cardToken || cardTransactionsLoading) {
    return <TransactionSkeleton />;
  }

  if (cardTransactionsError) {
    return <TransactionFetchingAlert />;
  }

  return (
    <div className="flex flex-col gap-4 bg-card p-4 rounded-lg mb-4" data-testid="card-transactions-component">
      {(!transactions || Object.keys(transactions).length === 0) && (
        <div className="flex flex-col items-center justify-center">
          <InboxIcon className="w-10 h-10 mb-2 text-secondary" data-testid="empty-transactions-icon" />
          <div className="text-center text-secondary" data-testid="empty-transactions-message">
            No transactions for this card in the past {transactionCount} transactions
          </div>
        </div>
      )}
      {!!transactions &&
        Object.keys(transactions).map((date) => (
          <div key={date}>
            <div className="text-xs text-secondary mb-2">{date}</div>

            {transactions[date].map((tx) => {
              const id = `${tx.createdAt}${tx.merchant?.name || ""}${tx.kind}`;
              return <TransactionRow key={id} transaction={tx} />;
            })}
          </div>
        ))}

      {hasNextPage && (
        <div className="flex justify-center pt-4">
          <Button
            variant="outline"
            onClick={handleLoadMore}
            disabled={isLoadingMoreCardTransactions}
            loading={isLoadingMoreCardTransactions}
            className="w-full"
            data-testid="load-more-button"
          >
            {loadMoreButtonText}
          </Button>
        </div>
      )}
    </div>
  );
};
