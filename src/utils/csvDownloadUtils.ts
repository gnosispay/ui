import type { Event, Payment } from "@/client";
import { formatCurrency } from "@/utils/formatCurrency";

// Date range types and enums
export type DateRange = {
  after: string;
  before: string;
};

export enum DateRangeOptions {
  LAST_7 = "7",
  LAST_30 = "30",
  LAST_90 = "90",
  LAST_YEAR = "365",
  LAST_2_YEARS = "730",
}

export const DATE_RANGE_OPTIONS = [
  { value: DateRangeOptions.LAST_7, label: "Last 7 days" },
  { value: DateRangeOptions.LAST_30, label: "Last 30 days" },
  { value: DateRangeOptions.LAST_90, label: "Last 90 days" },
  { value: DateRangeOptions.LAST_YEAR, label: "Last 1 year" },
  { value: DateRangeOptions.LAST_2_YEARS, label: "Last 2 years" },
];

// CSV column headers for card transactions
export const CSV_HEADERS = [
  "date",
  "merchant_name",
  "transaction_amount_formatted",
  "transaction_currency_symbol",
  "billing_amount_formatted",
  "billing_currency_symbol",
  "transaction_type_description",
  "status",
  "card_last_four",
  "mcc_code",
  "kind",
];

/**
 * Calculate date range from current date
 */
export const getDateRange = (days: number): DateRange => {
  const now = new Date();
  const after = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  return {
    after: after.toISOString(),
    before: now.toISOString(),
  };
};

/**
 * Convert transaction type codes to human-readable text
 * Based on ISO 8583 DE3 field transaction type codes
 */
export const getTransactionTypeText = (transactionType?: string): string => {
  if (!transactionType) return "";

  const typeMap: Record<string, string> = {
    "00": "Purchase (POS)",
    "01": "Withdrawal (ATM)",
    "10": "Account Funding",
    "20": "Return of Goods",
    "28": "Prepaid Load",
    "30": "Balance Inquiry",
    "70": "PIN Change",
    "72": "PIN Unblock",
  };

  return typeMap[transactionType] || `Transaction Type ${transactionType}`;
};

/**
 * Get transaction status based on transaction type and properties
 */
export const getTransactionStatus = (transaction: Event): string => {
  if (transaction.kind === "Payment") {
    return (transaction as Payment).status || "";
  }
  return transaction.kind || "";
};

/**
 * Convert array of transactions to CSV format
 */
export const convertTransactionsToCSV = (
  transactions: Event[],
  availableCards: Array<{ id: string; cardToken?: string; lastFourDigits: string }>,
): string => {
  if (transactions.length === 0) {
    return "";
  }

  // Create headers string
  const headers = `${CSV_HEADERS.join(",")}\n`;

  // Map transactions to CSV rows
  const rows = transactions
    .map((tx) => {
      // Format amounts using the same utility as transaction-row
      const formattedBillingAmount = formatCurrency(tx.billingAmount, {
        decimals: tx.billingCurrency?.decimals,
        fiatSymbol: tx.billingCurrency?.symbol,
      });

      const formattedTransactionAmount = formatCurrency(tx.transactionAmount, {
        decimals: tx.transactionCurrency?.decimals,
        fiatSymbol: tx.transactionCurrency?.symbol,
      });

      const row = [
        tx.createdAt || "",
        tx.merchant?.name || "",
        formattedTransactionAmount || "",
        tx.transactionCurrency?.symbol || "",
        formattedBillingAmount || "",
        tx.billingCurrency?.symbol || "",
        getTransactionTypeText(tx.transactionType),
        getTransactionStatus(tx),
        tx.cardToken ? availableCards.find((c) => c.cardToken === tx.cardToken)?.lastFourDigits || "" : "",
        tx.mcc || "",
        tx.kind || "",
      ];

      // Escape commas and quotes in CSV data
      return row
        .map((field) => {
          const stringField = String(field);
          if (stringField.includes(",") || stringField.includes('"') || stringField.includes("\n")) {
            return `"${stringField.replace(/"/g, '""')}"`;
          }
          return stringField;
        })
        .join(",");
    })
    .join("\n");

  return headers + rows;
};

/**
 * Download CSV file to user's device
 */
export const downloadCSV = (csvData: string, filename: string): void => {
  if (csvData === "") {
    throw new Error("No data to export");
  }

  const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Generate filename for CSV export
 */
export const generateCSVFilename = (
  selectedCardTokens: string[],
  availableCards: Array<{ id: string; cardToken?: string; lastFourDigits: string }>,
  dateRange: DateRangeOptions,
): string => {
  const cardIdentifier =
    selectedCardTokens.length === 1
      ? availableCards.find((card) => card.cardToken === selectedCardTokens[0])?.lastFourDigits || "card"
      : `${selectedCardTokens.length}cards`;

  const dateStr = new Date().toISOString().split("T")[0];
  return `card-transactions-${cardIdentifier}-${dateRange}days-${dateStr}.csv`;
};

/**
 * Validate CSV download parameters
 */
export const validateCSVDownloadParams = (
  selectedCardTokens: string[],
  selectedDateRange: DateRangeOptions | null,
): { isValid: boolean; error?: string } => {
  if (selectedCardTokens.length === 0) {
    return { isValid: false, error: "Please select at least one card" };
  }

  if (!selectedDateRange) {
    return { isValid: false, error: "Please select a date range" };
  }

  return { isValid: true };
};
