import { useMemo } from "react";
import { format, parseISO } from "date-fns";
import { ExternalLink } from "lucide-react";
import type { Event } from "@/client";
import { getIconForMcc, getMccCategory } from "@/utils/mccUtils";
import { formatCurrency } from "@/utils/formatCurrency";
import { getCountryFlag } from "@/utils/countryUtils";
import { calculateExchangeRate, getAmountAndCurrency } from "@/utils/transactionUtils";
import { useTransactionStatus } from "@/hooks/useTransactionStatus";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { StatusHelpIcon } from "@/components/ui/status-help-icon";
import { shortenAddress } from "@/utils/shortenAddress";
import { useCards } from "@/context/CardsContext";

interface TransactionDetailsViewProps {
  transaction: Event;
  onStartDispute: () => void;
}

export const TransactionDetailsView = ({ transaction, onStartDispute }: TransactionDetailsViewProps) => {
  const { isApproved, isRefund, isReversal, isPending, otherTxStatus } = useTransactionStatus(transaction);
  const { cardInfoMap } = useCards();

  const cardInfo = useMemo(() => {
    if (!transaction?.cardToken || !cardInfoMap) {
      return undefined;
    }
    return cardInfoMap[transaction.cardToken];
  }, [transaction?.cardToken, cardInfoMap]);

  const transactionDetails = useMemo(() => {
    if (!transaction) return null;

    const { mcc, merchant, country, createdAt } = transaction;
    const Icon = getIconForMcc(mcc);
    const merchantName = merchant?.name || "Unknown";
    const category = getMccCategory({ mcc: mcc || "" });
    const countryFlag = getCountryFlag(country?.alpha2);
    const txHash = transaction?.transactions?.[0]?.hash;

    const baseDetails = {
      Icon,
      merchantName,
      category,
      country: country?.name,
      countryFlag,
      txHash,
      threadId: transaction?.threadId,
    };

    if (isRefund || isReversal) {
      const amountAndCurrency = getAmountAndCurrency(transaction);
      if (!amountAndCurrency) return null;

      const { amount, currency } = amountAndCurrency;

      const formattedAmount = formatCurrency(String(amount || "0"), {
        decimals: currency?.decimals,
        fiatSymbol: currency?.symbol,
      });

      const statusText = isRefund ? "Refund" : "Reversal";
      const statusWithDate = createdAt ? `${statusText} • ${format(parseISO(createdAt), "MMM dd")}` : statusText;

      return {
        ...baseDetails,
        sign: "+",
        billAmount: formattedAmount,
        txAmount: null, // No secondary amount for refunds/reversals
        exchangeRate: null,
        status: statusWithDate,
        transactionCurrency: currency,
      };
    }

    const { billingAmount, billingCurrency, transactionAmount, transactionCurrency } = transaction;

    const billAmount = formatCurrency(billingAmount, {
      decimals: billingCurrency?.decimals,
      fiatSymbol: billingCurrency?.symbol,
    });

    const txAmount = formatCurrency(transactionAmount, {
      decimals: transactionCurrency?.decimals,
      fiatSymbol: transactionCurrency?.symbol,
    });

    const exchangeRate = calculateExchangeRate(billingAmount, billingCurrency, transactionAmount, transactionCurrency);

    return {
      ...baseDetails,
      sign: "-",
      billAmount,
      txAmount,
      exchangeRate,
      status: isPending ? "Pending" : isApproved ? "Completed" : otherTxStatus,
      transactionCurrency,
    };
  }, [transaction, isApproved, isRefund, isReversal, isPending, otherTxStatus]);

  if (!transactionDetails) {
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
    country,
    countryFlag,
    status,
    txHash,
    threadId,
  } = transactionDetails;

  return (
    <>
      <DialogHeader className="pb-0">
        <DialogTitle className="pb-4 mt-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex items-center gap-3 flex-1">
              <div className="w-12 h-12 rounded-full bg-icon-background flex items-center justify-center">
                <Icon className="w-6 h-6 text-primary" aria-hidden="true" />
              </div>
              <div className="flex-1">
                <div className="text-lg text-foreground font-normal">{merchantName}</div>
                <div className="text-xs text-muted-foreground">
                  {format(parseISO(transaction.createdAt || ""), "MMM dd, yyyy 'at' HH:mm")}
                </div>
              </div>
            </div>
            <div className="text-center sm:text-right">
              <div className={`text-lg text-foreground font-normal`}>{billAmount ? `${sign} ${billAmount}` : "-"}</div>
              {txAmount !== billAmount && txAmount && (
                <div className="text-xs text-muted-foreground mt-1">{`${sign} ${txAmount}`}</div>
              )}
            </div>
          </div>
        </DialogTitle>
      </DialogHeader>

      <div className="space-y-0">
        {/* Status */}
        <div className="flex justify-between items-center py-3">
          <span className="text-muted-foreground">Status</span>
          <div className="flex items-center">
            <span
              className={`font-medium ${
                isPending ? "text-warning" : isRefund || isReversal || isApproved ? "text-success" : "text-destructive"
              }`}
            >
              {status}
            </span>
            {isPending && !isRefund && <StatusHelpIcon type="pending-merchant" />}
            {isRefund && <StatusHelpIcon type="refund" />}
            {isReversal && <StatusHelpIcon type="reversal" />}
          </div>
        </div>

        {cardInfo && (
          <div className="flex justify-between items-center py-3">
            <span className="text-muted-foreground">{cardInfo.virtual ? "Virtual" : "Physical"} Card</span>
            <span className="font-medium text-foreground">••• {cardInfo.lastFourDigits}</span>
          </div>
        )}

        {/* Transaction Currency */}
        {transactionDetails?.transactionCurrency?.symbol && (
          <div className="flex justify-between items-center py-3">
            <span className="text-muted-foreground">Transaction currency</span>
            <span className="font-medium text-foreground">{transactionDetails.transactionCurrency.symbol}</span>
          </div>
        )}

        {/* Exchange Rate */}
        {exchangeRate && (
          <div className="flex justify-between items-center py-3">
            <span className="text-muted-foreground">Exchange rate</span>
            <span className="font-medium text-foreground">{exchangeRate}</span>
          </div>
        )}

        {/* Category */}
        {transactionDetails?.category && (
          <div className="flex justify-between items-center py-3">
            <span className="text-muted-foreground">Category</span>
            <span className="font-medium text-foreground">{category}</span>
          </div>
        )}

        {/* Country */}
        {country && (
          <div className="flex justify-between items-center py-3">
            <span className="text-muted-foreground">Country</span>
            <div className="flex items-center gap-2">
              {countryFlag && <span className="text-lg">{countryFlag}</span>}
              <span className="font-medium text-foreground">{country}</span>
            </div>
          </div>
        )}

        {/* TxHash */}
        {txHash && (
          <div className="flex justify-between items-center py-3">
            <span className="text-muted-foreground">TxHash</span>
            <div className="flex items-center gap-2">
              <span className="font-medium text-foreground">{shortenAddress(txHash)}</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => {
                  window.open(`https://gnosisscan.io/tx/${txHash}`, "_blank");
                }}
              >
                <ExternalLink className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Dispute Button */}
      {threadId && (
        <div className="pt-6">
          <Button variant="outline" onClick={onStartDispute} className="w-full">
            Dispute Transaction
          </Button>
        </div>
      )}
    </>
  );
};
