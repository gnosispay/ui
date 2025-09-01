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
import { Toggle } from "@/components/ui/toggle";

enum TransactionType {
  CARD = "card",
  ONCHAIN = "onchain",
  IBAN = "iban",
}

export const Transactions = () => {
  const { safeConfig } = useUser();
  const { cardTransactionsByDate, cardTransactionsLoading, cardTransactionsError } = useCardTransactions();
  const { onchainTransactionsByDate, onchainTransactionsLoading, onchainTransactionsError } = useOnchainTransactions();
  const { ibanTransactionsByDate, ibanTransactionsLoading, ibanTransactionsError } = useIbanTransactions();

  const [selectedType, setSelectedType] = useState<TransactionType>(TransactionType.CARD);

  const handleCardTransactions = useCallback((pressed: boolean) => {
    if (pressed) {
      setSelectedType(TransactionType.CARD);
    }
  }, []);

  const handleOnchainTransactions = useCallback((pressed: boolean) => {
    if (pressed) {
      setSelectedType(TransactionType.ONCHAIN);
    }
  }, []);

  const handleIbanTransactions = useCallback((pressed: boolean) => {
    if (pressed) {
      setSelectedType(TransactionType.IBAN);
    }
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

  if (!safeConfig || isLoading) {
    return <TransactionSkeleton />;
  }

  if (error) {
    return <TransactionFetchingAlert />;
  }

  const currency = safeConfig.fiatSymbol ? currencies[safeConfig.fiatSymbol] : null;

  return (
    <div className="flex flex-col gap-4">
      {/* Toggle Buttons */}
      <div className="flex gap-2 p-1 bg-muted rounded-lg">
        <Toggle
          pressed={selectedType === TransactionType.CARD}
          onPressedChange={handleCardTransactions}
          className="flex-1"
          size="sm"
        >
          Card
        </Toggle>
        <Toggle
          pressed={selectedType === TransactionType.ONCHAIN}
          onPressedChange={handleOnchainTransactions}
          className="flex-1"
          size="sm"
        >
          Onchain
        </Toggle>
        <Toggle
          pressed={selectedType === TransactionType.IBAN}
          onPressedChange={handleIbanTransactions}
          className="flex-1"
          size="sm"
        >
          IBAN
        </Toggle>
      </div>

      {/* Transactions Content */}
      <div className="bg-card rounded-xl p-2">
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
      </div>
    </div>
  );
};
