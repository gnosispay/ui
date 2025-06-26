import { getIconForMcc } from "@/utils/mccUtils";
import { formatCurrency } from "@/utils/formatCurrency";
import { fromPascalCase } from "@/utils/convertFromPascalCase";
import type { Event } from "@/client";
import { format, parseISO } from "date-fns";

interface TransactionRowProps {
  transaction: Event;
}

export const TransactionRow = ({ transaction }: TransactionRowProps) => {
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
  const failedTxStatus = kind === "Payment" && fromPascalCase(transaction.status);
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
    <div className="flex items-center justify-between py-3">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-icon-card-bg flex items-center justify-center">
          <Icon className="w-6 h-6 text-icon-card" aria-hidden="true" />
        </div>
        <div>
          <div className="text-xl text-primary">{merchantName}</div>
          <div className="text-xs text-secondary">
            {time}
            {!isApproved && failedTxStatus && <span> • {failedTxStatus}</span>}
            {isRefundOrReversal && <span> • Refund</span>}
            {isPending && <span> • Pending</span>}
          </div>
        </div>
      </div>
      <div className="text-right">
        <div className={`text-xl text-primary ${!isApproved && "line-through"}`}>
          {billAmount ? `${sign} ${billAmount}` : "-"}
        </div>
        {txAmount !== billAmount && <div className="text-xs text-secondary mt-1">{`${sign} ${txAmount}`}</div>}
      </div>
    </div>
  );
};
