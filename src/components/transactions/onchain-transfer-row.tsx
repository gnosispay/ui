import { useState, useCallback, useMemo } from "react";
import type { CurrencyInfo } from "@/constants";
import { supportedTokens, REWARD_ADDRESS } from "@/constants";
import { Erc20TokenEventDirection, type Erc20TokenEvent } from "@/types/transaction";
import { formatTokenAmount } from "@/utils/formatCurrency";
import { shortenAddress } from "@/utils/shortenAddress";
import { format } from "date-fns";
import { Minus, Plus, Gift } from "lucide-react";
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

  // Check if this is a reward transfer (from reward address)
  const isRewardTransfer = useMemo(() => {
    return transfer.from.toLowerCase() === REWARD_ADDRESS.toLowerCase();
  }, [transfer.from]);

  const sign = isIncoming ? "+" : "-";
  const Icon = isRewardTransfer ? Gift : isIncoming ? Plus : Minus;

  // Find matching supported token by address
  const supportedTokenInfo = useMemo(() => {
    if (!transfer.tokenAddress) return null;

    const tokenEntry = Object.values(supportedTokens).find(
      (token) => token.address?.toLowerCase() === transfer.tokenAddress?.toLowerCase(),
    );
    return tokenEntry || null;
  }, [transfer.tokenAddress]);

  // Use appropriate token info for formatting
  const tokenInfo = useMemo(() => {
    // Use supported token info if available, otherwise fall back to currency
    return supportedTokenInfo || currency;
  }, [supportedTokenInfo, currency]);

  const formattedValue = useMemo(() => {
    return formatTokenAmount(transfer.value.toString(), tokenInfo);
  }, [transfer.value, tokenInfo]);

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
              {isRewardTransfer
                ? "Reward"
                : `${isIncoming ? "From" : "To"} ${shortenAddress(isIncoming ? transfer.from : transfer.to)}`}
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
        currency={tokenInfo}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </>
  );
};
