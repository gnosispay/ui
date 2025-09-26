import { TransactionSkeleton } from "./transaction-skeleton";
import { OnchainTransferRow } from "./onchain-transfer-row";
import { TransactionFetchingAlert } from "./transaction-fetching-alert";
import { InboxIcon } from "lucide-react";
import { useUser } from "@/context/UserContext";
import { useOnchainTransactions } from "@/context/OnchainTransactionsContext";
import { currencies } from "@/constants";
import type { Erc20TokenEvent } from "@/types/transaction";
import { Button } from "@/components/ui/button";
import { useMemo, useCallback } from "react";

export const OnchainTransactions = () => {
  const { safeConfig } = useUser();
  const {
    onchainTransactionsByDate,
    onchainTransactionsLoading,
    onchainTransactionsError,
    hasNextPage,
    isLoadingMoreOnchainTransactions,
    loadMoreOnchainTransactions,
  } = useOnchainTransactions();

  const handleLoadMore = useCallback(() => {
    loadMoreOnchainTransactions();
  }, [loadMoreOnchainTransactions]);

  const transactionsByDate = useMemo(() => onchainTransactionsByDate, [onchainTransactionsByDate]);
  const currency = useMemo(
    () => (safeConfig?.fiatSymbol ? currencies[safeConfig.fiatSymbol] : null),
    [safeConfig?.fiatSymbol],
  );

  // Show loading skeleton if transactions are loading or if safeConfig is missing
  if (onchainTransactionsLoading || !safeConfig) {
    return <TransactionSkeleton />;
  }

  if (onchainTransactionsError) {
    return <TransactionFetchingAlert />;
  }

  return (
    <>
      {Object.keys(transactionsByDate).length === 0 && (
        <div className="flex flex-col items-center justify-center py-8">
          <InboxIcon className="w-10 h-10 mb-2 text-secondary" />
          <div className="text-center text-secondary">No onchain transactions to display</div>
        </div>
      )}

      {Object.keys(transactionsByDate).map((date) => (
        <div key={date}>
          <div className="text-xs text-secondary mb-2 p-2">{date}</div>
          {currency &&
            (transactionsByDate as Record<string, Erc20TokenEvent[]>)[date].map((transfer: Erc20TokenEvent) => {
              return <OnchainTransferRow key={transfer.hash} transfer={transfer} currency={currency} />;
            })}
        </div>
      ))}

      {hasNextPage && (
        <div className="flex justify-center p-4">
          <Button
            variant="outline"
            onClick={handleLoadMore}
            disabled={isLoadingMoreOnchainTransactions}
            loading={isLoadingMoreOnchainTransactions}
            className="w-full"
          >
            {isLoadingMoreOnchainTransactions ? "Loading..." : "Load More"}
          </Button>
        </div>
      )}
    </>
  );
};
