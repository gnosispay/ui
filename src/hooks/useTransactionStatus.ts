import { useMemo } from "react";
import type { Event } from "@/client";
import { fromPascalCase } from "@/utils/convertFromPascalCase";

/**
 * Custom hook for determining transaction status flags
 * @param transaction - The transaction event object
 * @returns Object containing various status flags and computed values
 */
export function useTransactionStatus(transaction: Event | null | undefined) {
  return useMemo(() => {
    if (!transaction) {
      return {
        isApproved: false,
        isRefund: false,
        isReversal: false,
        isPending: false,
        otherTxStatus: null,
        sign: "+",
      };
    }

    const isApproved = transaction.kind === "Payment" && transaction.status === "Approved";

    const isRefund =
      transaction.kind === "Refund" ||
      (transaction.kind === "Payment" &&
        transaction.status &&
        ["Reversal", "PartialReversal"].includes(transaction.status));

    const isReversal = transaction.kind === "Reversal";

    const isPending = Boolean(transaction.isPending);

    const otherTxStatus =
      !isApproved && !isRefund && !isReversal && transaction.kind === "Payment" && transaction.status
        ? fromPascalCase(transaction.status)
        : null;

    const sign = transaction.kind === "Payment" ? "-" : "+";

    return {
      isApproved,
      isRefund,
      isReversal,
      isPending,
      otherTxStatus,
      sign,
    };
  }, [transaction]);
}
