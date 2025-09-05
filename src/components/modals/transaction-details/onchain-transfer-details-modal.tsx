import { useMemo } from "react";
import { format } from "date-fns";
import { ExternalLink, Copy, Minus, Plus } from "lucide-react";
import type { CurrencyInfo } from "@/constants";
import { Erc20TokenEventDirection, type Erc20TokenEvent } from "@/types/transaction";
import { formatCurrency } from "@/utils/formatCurrency";
import { shortenAddress } from "@/utils/shortenAddress";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";

interface OnchainTransferDetailsModalProps {
  transfer: Erc20TokenEvent | null;
  currency: CurrencyInfo | null;
  isOpen: boolean;
  onClose: () => void;
}

export const OnchainTransferDetailsModal = ({
  transfer,
  currency,
  isOpen,
  onClose,
}: OnchainTransferDetailsModalProps) => {
  const { copyToClipboard } = useCopyToClipboard();

  const transferDetails = useMemo(() => {
    if (!transfer || !currency) return null;

    const isIncoming = transfer.direction === Erc20TokenEventDirection.Incoming;
    const sign = isIncoming ? "+" : "-";
    const Icon = isIncoming ? Plus : Minus;

    const formattedValue = formatCurrency(transfer.value.toString(), currency);
    const formattedDate = format(transfer.date, "MMM dd, yyyy 'at' HH:mm");

    return {
      isIncoming,
      sign,
      Icon,
      formattedValue,
      formattedDate,
      fromAddress: transfer.from,
      toAddress: transfer.to,
      hash: transfer.hash,
      currency,
    };
  }, [transfer, currency]);

  if (!transfer || !transferDetails) {
    return null;
  }

  const { isIncoming, sign, Icon, formattedValue, formattedDate, fromAddress, toAddress, hash } = transferDetails;

  const transferTitle = isIncoming ? "Incoming Transfer" : "Outgoing Transfer";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader className="pb-0">
          <DialogTitle className="pb-4 mt-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex items-center gap-3 flex-1">
                <div className="w-12 h-12 rounded-full bg-icon-background flex items-center justify-center">
                  <Icon className="w-6 h-6 text-primary" aria-hidden="true" />
                </div>
                <div className="flex-1">
                  <div className="text-lg text-foreground font-normal">{transferTitle}</div>
                  <div className="text-xs text-muted-foreground">{formattedDate}</div>
                </div>
              </div>
              <div className="text-center sm:text-right">
                <div className="text-lg text-foreground font-normal">
                  {formattedValue ? `${sign} ${formattedValue}` : "-"}
                </div>
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-0">
          {/* Status */}
          <div className="flex justify-between items-center py-3">
            <span className="text-muted-foreground">Status</span>
            <span className="font-medium text-success">Completed</span>
          </div>

          {/* From Address */}
          <div className="flex justify-between items-center py-3">
            <span className="text-muted-foreground">From</span>
            <div className="flex items-center gap-2">
              <span className="font-medium text-foreground">{shortenAddress(fromAddress)}</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => copyToClipboard(fromAddress, { successMessage: "From address copied to clipboard" })}
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* To Address */}
          <div className="flex justify-between items-center py-3">
            <span className="text-muted-foreground">To</span>
            <div className="flex items-center gap-2">
              <span className="font-medium text-foreground">{shortenAddress(toAddress)}</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => copyToClipboard(toAddress, { successMessage: "To address copied to clipboard" })}
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Currency */}
          <div className="flex justify-between items-center py-3">
            <span className="text-muted-foreground">Currency</span>
            <span className="font-medium text-foreground">{currency?.tokenSymbol}</span>
          </div>

          {/* Transaction Hash */}
          <div className="flex justify-between items-center py-3">
            <span className="text-muted-foreground">Transaction Hash</span>
            <div className="flex items-center gap-2">
              <span className="font-medium text-foreground">{shortenAddress(hash)}</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => copyToClipboard(hash, { successMessage: "Transaction hash copied to clipboard" })}
              >
                <Copy className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => {
                  window.open(`https://gnosisscan.io/tx/${hash}`, "_blank");
                }}
              >
                <ExternalLink className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
