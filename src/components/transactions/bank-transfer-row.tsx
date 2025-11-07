import { useState, useCallback } from "react";
import type { IbanOrder } from "@/client";
import { Plus, Minus } from "lucide-react";
import { format, parseISO } from "date-fns";
import { formatDisplayAmount } from "@/utils/formatCurrency";
import { currencies } from "@/constants";
import { BankTransferDetailsModal } from "@/components/modals/transaction-details/bank-transfer-details-modal";

interface BankTransferRowProps {
  ibanOrder: IbanOrder;
  index?: number;
}

export const BankTransferRow = ({ ibanOrder, index }: BankTransferRowProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleClick = useCallback(() => {
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

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
    <>
      <button
        className="flex items-center justify-between py-3 cursor-pointer hover:bg-muted/50 rounded-lg transition-colors w-full text-left p-2"
        onClick={handleClick}
        type="button"
        data-testid={`iban-transaction-row-${index ?? 0}`}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-full bg-icon-background flex items-center justify-center"
            data-testid="iban-transaction-icon"
          >
            <Icon className="w-6 h-6 text-primary" aria-hidden="true" />
          </div>
          <div className="flex flex-col">
            <div className="text-lg" data-testid="iban-transaction-title">
              {transferTitle}
            </div>
            <div className="text-xs text-secondary mt-1" data-testid="iban-transaction-time">
              {transferTime}
              {memo && (
                <span className="mx-1" data-testid="iban-transaction-memo">
                  {" "}
                  • {memo}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-lg text-primary" data-testid="iban-transaction-amount">
            {formattedAmount}
          </div>
        </div>
      </button>

      <BankTransferDetailsModal ibanOrder={ibanOrder} isOpen={isModalOpen} onClose={handleCloseModal} />
    </>
  );
};
