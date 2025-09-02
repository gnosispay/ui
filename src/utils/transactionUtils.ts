import type { Event, Currency, IbanOrder } from "@/client";
import type { Erc20TokenEvent } from "@/types/transaction";

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

export function groupByDate<E extends Event | Erc20TokenEvent | IbanOrder>(transactions: E[]) {
  return transactions.reduce(
    (acc, tx) => {
      const date =
        "createdAt" in tx
          ? formatDate(tx.createdAt)
          : "date" in tx
            ? formatDate(tx.date.toISOString())
            : "meta" in tx
              ? formatDate(tx.meta.placedAt)
              : "";
      if (!acc[date]) acc[date] = [];
      acc[date].push(tx);
      return acc;
    },
    {} as Record<string, E[]>,
  );
}

export const groupByCardToken = (transactions: Event[]) => {
  return transactions.reduce(
    (acc, tx) => {
      if (!tx.cardToken) {
        return acc;
      }

      if (!acc[tx.cardToken]) {
        acc[tx.cardToken] = [];
      }
      acc[tx.cardToken].push(tx);
      return acc;
    },
    {} as Record<string, Event[]>,
  );
};

/**
 * Calculates the exchange rate between two currencies
 * @param billingAmount - The amount in billing currency (raw value)
 * @param billingCurrency - The billing currency object
 * @param transactionAmount - The amount in transaction currency (raw value)
 * @param transactionCurrency - The transaction currency object
 * @returns Exchange rate string or null if calculation is not possible/needed
 */
export function calculateExchangeRate(
  billingAmount: string | number | null | undefined,
  billingCurrency: Currency | null | undefined,
  transactionAmount: string | number | null | undefined,
  transactionCurrency: Currency | null | undefined,
): string | null {
  if (!billingAmount || !transactionAmount || !billingCurrency || !transactionCurrency) {
    return null;
  }

  if (billingCurrency.symbol === transactionCurrency.symbol) {
    return null; // Same currency, no exchange rate needed
  }

  try {
    const billingValue = Number(billingAmount) / 10 ** (billingCurrency.decimals || 0);
    const transactionValue = Number(transactionAmount) / 10 ** (transactionCurrency.decimals || 0);

    if (transactionValue === 0) return null;

    const rate = billingValue / transactionValue;
    return `1 ${transactionCurrency.symbol} = ${rate.toFixed(2)} ${billingCurrency.symbol}`;
  } catch {
    return null;
  }
}

/**
 * Gets the appropriate amount and currency for refund/reversal transactions
 * @param transaction - The transaction event object
 * @returns Object containing amount and currency, or null if not available
 */
export function getAmountAndCurrency(
  transaction: Event,
): { amount: string | number | null; currency: Currency | null } | null {
  if (!transaction) return null;

  if ("refundAmount" in transaction && transaction.refundAmount !== undefined) {
    return {
      amount: transaction.refundAmount,
      currency: transaction.refundCurrency || null,
    };
  }

  if ("reversalAmount" in transaction && transaction.reversalAmount !== undefined) {
    return {
      amount: transaction.reversalAmount,
      currency: transaction.reversalCurrency || null,
    };
  }

  if ("transactionAmount" in transaction && transaction.transactionAmount !== undefined) {
    return {
      amount: transaction.transactionAmount,
      currency: transaction.transactionCurrency || null,
    };
  }

  return null;
}
