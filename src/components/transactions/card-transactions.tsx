import type { Event } from "@/client";
import { TransactionSkeleton } from "./transaction-skeleton";
import { TransactionRow } from "./transaction-row";
import { type Transaction, TransactionType } from "@/types/transaction";
import { TransactionFetchingAlert } from "./transaction-fetching-alert";
import { InboxIcon } from "lucide-react";
import { DEFAULT_CARD_TRANSACTIONS_HISTORY } from "@/context/TransactionsByCardContext";
import { useMemo } from "react";
import { useTransactionsByCard } from "@/context/TransactionsByCardContext";

interface CardTransactionsProps {
  cardToken?: string;
}

export const CardTransactions = ({ cardToken }: CardTransactionsProps) => {
  const { transactionsByCard, transactionsByCardLoading, transactionsByCardError } = useTransactionsByCard();
  const transactions = useMemo(() => !!cardToken && transactionsByCard[cardToken], [transactionsByCard, cardToken]);

  if (!cardToken || transactionsByCardLoading || !transactions) {
    return <TransactionSkeleton />;
  }

  if (transactionsByCardError) {
    return <TransactionFetchingAlert />;
  }

  return (
    <div className="flex flex-col gap-4 bg-card p-4 rounded-xl">
      {Object.keys(transactions).length === 0 && (
        <div className="flex flex-col items-center justify-center">
          <InboxIcon className="w-10 h-10 mb-2 text-secondary" />
          <div className="text-center text-secondary">
            No transactions for this card in the past {DEFAULT_CARD_TRANSACTIONS_HISTORY} days
          </div>
        </div>
      )}
      {Object.keys(transactions).map((date) => (
        <div key={date}>
          <div className="text-xs text-secondary mb-2">{date}</div>

          {transactions[date].map((transaction: Transaction) => {
            if (transaction.type === TransactionType.CARD) {
              return <TransactionRow key={transaction.id} transaction={transaction.data as Event} />;
            }

            return null;
          })}
        </div>
      ))}
    </div>
  );
};
