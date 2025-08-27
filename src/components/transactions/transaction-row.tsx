import { getIconForMcc } from "@/utils/mccUtils";
import { formatCurrency } from "@/utils/formatCurrency";
import { fromPascalCase } from "@/utils/convertFromPascalCase";
import type { Event } from "@/client";
import { format, parseISO } from "date-fns";
import { StatusHelpIcon } from "@/components/ui/status-help-icon";

interface TransactionRowProps {
  transaction: Event;
  onClick?: () => void;
}

export const TransactionRow = ({ transaction, onClick }: TransactionRowProps) => {
  const {
    kind,
    isPending,
    mcc,
    merchant,
    createdAt,
    billingAmount,
    billingCurrency,
    transactionAmount,
    transactionCurrency,
  } = transaction;

  const isApproved = kind === "Payment" && transaction.status === "Approved";
  const failedTxStatus = !isApproved && kind === "Payment" && fromPascalCase(transaction.status);
  const isRefundOrReversal = kind === "Refund" || kind === "Reversal";
  const sign = kind === "Payment" ? "-" : "+";
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
    <button
      className="flex items-center justify-between py-3 cursor-pointer hover:bg-muted/50 rounded-lg px-2 -mx-2 transition-colors w-full text-left"
      onClick={onClick}
      type="button"
    >
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
          <Icon className="w-6 h-6 text-muted-foreground" aria-hidden="true" />
        </div>
        <div>
          <div className="text-xl text-foreground">{merchantName}</div>
          <div className="text-xs text-muted-foreground">
            {time}
            {failedTxStatus && <span> • {failedTxStatus}</span>}
            {isRefundOrReversal && (
              <span className="inline-flex items-center ml-1">
                {"• Refund"}
                <StatusHelpIcon type="refund" />
              </span>
            )}
            {isPending && (
              <span className="inline-flex items-center ml-1">
                {"• Pending"}
                <StatusHelpIcon type="pending" />
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="text-right">
        <div className={`text-xl text-foreground ${!isApproved && "line-through"}`}>
          {billAmount ? `${sign} ${billAmount}` : "-"}
        </div>
        {txAmount !== billAmount && <div className="text-xs text-muted-foreground mt-1">{`${sign} ${txAmount}`}</div>}
      </div>
    </button>
  );
};
