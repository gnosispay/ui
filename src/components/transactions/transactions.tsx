import type { Event } from "@/client";
import { useCards } from "@/context/CardsContext";
import { useEffect, useState } from "react";
import { TransactionSkeleton } from "./transaction-skeleton";
import { TransactionRow } from "./transaction-row";
import { groupByDate } from "@/utils/transactionUtils";
import { TransactionFetchingAlert } from "./transaction-fetching-alert";

export const Transactions = () => {
  const { getTransactions } = useCards();
  const [transactions, setTransactions] = useState<Event[] | undefined>(undefined);
  const [isTransactionFetchError, setIsTransactionFetchError] = useState(false);

  useEffect(() => {
    // 7 days ago
    const fromDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    getTransactions({ fromDate })
      .then((t) => {
        setTransactions(t);
      })
      .catch((e) => {
        setIsTransactionFetchError(true);
        console.error("Error getting transactions: ", e);
      });
  }, [getTransactions]);

  // Sort by date descending
  const sorted = [...(transactions || [])].sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
  const grouped = groupByDate(sorted);
  const dateOrder = Object.keys(grouped).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  if (isTransactionFetchError) {
    return <TransactionFetchingAlert />;
  }

  if (!transactions || transactions.length === 0) {
    return <TransactionSkeleton />;
  }

  return (
    <>
      <h1 className="font-bold text-secondary my-4">Transactions</h1>
      <div className="flex flex-col gap-4 bg-card p-4 rounded-xl">
        {dateOrder.map((date) => (
          <div key={date}>
            <div className="text-xs text-secondary mb-2">{date}</div>
            {(grouped[date] as Event[]).map((transaction: Event) => (
              <TransactionRow
                key={transaction.createdAt + (transaction.merchant?.name || "")}
                transaction={transaction}
              />
            ))}
          </div>
        ))}
      </div>
    </>
  );
};
