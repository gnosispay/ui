import { TransactionSkeleton } from "./transaction-skeleton";
import { TransactionRow } from "./transaction-row";
import { TransactionFetchingAlert } from "./transaction-fetching-alert";
import { InboxIcon } from "lucide-react";
import { DEFAULT_CARD_TRANSACTIONS_AMOUNT, useCardTransactions } from "@/context/CardTransactionsContext";
import { useMemo } from "react";

interface CardTransactionsProps {
  cardToken?: string;
}

export const CardTransactions = ({ cardToken }: CardTransactionsProps) => {
  const { cardTransactionsByTokenDate, cardTransactionsLoading, cardTransactionsError } = useCardTransactions();
  const transactions = useMemo(
    () => !!cardToken && cardTransactionsByTokenDate[cardToken],
    [cardTransactionsByTokenDate, cardToken],
  );

  console.log("transactions", transactions);

  if (!cardToken || cardTransactionsLoading) {
    return <TransactionSkeleton />;
  }

  if (cardTransactionsError) {
    return <TransactionFetchingAlert />;
  }

  return (
    <div className="flex flex-col gap-4 bg-card p-4 rounded-xl">
      {(!transactions || Object.keys(transactions).length === 0) && (
        <div className="flex flex-col items-center justify-center">
          <InboxIcon className="w-10 h-10 mb-2 text-secondary" />
          <div className="text-center text-secondary">
            No transactions for this card in the past {DEFAULT_CARD_TRANSACTIONS_AMOUNT} transactions
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
    </div>
  );
};
