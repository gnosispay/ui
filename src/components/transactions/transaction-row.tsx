import { getIconForMcc } from "@/utils/mccUtils";
import { formatCurrency } from "@/utils/formatCurrency";
import { fromPascalCase } from "@/utils/convertFromPascalCase";
import type { Event } from "@/client";

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

  const approved = kind === "Payment" && transaction.status === "Approved";
  const refundOrReversal = kind === "Refund" || kind === "Reversal";
  const pending = isPending;
  const sign = kind === "Payment" ? "-" : "+";
  const Icon = getIconForMcc(mcc);
  const merchantName = merchant?.name || "Unknown";
  const time = createdAt ? new Date(createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "";
  const billAmount = formatCurrency(billingAmount, {
    decimals: billingCurrency?.decimals,
    fiatSymbol: billingCurrency?.symbol,
  });
  const txAmount =
    billingCurrency?.name !== transactionCurrency?.name
      ? formatCurrency(transactionAmount, {
          decimals: transactionCurrency?.decimals,
          fiatSymbol: transactionCurrency?.symbol,
        })
      : "";

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
            {!approved && <span> • {fromPascalCase(status)}</span>}
            {refundOrReversal && <span> • Refund</span>}
            {pending && <span> • Pending</span>}
          </div>
        </div>
      </div>
      <div className="text-right">
        <div className={`text-xl text-primary ${!approved && "line-through"}`}>
          {billAmount ? `${sign} ${billAmount}` : "-"}
        </div>
        {txAmount && <div className="text-xs text-secondary mt-1">{`${sign} ${txAmount}`}</div>}
      </div>
    </div>
  );
};
