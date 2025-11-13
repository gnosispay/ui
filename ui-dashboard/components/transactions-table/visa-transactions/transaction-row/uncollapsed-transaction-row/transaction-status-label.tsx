import { format as formatDate } from "date-fns";
import type { Event } from "@gnosispay/types";

interface TransactionStatusLabelProps {
  transaction: Event;
  isDeclined: boolean;
  isRefundOrReversal: boolean;
}

export const TransactionStatusLabel = ({
  transaction,
  isDeclined,
  isRefundOrReversal,
}: TransactionStatusLabelProps) => {
  const isTransactionCleared = transaction.clearedAt;
  const clearingDate = transaction.clearedAt
    ? formatDate(transaction.clearedAt, "MMM d")
    : undefined;

  interface TxStatusConfig {
    label: string;
    className: string;
    additionalText?: string;
  }
  const getTxStatusConfig = (): TxStatusConfig => {
    if (transaction.isPending) {
      return {
        label: "Pending",
        className: "text-warning",
        additionalText:
          "If not confirmed by the merchant, it will be reverted in 11 days",
      };
    }

    if (isDeclined) {
      return {
        label: "Declined",
        className: "text-secondary",
      };
    }

    if (isRefundOrReversal) {
      return {
        label: "Refund",
        className: "text-secondary",
      };
    }

    return {
      label: "Completed",
      className: "text-success",
    };
  };

  const { label, className, additionalText } = getTxStatusConfig();

  return (
    <>
      <span className={className}>{label}</span>

      {additionalText && ` • ${additionalText}`}

      {isTransactionCleared && ` • ${clearingDate}`}
    </>
  );
};
