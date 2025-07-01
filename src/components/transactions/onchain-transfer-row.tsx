import type { CurrencyInfo } from "@/constants";
import { Erc20TokenEventDirection, type Erc20TokenEvent } from "@/types/transaction";
import { formatCurrency } from "@/utils/formatCurrency";
import { shortenAddress } from "@/utils/shortenAddress";
import { format } from "date-fns";
import { Minus, Plus } from "lucide-react";

interface OnchainTransferRowProps {
  transfer: Erc20TokenEvent;
  currency: CurrencyInfo;
}

export const OnchainTransferRow = ({ transfer, currency }: OnchainTransferRowProps) => {
  const isIncoming = transfer.direction === Erc20TokenEventDirection.Incoming;
  const sign = isIncoming ? "+" : "-";
  const Icon = isIncoming ? Plus : Minus;

  const formattedValue = formatCurrency(transfer.value.toString(), currency);

  return (
    <div className="flex items-center justify-between py-3">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-icon-card-bg flex items-center justify-center">
          <Icon className="w-6 h-6 text-icon-card" aria-hidden="true" />
        </div>
        <div className="flex flex-col">
          <div className="text-xl text-primary">
            {isIncoming ? "From" : "To"} {shortenAddress(isIncoming ? transfer.from : transfer.to)}
          </div>
          <div className="text-xs text-secondary mt-1">{format(transfer.date, "HH:mm")}</div>
        </div>
      </div>
      <div className="text-right">
        <div className="text-xl text-primary">{formattedValue ? `${sign} ${formattedValue}` : "-"}</div>
      </div>
    </div>
  );
};
