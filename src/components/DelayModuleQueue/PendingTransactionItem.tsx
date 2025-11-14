import { useCallback, useMemo, useState, useEffect } from "react";
import { format } from "date-fns";
import { shortenAddress } from "@/utils/shortenAddress";
import { getStoredTransactions, type StoredTransaction, removeTransaction } from "@/utils/localTransactionStorage";
import { useUser } from "@/context/UserContext";
import type { PendingTransaction } from "@/context/DelayModuleQueueContext";
import { CheckCircle2, Clock, AlertTriangle, Copy } from "lucide-react";
import { Button } from "../ui/button";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
import { getTxInfo } from "@/utils/delayUtils";
import { OperationType } from "@gnosispay/account-kit";
import { formatTokenAmount } from "@/utils/formatCurrency";
import { formatCountdown } from "@/utils/timeUtils";
import { useDelayModuleQueue } from "@/context/DelayModuleQueueContext";
import { formatUnits, type Address } from "viem";

interface PendingTransactionItemProps {
  transaction: PendingTransaction;
}

export const PendingTransactionItem = ({ transaction }: PendingTransactionItemProps) => {
  const { safeConfig } = useUser();
  const { copyToClipboard } = useCopyToClipboard();
  const { queueInfo, hasExpiredTransaction, refetch, executeTransaction } = useDelayModuleQueue();
  const [isExecuting, setIsExecuting] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);

  const handleCopyHash = useCallback(
    (hash: string) => {
      copyToClipboard(hash, {
        successMessage: "Hash copied to clipboard",
        errorMessage: "Failed to copy hash",
      });
    },
    [copyToClipboard],
  );

  // Find stored transaction by hash
  const storedTransaction = useMemo<StoredTransaction | null>(() => {
    if (!transaction.hash || !safeConfig?.address) return null;

    const storedTransactions = getStoredTransactions(safeConfig.address);
    return (
      storedTransactions.find(
        (stored) => stored.txHash === transaction.hash && stored.nonce === Number(transaction.nonce),
      ) || null
    );
  }, [transaction.hash, transaction.nonce, safeConfig?.address]);

  // Format creation date
  const creationDate = useMemo(() => {
    const timestampMs = Number(transaction.creationTimestamp) * 1000;
    return format(new Date(timestampMs), "MMM dd, yyyy HH:mm:ss");
  }, [transaction.creationTimestamp]);

  const txInfo = useMemo(() => {
    if (!storedTransaction || !safeConfig?.address) return null;
    return getTxInfo(safeConfig.address, {
      to: storedTransaction.to,
      value: Number(storedTransaction.value),
      data: storedTransaction.data,
      operationType: OperationType.Call,
    });
  }, [storedTransaction, safeConfig?.address]);

  // Format transaction summary
  const transactionSummary = useMemo(() => {
    if (!storedTransaction || !txInfo) return null;

    const { token, receiver } = txInfo;
    const recipient = receiver || storedTransaction.recipient;
    const amount = storedTransaction.amount;

    if (token && amount && recipient) {
      const formattedAmount = formatTokenAmount(amount, token);
      if (formattedAmount) {
        return `Sending ${formattedAmount} to ${shortenAddress(recipient)}`;
      }
    }

    // Fallback to token symbol if available
    if (storedTransaction.tokenSymbol && amount && recipient) {
      return `Sending ${formatUnits(BigInt(amount), storedTransaction.tokenDecimals ?? 0)} ${storedTransaction.tokenSymbol} to ${shortenAddress(recipient)}`;
    }

    return null;
  }, [storedTransaction, txInfo]);

  // Calculate and update countdown timer
  useEffect(() => {
    if (!transaction.isCooledDown && !transaction.isExpired && queueInfo?.cooldown) {
      const updateCountdown = () => {
        const creationTimestampMs = Number(transaction.creationTimestamp) * 1000;
        const cooldownMs = Number(queueInfo.cooldown) * 1000;
        const cooldownEndMs = creationTimestampMs + cooldownMs;
        const remainingMs = cooldownEndMs - Date.now();

        if (remainingMs <= 0) {
          setTimeRemaining(0);
          // Refetch to update the transaction status
          refetch();
        } else {
          setTimeRemaining(remainingMs);
        }
      };

      // Update immediately
      updateCountdown();

      // Update every second
      const interval = setInterval(updateCountdown, 1000);

      return () => clearInterval(interval);
    } else {
      setTimeRemaining(0);
    }
  }, [transaction.isCooledDown, transaction.isExpired, transaction.creationTimestamp, queueInfo?.cooldown, refetch]);

  const handleExecute = useCallback(async () => {
    if (!safeConfig?.address || !transaction.isCooledDown || !storedTransaction) {
      return;
    }

    setIsExecuting(true);

    try {
      await executeTransaction(
        storedTransaction.to as Address,
        BigInt(storedTransaction.value),
        storedTransaction.data as `0x${string}`,
      );

      // Remove from local storage after successful execution
      removeTransaction(safeConfig.address, storedTransaction.timestamp);
    } catch {
      // Error is already handled in the context
    } finally {
      setIsExecuting(false);
    }
  }, [safeConfig?.address, transaction.isCooledDown, storedTransaction, executeTransaction]);

  return (
    <div className="flex flex-col gap-3 p-4 rounded-lg border border-border bg-card">
      {/* Transaction Summary */}
      {transactionSummary && <div className="text-sm font-medium text-foreground">{transactionSummary}</div>}

      {/* Nonce */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Nonce</span>
        <span className="font-mono font-medium text-foreground">{transaction.nonce.toString()}</span>
      </div>

      {/* Transaction Hash */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Transaction Hash</span>
        <span className="font-mono font-medium text-foreground">
          {transaction.hash ? shortenAddress(transaction.hash) : "N/A"}
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleCopyHash(transaction.hash || "")}
            className="ml-2 p-2 shrink-0"
          >
            <Copy className="h-4 w-4" />
          </Button>
        </span>
      </div>

      {/* Creation Date */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Created</span>
        <span className="font-medium text-foreground">{creationDate}</span>
      </div>

      {/* status indicators */}
      <div className="flex items-center justify-between border-t border-border pt-2">
        <div className="flex items-center gap-2">
          {transaction.isExpired ? (
            <AlertTriangle className="h-4 w-4 text-destructive" />
          ) : transaction.isCooledDown ? (
            <CheckCircle2 className="h-4 w-4 text-success" />
          ) : (
            <Clock className="h-4 w-4 text-muted-foreground" />
          )}
          <div className="flex flex-col">
            <span className="text-sm font-medium text-foreground">
              {transaction.isExpired ? "Expired" : transaction.isCooledDown ? "Ready" : "Cooling Down"}
            </span>
            {!transaction.isCooledDown && !transaction.isExpired && timeRemaining > 0 && (
              <span className="text-xs text-muted-foreground font-mono">{formatCountdown(timeRemaining)}</span>
            )}
          </div>
        </div>
        {/* Execute button - we can only execute if there is no expired transaction */}
        {!hasExpiredTransaction && transaction.isCooledDown && !transaction.isExpired && storedTransaction && (
          <Button
            variant="default"
            size="sm"
            onClick={handleExecute}
            disabled={isExecuting}
            loading={isExecuting}
            className="shrink-0"
          >
            Execute
          </Button>
        )}
      </div>
    </div>
  );
};
