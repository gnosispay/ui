import type { Event, IbanOrder } from "@/client";
import type { Erc20TokenEvent } from "@/types/transaction";
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
  return transactions.reduce((acc, tx) => {
    const date = formatDate(tx.createdAt);
    if (!acc[date]) acc[date] = [];
    acc[date].push(tx);
    return acc;
  }, {} as Record<string, Transaction[]>);
}

export function mergeAndSortTransactions(
  cardTransactions: Event[] = [],
  ibanOrders: IbanOrder[] = [],
  onchainSafeTransfers: Erc20TokenEvent[] = []
): Transaction[] {
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

  const onchainSafeTransfersMapped = onchainSafeTransfers.map((tx) => ({
    id: tx.hash,
    createdAt: tx.date.toISOString(),
    type: TransactionType.ONCHAIN,
    data: tx,
  }));

  return [
    ...cardTransactionsMapped,
    ...ibanOrdersMapped,
    ...onchainSafeTransfersMapped,
  ].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}
