import { useState, useCallback } from "react";
import { getIconForMcc } from "@/utils/mccUtils";
import { formatCurrency } from "@/utils/formatCurrency";
import type { Event } from "@/client";
import { format, parseISO } from "date-fns";
import { StatusHelpIcon } from "@/components/ui/status-help-icon";
import { useTransactionStatus } from "@/hooks/useTransactionStatus";
import { TransactionDetailsModal } from "@/components/modals/transaction-details/transaction-details-modal";

interface TransactionRowProps {
  transaction: Event;
}

export const TransactionRow = ({ transaction }: TransactionRowProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { isRefund, isReversal, isPending, otherTxStatus, sign } = useTransactionStatus(transaction);

  const handleClick = useCallback(() => {
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  const { kind, mcc, merchant, createdAt, billingAmount, billingCurrency, transactionAmount, transactionCurrency } =
    transaction;

  const isStrikethrough =
    kind === "Payment" &&
    transaction.status &&
    [
      "IncorrectPin",
      "InsufficientFunds",
      "InvalidAmount",
      "PinEntryTriesExceeded",
      "IncorrectSecurityCode",
      "Other",
    ].includes(transaction.status);

  const Icon = getIconForMcc(mcc);
  const merchantName = merchant?.name || "Unknown";
  const time = createdAt ? format(parseISO(createdAt), "HH:mm") : "unknown";
  const billAmount = formatCurrency(billingAmount, {
    decimals: billingCurrency?.decimals,
    fiatSymbol: billingCurrency?.symbol,
  });
  const txAmount = formatCurrency(transactionAmount, {
    decimals: transactionCurrency?.decimals,
    fiatSymbol: transactionCurrency?.symbol,
  });

  return (
    <>
      <button
        className="flex items-center justify-between py-3 cursor-pointer hover:bg-muted/50 rounded-lg transition-colors w-full text-left p-2"
        onClick={handleClick}
        type="button"
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-icon-background flex items-center justify-center">
            <Icon className="w-6 h-6 text-primary" aria-hidden="true" />
          </div>
          <div>
            <div className="text-lg text-foreground">{merchantName}</div>
            <div className="text-xs text-muted-foreground">
              {time}
              {isRefund && (
                <span className="inline-flex items-center ml-1">
                  {"• Refund"}
                  <StatusHelpIcon type="refund" />
                </span>
              )}
              {isReversal && (
                <span className="inline-flex items-center ml-1">
                  {"• Reversal"}
                  <StatusHelpIcon type="reversal" />
                </span>
              )}
              {isPending && (
                <span className="inline-flex items-center ml-1">
                  {"• Pending"}
                  <StatusHelpIcon type="pending" />
                </span>
              )}
              {otherTxStatus && <span> • {otherTxStatus}</span>}
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className={`text-lg text-foreground ${isStrikethrough ? "line-through" : ""}`}>
            {billAmount ? `${sign} ${billAmount}` : "-"}
          </div>
          {txAmount !== billAmount && <div className="text-xs text-muted-foreground mt-1">{`${sign} ${txAmount}`}</div>}
        </div>
      </button>

      <TransactionDetailsModal transaction={transaction} isOpen={isModalOpen} onClose={handleCloseModal} />
    </>
  );
};
