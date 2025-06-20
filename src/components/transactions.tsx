import type { Event, Payment } from "@/client";
import { useCards } from "@/context/CardsContext";
import { useUser } from "@/context/UserContext";
import { useEffect, useMemo, useState } from "react";
import { getIconForMcc } from "@/utils/mccUtils";
import { formatCurrency } from "@/utils/formatCurrency";
import { currencies } from "../constants";
import { Skeleton } from "./ui/skeleton";
import { fromPascalCase } from "@/utils/convertFromPascalCase";

function formatDate(dateString?: string) {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date
    .toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "2-digit",
    })
    .toUpperCase();
}

function groupByDate(transactions: Event[]) {
  return transactions.reduce(
    (acc, tx) => {
      const date = formatDate(tx.createdAt);
      if (!acc[date]) acc[date] = [];
      acc[date].push(tx);
      return acc;
    },
    {} as Record<string, Event[]>,
  );
}

export const Transactions = () => {
  const { getTransactions } = useCards();
  const [transactions, setTransactions] = useState<Event[] | undefined>(undefined);

  useEffect(() => {
    // 7 days ago
    const fromDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    getTransactions({ fromDate })
      .then((t) => {
        setTransactions(t);
      })
      .catch((e) => {
        console.error("Error getting transactions: ", e);
      });
  }, [getTransactions]);

  // Sort by date descending
  const sorted = [...(transactions || [])].sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
  const grouped = groupByDate(sorted);
  const dateOrder = Object.keys(grouped).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  if (!transactions || transactions.length === 0) {
    return (
      <div className="flex flex-col gap-4 bg-card p-4 rounded-xl">
        {[1, 2].map((numb) => (
          <div key={`loader-date-${numb}`} className="text-xs text-secondary mb-2">
            <Skeleton className="h-4 w-20 rounded-lg" />
            {[1, 2, 3].map((numb) => (
              <div key={`loader-card-${numb}`} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-icon-card-bg flex items-center justify-center">
                    <Skeleton className="w-6 h-6 rounded-full" />
                  </div>
                  <div>
                    <div className="text-xl text-primary">
                      <Skeleton className="h-6 w-32 rounded-lg mb-2" />
                    </div>
                    <div className="text-xs text-secondary">
                      <Skeleton className="h-4 w-16 rounded-lg" />
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xl text-primary">
                    <Skeleton className="h-6 w-22 rounded-lg" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  }

  return (
    <>
      <h1 className="font-bold text-secondary my-4">Transactions</h1>
      <div className="flex flex-col gap-4 bg-card p-4 rounded-xl">
        {dateOrder.map((date) => (
          <div key={date}>
            <div className="text-xs text-secondary mb-2">{date}</div>
            {grouped[date].map((transaction, idx) => {
              const approved = transaction.kind === "Payment" && transaction.status === "Approved";
              const refundOrReversal = transaction.kind === "Refund" || transaction.kind === "Reversal";
              const pending = transaction.isPending;
              const sign = transaction.kind === "Payment" ? "-" : "+";
              const Icon = getIconForMcc(transaction.mcc);
              const merchant = transaction.merchant?.name || "Unknown";
              const time = transaction.createdAt
                ? new Date(transaction.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                : "";
              const amount = formatCurrency(transaction.billingAmount, {
                decimals: transaction.billingCurrency?.decimals,
                fiatSymbol: transaction.billingCurrency?.symbol,
              });
              const fxAmount =
                transaction.billingCurrency?.name !== transaction.transactionCurrency?.name
                  ? formatCurrency(transaction.transactionAmount, {
                      decimals: transaction.transactionCurrency?.decimals,
                      fiatSymbol: transaction.transactionCurrency?.symbol,
                    })
                  : "";
              const rowKey =
                (transaction.createdAt ? transaction.createdAt : "") + (transaction.merchant?.name || "") + idx;
              return (
                <div key={rowKey} className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-icon-card-bg flex items-center justify-center">
                      <Icon className="w-6 h-6 text-icon-card" aria-hidden="true" />
                    </div>
                    <div>
                      <div className="text-xl text-primary">{merchant}</div>
                      <div className="text-xs text-secondary">
                        {time}
                        {!approved && <span> • {fromPascalCase((transaction as Payment).status)}</span>}
                        {refundOrReversal && <span> • Refund</span>}
                        {pending && <span> • Pending</span>}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-xl text-primary ${!approved && "line-through"}`}>
                      {amount ? `${sign} ${amount}` : "-"}
                    </div>
                    {fxAmount && <div className="text-xs text-secondary mt-1">{`${sign} ${fxAmount}`}</div>}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </>
  );
};
