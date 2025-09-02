import type { Event, IbanOrder } from "@/client";
import { TransactionSkeleton } from "./transaction-skeleton";
import { TransactionRow } from "./transaction-row";
import { OnchainTransferRow } from "./onchain-transfer-row";
import { BankTransferRow } from "./bank-transfer-row";
import { TransactionFetchingAlert } from "./transaction-fetching-alert";
import { InboxIcon } from "lucide-react";
import { useUser } from "@/context/UserContext";
import { useCardTransactions } from "@/context/CardTransactionsContext";
import { useOnchainTransactions } from "@/context/OnchainTransactionsContext";
import { useIbanTransactions } from "@/context/IbanTransactionsContext";
import { currencies } from "@/constants";
import type { Erc20TokenEvent } from "@/types/transaction";
import { useState, useCallback, useMemo } from "react";
import { TransactionTabs, TransactionTab } from "@/components/ui/transaction-tabs";
import { Button } from "@/components/ui/button";

enum TransactionType {
  CARD = "card",
  ONCHAIN = "onchain",
  IBAN = "iban",
}

export const Transactions = () => {
  const { safeConfig } = useUser();
  const {
    cardTransactionsByDate,
    cardTransactionsLoading,
    cardTransactionsError,
    hasNextPage: cardHasNextPage,
    isLoadingMoreCardTransactions,
    loadMoreCardTransactions,
  } = useCardTransactions();
  const {
    onchainTransactionsByDate,
    onchainTransactionsLoading,
    onchainTransactionsError,
    hasNextPage: onchainHasNextPage,
    isLoadingMoreOnchainTransactions,
    loadMoreOnchainTransactions,
  } = useOnchainTransactions();
  const { ibanTransactionsByDate, ibanTransactionsLoading, ibanTransactionsError } = useIbanTransactions();

  const [selectedType, setSelectedType] = useState<TransactionType>(TransactionType.CARD);

  const handleTabChange = useCallback((value: string) => {
    setSelectedType(value as TransactionType);
  }, []);

  const isLoading = useMemo(
    () =>
      selectedType === TransactionType.CARD
        ? cardTransactionsLoading
        : selectedType === TransactionType.ONCHAIN
          ? onchainTransactionsLoading
          : ibanTransactionsLoading,
    [selectedType, cardTransactionsLoading, onchainTransactionsLoading, ibanTransactionsLoading],
  );

  const error = useMemo(
    () =>
      selectedType === TransactionType.CARD
        ? cardTransactionsError
        : selectedType === TransactionType.ONCHAIN
          ? onchainTransactionsError
          : ibanTransactionsError,
    [selectedType, cardTransactionsError, onchainTransactionsError, ibanTransactionsError],
  );

  const transactionsByDate = useMemo(
    () =>
      selectedType === TransactionType.CARD
        ? cardTransactionsByDate
        : selectedType === TransactionType.ONCHAIN
          ? onchainTransactionsByDate
          : ibanTransactionsByDate,
    [selectedType, cardTransactionsByDate, onchainTransactionsByDate, ibanTransactionsByDate],
  );

  const hasNextPage = useMemo(
    () =>
      selectedType === TransactionType.CARD
        ? cardHasNextPage
        : selectedType === TransactionType.ONCHAIN
          ? onchainHasNextPage
          : false,
    [selectedType, cardHasNextPage, onchainHasNextPage],
  );

  const loadingMore = useMemo(
    () =>
      selectedType === TransactionType.CARD
        ? isLoadingMoreCardTransactions
        : selectedType === TransactionType.ONCHAIN
          ? isLoadingMoreOnchainTransactions
          : false,
    [selectedType, isLoadingMoreCardTransactions, isLoadingMoreOnchainTransactions],
  );

  const handleLoadMore = useCallback(() => {
    if (selectedType === TransactionType.CARD) {
      loadMoreCardTransactions();
    }
    if (selectedType === TransactionType.ONCHAIN) {
      loadMoreOnchainTransactions();
    }
  }, [selectedType, loadMoreCardTransactions, loadMoreOnchainTransactions]);

  if (!safeConfig || isLoading) {
    return <TransactionSkeleton />;
  }

  if (error) {
    return <TransactionFetchingAlert />;
  }

  const currency = safeConfig.fiatSymbol ? currencies[safeConfig.fiatSymbol] : null;

  return (
    <div className="flex flex-col gap-4 mb-4">
      {/* Transactions Content */}
      <div className="bg-card rounded-xl">
        {/* Transaction Tabs */}
        <TransactionTabs value={selectedType} onValueChange={handleTabChange}>
          <TransactionTab value={TransactionType.CARD}>Card</TransactionTab>
          <TransactionTab value={TransactionType.ONCHAIN}>On-chain</TransactionTab>
          <TransactionTab value={TransactionType.IBAN}>IBAN</TransactionTab>
        </TransactionTabs>
        <div className="p-2">
          {Object.keys(transactionsByDate).length === 0 && (
            <div className="flex flex-col items-center justify-center py-8">
              <InboxIcon className="w-10 h-10 mb-2 text-secondary" />
              <div className="text-center text-secondary">
                {selectedType === TransactionType.CARD && "No card transactions to display"}
                {selectedType === TransactionType.ONCHAIN && "No onchain transactions to display"}
                {selectedType === TransactionType.IBAN && "No IBAN transactions to display"}
              </div>
            </div>
          )}

          {Object.keys(transactionsByDate).map((date) => (
            <div key={date}>
              <div className="text-xs text-secondary mb-2 p-2">{date}</div>

              {selectedType === TransactionType.CARD &&
                (transactionsByDate as Record<string, Event[]>)[date].map((tx: Event) => {
                  const id = `${tx.createdAt}${tx.merchant?.name || ""}${tx.kind}`;
                  return <TransactionRow key={id} transaction={tx} />;
                })}

              {selectedType === TransactionType.ONCHAIN &&
                currency &&
                (transactionsByDate as Record<string, Erc20TokenEvent[]>)[date].map((transfer: Erc20TokenEvent) => {
                  return <OnchainTransferRow key={transfer.hash} transfer={transfer} currency={currency} />;
                })}

              {selectedType === TransactionType.IBAN &&
                (transactionsByDate as Record<string, IbanOrder[]>)[date].map((ibanOrder: IbanOrder) => {
                  return <BankTransferRow key={ibanOrder.id} ibanOrder={ibanOrder} />;
                })}
            </div>
          ))}

          {hasNextPage && (
            <div className="flex justify-center p-4">
              <Button
                variant="outline"
                onClick={handleLoadMore}
                disabled={loadingMore}
                loading={loadingMore}
                className="w-full"
              >
                {loadingMore ? "Loading..." : "Load More"}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
