import { useMemo } from "react";
import { format, parseISO } from "date-fns";
import { Copy, Minus, Plus } from "lucide-react";
import type { IbanOrder } from "@/client";
import { formatDisplayAmount } from "@/utils/formatCurrency";
import { currencies } from "@/constants";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";

interface BankTransferDetailsModalProps {
  ibanOrder: IbanOrder | null;
  isOpen: boolean;
  onClose: () => void;
}

export const BankTransferDetailsModal = ({ ibanOrder, isOpen, onClose }: BankTransferDetailsModalProps) => {
  const { copyToClipboard } = useCopyToClipboard();

  const transferDetails = useMemo(() => {
    if (!ibanOrder) return null;

    const {
      kind,
      state,
      amount,
      currency,
      memo,
      counterpart: {
        identifier,
        details: { name: counterpartName },
      },
      meta: { placedAt },
    } = ibanOrder;

    // Extract IBAN from identifier
    const iban = identifier.standard === "iban" ? identifier.iban : "N/A";

    const isIncoming = kind === "issue";
    const sign = isIncoming ? "+" : "-";
    const Icon = isIncoming ? Plus : Minus;

    const formattedAmount = formatDisplayAmount(Number(amount), currencies[currency.toUpperCase()]);
    const formattedDate = format(parseISO(placedAt), "MMM dd, yyyy 'at' HH:mm");

    // Status formatting
    const getStatusInfo = () => {
      switch (state) {
        case "placed":
          return { text: "Placed", color: "text-warning" };
        case "pending":
          return { text: "Pending", color: "text-warning" };
        case "processed":
          return { text: "Completed", color: "text-success" };
        case "rejected":
          return { text: "Rejected", color: "text-error" };
        default:
          return { text: state, color: "text-muted-foreground" };
      }
    };

    const statusInfo = getStatusInfo();

    return {
      isIncoming,
      sign,
      Icon,
      formattedAmount,
      formattedDate,
      counterpartName,
      iban,
      memo,
      currency: currency.toUpperCase(),
      statusInfo,
    };
  }, [ibanOrder]);

  if (!ibanOrder || !transferDetails) {
    return null;
  }

  const { isIncoming, sign, Icon, formattedAmount, formattedDate, counterpartName, iban, memo, currency, statusInfo } =
    transferDetails;

  const transferTitle = isIncoming ? "Incoming Bank Transfer" : "Outgoing Bank Transfer";
  const direction = isIncoming ? "From" : "To";

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
                  {formattedAmount ? `${sign} ${formattedAmount}` : "-"}
                </div>
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-0">
          {/* Status */}
          <div className="flex justify-between items-center py-3">
            <span className="text-muted-foreground">Status</span>
            <span className={`font-medium ${statusInfo.color}`}>{statusInfo.text}</span>
          </div>

          {/* Counterpart */}
          <div className="flex justify-between items-center py-3">
            <span className="text-muted-foreground">{direction}</span>
            <span className="font-medium text-foreground">{counterpartName}</span>
          </div>

          {/* IBAN */}
          <div className="flex justify-between items-center py-3">
            <span className="text-muted-foreground">IBAN</span>
            <div className="flex items-center gap-2">
              <span className="font-medium text-foreground font-mono text-sm">{iban}</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => copyToClipboard(iban, { successMessage: "IBAN copied to clipboard" })}
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Currency */}
          <div className="flex justify-between items-center py-3">
            <span className="text-muted-foreground">Currency</span>
            <span className="font-medium text-foreground">{currency}</span>
          </div>

          {/* Memo */}
          {memo && (
            <div className="flex justify-between items-center py-3">
              <span className="text-muted-foreground">Memo</span>
              <span className="font-medium text-foreground">{memo}</span>
            </div>
          )}

          {/* Order ID */}
          <div className="flex justify-between items-center py-3">
            <span className="text-muted-foreground">Order ID</span>
            <div className="flex items-center gap-2">
              <span className="font-medium text-foreground font-mono text-sm">{ibanOrder.id}</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => copyToClipboard(ibanOrder.id, { successMessage: "Order ID copied to clipboard" })}
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
