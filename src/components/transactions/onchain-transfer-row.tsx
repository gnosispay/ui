import { useState, useCallback } from "react";
import type { CurrencyInfo } from "@/constants";
import { Erc20TokenEventDirection, type Erc20TokenEvent } from "@/types/transaction";
import { formatCurrency } from "@/utils/formatCurrency";
import { shortenAddress } from "@/utils/shortenAddress";
import { format } from "date-fns";
import { Minus, Plus } from "lucide-react";
import { OnchainTransferDetailsModal } from "@/components/modals/transaction-details/onchain-transfer-details-modal";

interface OnchainTransferRowProps {
  transfer: Erc20TokenEvent;
  currency: CurrencyInfo;
}

export const OnchainTransferRow = ({ transfer, currency }: OnchainTransferRowProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleClick = useCallback(() => {
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  const isIncoming = transfer.direction === Erc20TokenEventDirection.Incoming;
  const sign = isIncoming ? "+" : "-";
  const Icon = isIncoming ? Plus : Minus;

  const formattedValue = formatCurrency(transfer.value.toString(), currency);

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
          <div className="flex flex-col">
            <div className="text-lg text-primary">
              {isIncoming ? "From" : "To"} {shortenAddress(isIncoming ? transfer.from : transfer.to)}
            </div>
            <div className="text-xs text-secondary mt-1">{format(transfer.date, "HH:mm")}</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-lg text-primary">{formattedValue ? `${sign} ${formattedValue}` : "-"}</div>
        </div>
      </button>

      <OnchainTransferDetailsModal
        transfer={transfer}
        currency={currency}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </>
  );
};
