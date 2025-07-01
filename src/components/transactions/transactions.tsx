import type { Event, IbanOrder } from "@/client";
import { TransactionSkeleton } from "./transaction-skeleton";
import { TransactionRow } from "./transaction-row";
import { BankTransferRow } from "./bank-transfer-row";
import { type Transaction, TransactionType } from "@/types/transaction";
import { TransactionFetchingAlert } from "./transaction-fetching-alert";
import { useTransactions } from "@/hooks/useTransactions";
import { subDays } from "date-fns";
import { InboxIcon } from "lucide-react";

/**
 * We are currently hardcoding the `fromDate` to 7 days ago.
 *
 * This value will come from the date picker when that logic is implemented.
 */
const fromDate = subDays(new Date(), 7);

export const Transactions = () => {
  const { transactions, dateGroupedTransactions, orderedTransactions, isLoading, isError } = useTransactions({
    fromDate,
  });

  if (isLoading || !transactions) {
    return <TransactionSkeleton />;
  }

  if (isError) {
    return <TransactionFetchingAlert />;
  }

  return (
    <>
      <h1 className="font-bold text-secondary my-4">Transactions</h1>
      <div className="flex flex-col gap-4 bg-card p-4 rounded-xl">
        {transactions.length === 0 && (
          <div className="flex flex-col items-center justify-center">
            <InboxIcon className="w-10 h-10 mb-2 text-muted-foreground" />
            <div className="text-center">No transactions yet</div>
          </div>
        )}
        {orderedTransactions.map((date) => (
          <div key={date}>
            <div className="text-xs text-secondary mb-2">{date}</div>

            {dateGroupedTransactions[date].map((transaction: Transaction) => {
              if (transaction.type === TransactionType.CARD) {
                return <TransactionRow key={transaction.id} transaction={transaction.data as Event} />;
              }

              if (transaction.type === TransactionType.IBAN) {
                return <BankTransferRow key={transaction.id} ibanOrder={transaction.data as IbanOrder} />;
              }
            })}
          </div>
        ))}
      </div>
    </>
  );
};
