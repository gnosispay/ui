import { useState, useCallback } from "react";
import type { Event, IbanOrder } from "@/client";
import { TransactionSkeleton } from "./transaction-skeleton";
import { TransactionRow } from "./transaction-row";
import { BankTransferRow } from "./bank-transfer-row";
import { TransactionDetailsModal } from "./transaction-details-modal";
import { type Transaction, TransactionType } from "@/types/transaction";
import { TransactionFetchingAlert } from "./transaction-fetching-alert";
import { InboxIcon } from "lucide-react";
import { OnchainTransferRow } from "./onchain-transfer-row";
import type { Erc20TokenEvent } from "@/types/transaction";
import { useUser } from "@/context/UserContext";
import { currencies } from "@/constants";
import { useFilteredTransactions } from "@/hooks/useFilteredTransactions";

interface TransactionsProps {
  history?: number;
  withIban?: boolean;
  withOnchain?: boolean;
}

export const Transactions = ({ history = 7, withIban = true, withOnchain = true }: TransactionsProps) => {
  const { safeConfig } = useUser();
  const [selectedTransaction, setSelectedTransaction] = useState<Event | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const {
    isLoading,
    isError,
    filteredTransactions: transactions,
  } = useFilteredTransactions({
    withIban,
    history,
    withOnchain,
  });

  const handleTransactionClick = useCallback((transaction: Event) => {
    setSelectedTransaction(transaction);
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedTransaction(null);
  }, []);

  if (!safeConfig || isLoading || !transactions) {
    return <TransactionSkeleton />;
  }

  if (isError) {
    return <TransactionFetchingAlert />;
  }

  return (
    <div className="flex flex-col gap-4 bg-card p-4 rounded-xl">
      {Object.keys(transactions).length === 0 && (
        <div className="flex flex-col items-center justify-center">
          <InboxIcon className="w-10 h-10 mb-2 text-secondary" />
          <div className="text-center text-secondary">No transactions in the past {history} days</div>
        </div>
      )}
      {Object.keys(transactions).map((date) => (
        <div key={date}>
          <div className="text-xs text-secondary mb-2">{date}</div>

          {transactions[date].map((transaction: Transaction) => {
            if (transaction.type === TransactionType.CARD) {
              return (
                <TransactionRow
                  key={transaction.id}
                  transaction={transaction.data as Event}
                  onClick={() => handleTransactionClick(transaction.data as Event)}
                />
              );
            }

            if (transaction.type === TransactionType.IBAN) {
              return <BankTransferRow key={transaction.id} ibanOrder={transaction.data as IbanOrder} />;
            }

            if (transaction.type === TransactionType.ONCHAIN && !!safeConfig.fiatSymbol) {
              return (
                <OnchainTransferRow
                  key={transaction.id}
                  transfer={transaction.data as Erc20TokenEvent}
                  currency={currencies[safeConfig.fiatSymbol]}
                />
              );
            }

            return null;
          })}
        </div>
      ))}

      <TransactionDetailsModal transaction={selectedTransaction} isOpen={isModalOpen} onClose={handleCloseModal} />
    </div>
  );
};
