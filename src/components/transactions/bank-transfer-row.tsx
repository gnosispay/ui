import type { IbanOrder } from "@/client";
import { Plus, Minus } from "lucide-react";
import { format, parseISO } from "date-fns";
import { formatDisplayAmount } from "@/utils/formatCurrency";
import { currencies } from "@/constants";

interface BankTransferRowProps {
  ibanOrder: IbanOrder;
}

export const BankTransferRow = ({ ibanOrder }: BankTransferRowProps) => {
  const {
    kind,
    meta: { placedAt },
    counterpart: {
      details: { name: counterpartName },
    },
    amount,
    memo,
    currency,
  } = ibanOrder;

  const isIncoming = kind === "issue";

  const Icon = isIncoming ? Plus : Minus;
  const sign = isIncoming ? "+" : "-";

  const direction = isIncoming ? "From" : "To";
  const transferTitle = counterpartName ? `${direction} ${counterpartName}` : "Bank transfer";

  const formattedAmount = `${sign} ${formatDisplayAmount(Number(amount), currencies[currency.toUpperCase()])}`;

  const transferTime = format(parseISO(placedAt), "HH:mm");

  return (
    <div className="flex items-center justify-between py-3">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-icon-card-bg flex items-center justify-center">
          <Icon className="w-6 h-6 text-icon-card" aria-hidden="true" />
        </div>
        <div className="flex flex-col">
          <div>{transferTitle}</div>
          <div className="text-xs text-secondary mt-1">
            {transferTime}
            {memo && <span className="mx-1"> • {memo}</span>}
          </div>
        </div>
      </div>
      <div className="text-right">
        <div className="text-xl text-primary">{formattedAmount}</div>
      </div>
    </div>
  );
};
