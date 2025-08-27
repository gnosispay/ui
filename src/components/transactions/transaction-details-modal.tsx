import { useMemo } from "react";
import { format, parseISO } from "date-fns";
import { ExternalLink } from "lucide-react";
import type { Event } from "@/client";
import { getIconForMcc, getMccCategory } from "@/utils/mccUtils";
import { formatCurrency } from "@/utils/formatCurrency";
import { fromPascalCase } from "@/utils/convertFromPascalCase";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface TransactionDetailsModalProps {
  transaction: Event | null;
  isOpen: boolean;
  onClose: () => void;
}

export const TransactionDetailsModal = ({ transaction, isOpen, onClose }: TransactionDetailsModalProps) => {
  const transactionDetails = useMemo(() => {
    if (!transaction || transaction.kind !== "Payment") return null;

    const {
      isPending,
      mcc,
      merchant,
      billingAmount,
      billingCurrency,
      transactionAmount,
      transactionCurrency,
      country,
      status,
    } = transaction;

    const isApproved = status === "Approved";
    const failedTxStatus = !isApproved && status ? fromPascalCase(status) : null;
    // const isRefundOrReversal = kind === "Refund" || kind === "Reversal";
    const sign = "-";
    const Icon = getIconForMcc(mcc);
    const merchantName = merchant?.name || "Unknown";
    const category = getMccCategory({ mcc: mcc || "" });

    const billAmount = formatCurrency(billingAmount, {
      decimals: billingCurrency?.decimals,
      fiatSymbol: billingCurrency?.symbol,
    });

    const txAmount = formatCurrency(transactionAmount, {
      decimals: transactionCurrency?.decimals,
      fiatSymbol: transactionCurrency?.symbol,
    });

    // Exchange rate calculation
    const exchangeRate = (() => {
      if (!billingAmount || !transactionAmount || !billingCurrency || !transactionCurrency) {
        return null;
      }

      if (billingCurrency.symbol === transactionCurrency.symbol) {
        return null; // Same currency, no exchange rate needed
      }

      try {
        const billingValue = Number(billingAmount) / 10 ** (billingCurrency.decimals || 0);
        const transactionValue = Number(transactionAmount) / 10 ** (transactionCurrency.decimals || 0);

        if (transactionValue === 0) return null;

        const rate = billingValue / transactionValue;
        return `1 ${transactionCurrency.symbol} = ${rate.toFixed(2)} ${billingCurrency.symbol}`;
      } catch {
        return null;
      }
    })();

    return {
      Icon,
      merchantName,
      category,
      sign,
      billAmount,
      txAmount,
      exchangeRate,
      isApproved,
      failedTxStatus,
      isPending,
      country: country?.name,
      status: status ? fromPascalCase(status) : null,
      transactionCurrency,
    };
  }, [transaction]);

  if (!transaction || !transactionDetails) {
    return null;
  }

  const {
    Icon,
    merchantName,
    category,
    sign,
    billAmount,
    txAmount,
    exchangeRate,
    isApproved,
    failedTxStatus,
    isPending,
    country,
    status,
  } = transactionDetails;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader className="pb-0">
          <DialogTitle className="flex items-center gap-3 pb-4">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
              <Icon className="w-6 h-6 text-muted-foreground" aria-hidden="true" />
            </div>
            <div className="flex-1">
              <div className="text-xl text-foreground font-normal">{merchantName}</div>
              <div className="text-xs text-muted-foreground">
                {format(parseISO(transaction.createdAt || ""), "MMM dd, yyyy 'at' HH:mm")}
                {failedTxStatus && <span> • {failedTxStatus}</span>}
                {isPending && <span> • Pending</span>}
              </div>
            </div>
            <div className="text-right">
              <div className={`text-xl text-foreground font-normal ${!isApproved && "line-through"}`}>
                {billAmount ? `${sign} ${billAmount}` : "-"}
              </div>
              {txAmount !== billAmount && txAmount && (
                <div className="text-xs text-muted-foreground mt-1">{`${sign} ${txAmount}`}</div>
              )}
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-0">
          {/* Status */}
          <div className="flex justify-between items-center py-3 border-b border-border">
            <span className="text-muted-foreground">Status</span>
            <span
              className={`font-medium ${
                status === "Approved" ? "text-success" : isPending ? "text-warning" : "text-error"
              }`}
            >
              {isPending ? "Pending" : status || "Completed"}
            </span>
          </div>

          {/* Card */}
          <div className="flex justify-between items-center py-3 border-b border-border">
            <span className="text-muted-foreground">Card</span>
            <span className="font-medium text-foreground">••• 2973</span>
          </div>

          {/* Transaction Currency */}
          {transactionDetails?.transactionCurrency?.symbol && (
            <div className="flex justify-between items-center py-3 border-b border-border">
              <span className="text-muted-foreground">Transaction currency</span>
              <span className="font-medium text-foreground">{transactionDetails.transactionCurrency.symbol}</span>
            </div>
          )}

          {/* Exchange Rate */}
          {exchangeRate && (
            <div className="flex justify-between items-center py-3 border-b border-border">
              <span className="text-muted-foreground">Exchange rate</span>
              <span className="font-medium text-foreground">{exchangeRate}</span>
            </div>
          )}

          {/* Category */}
          {transactionDetails?.category && (
            <div className="flex justify-between items-center py-3 border-b border-border">
              <span className="text-muted-foreground">Category</span>
              <span className="font-medium text-foreground">{category}</span>
            </div>
          )}

          {/* Country */}
          {country && (
            <div className="flex justify-between items-center py-3 border-b border-border">
              <span className="text-muted-foreground">Country</span>
              <span className="font-medium text-foreground">{country}</span>
            </div>
          )}

          {/* TxHash - Mock data for now */}
          <div className="flex justify-between items-center py-3">
            <span className="text-muted-foreground">TxHash</span>
            <div className="flex items-center gap-2">
              <span className="font-medium text-foreground">0x13sf...013f</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => {
                  // This would open a blockchain explorer
                  console.log("Open transaction in explorer");
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
