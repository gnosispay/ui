import type { Event, IbanOrder } from "@/client";
import { type Transaction, TransactionType } from "@/types/transaction";

export function formatDate(dateString?: string) {
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

export function groupByDate(transactions: Transaction[]) {
  return transactions.reduce(
    (acc, tx) => {
      const date = formatDate(tx.createdAt);
      if (!acc[date]) acc[date] = [];
      acc[date].push(tx);
      return acc;
    },
    {} as Record<string, Transaction[]>,
  );
}

export function mergeAndSortTransactions(cardTransactions: Event[] = [], ibanOrders: IbanOrder[] = []): Transaction[] {
  const cardTransactionsMapped = cardTransactions.map((tx) => ({
    id: `${tx.createdAt}${tx.merchant?.name || ""}`,
    createdAt: tx.createdAt || "",
    type: TransactionType.CARD,
    data: tx,
  }));

  const ibanOrdersMapped = ibanOrders.map((order) => ({
    id: order.id,
    createdAt: order.meta.placedAt,
    type: TransactionType.IBAN,
    data: order,
  }));

  return [...cardTransactionsMapped, ...ibanOrdersMapped].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}
