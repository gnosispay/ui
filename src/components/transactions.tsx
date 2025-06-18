import type { BasePaymentish } from "@/client";
import { useCards } from "@/context/CardsContext";
import { useEffect, useState } from "react";

export const Transactions = () => {
  const { getTransactions } = useCards();
  const [transactions, setTransactions] = useState<BasePaymentish[] | undefined>(undefined);

  useEffect(() => {
    getTransactions(undefined)
      .then((t) => {
        setTransactions(t);
      })
      .catch((e) => {
        console.error("Error getting transactions: ", e);
      });
  }, [getTransactions]);

  if (!transactions) return null;

  console.log(transactions);

  return (
    <div className="flex flex-col gap-4">
      {transactions.map((transaction) => (
        <div key={transaction.createdAt}>{transaction.createdAt}</div>
      ))}
    </div>
  );
};
