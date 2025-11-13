import { Button } from "@/components/ui/button";
import { StandardAlert } from "@/components/ui/standard-alert";
import { useDelayModuleQueue } from "@/hooks/useDelayModuleQueue";
import { useUser } from "@/context/UserContext";
import { useMemo, useState, useCallback, useEffect } from "react";
import { Clock, ArrowRight, AlertTriangle } from "lucide-react";
import { Skeleton } from "./ui/skeleton";
import { populateExecuteDispatch, predictAddresses } from "@gnosispay/account-kit";
import { sendTransaction, writeContract } from "wagmi/actions";
import { wagmiAdapter } from "@/wagmi";
import type { Address } from "viem";
import { toast } from "sonner";
import { extractErrorMessage } from "@/utils/errorHelpers";
import { getStoredTransactions, removeTransaction, type StoredTransaction } from "@/utils/localTransactionStorage";
import { formatUnits } from "viem";
import { shortenAddress } from "@/utils/shortenAddress";
import { DELAY_MOD_ABI } from "@/utils/abis/delayAbi";

interface DelayModuleQueueProps {
  onTransactionExecuted?: () => void;
}

export const DelayModuleQueue = ({ onTransactionExecuted }: DelayModuleQueueProps = {}) => {
  const { queueInfo, isLoading, isError, refetch } = useDelayModuleQueue();
  const { safeConfig } = useUser();
  const [storedTransactions, setStoredTransactions] = useState<StoredTransaction[]>([]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [isSkippingExpired, setIsSkippingExpired] = useState(false);

  // const cooldownMinutes = useMemo(() => {
  //   if (!queueInfo?.cooldown) return 0;
  //   return Number(queueInfo.cooldown) / 60;
  // }, [queueInfo?.cooldown]);

  const expirationMinutes = useMemo(() => {
    if (!queueInfo?.expiration) return 0;
    return Number(queueInfo.expiration) / 60;
  }, [queueInfo?.expiration]);

  // Load stored transactions
  useEffect(() => {
    if (safeConfig?.address) {
      const transactions = getStoredTransactions(safeConfig.address);
      setStoredTransactions(transactions);
    }
  }, [safeConfig?.address]);

  const nextTransaction = useMemo(() => {
    return storedTransactions.length > 0 ? storedTransactions[0] : null;
  }, [storedTransactions]);

  // Calculate time remaining until transaction can be executed
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [canExecute, setCanExecute] = useState(false);

  useEffect(() => {
    if (!nextTransaction || !queueInfo?.txCreatedAt) {
      setTimeRemaining(0);
      setCanExecute(false);
      return;
    }

    const updateCountdown = () => {
      // Use on-chain timestamp (in seconds) from the delay module
      const createdAtMs = Number(queueInfo.txCreatedAt) * 1000;
      const cooldownMs = Number(queueInfo.cooldown) * 1000;
      const elapsedMs = Date.now() - createdAtMs;
      const remainingMs = cooldownMs - elapsedMs;

      if (remainingMs <= 0) {
        setTimeRemaining(0);
        setCanExecute(true);
      } else {
        setTimeRemaining(remainingMs);
        setCanExecute(false);
      }
    };

    // Update immediately
    updateCountdown();

    // Update every second
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [nextTransaction, queueInfo?.txCreatedAt, queueInfo?.cooldown]);

  const formatTimeRemaining = useCallback((ms: number): string => {
    const totalSeconds = Math.ceil(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  }, []);

  const handleExecuteNext = useCallback(async () => {
    if (!safeConfig?.address || !queueInfo?.hasPendingTransactions || !nextTransaction) {
      return;
    }

    setIsExecuting(true);

    try {
      // Reconstruct the transaction from stored data
      const transaction = {
        to: nextTransaction.to,
        value: BigInt(nextTransaction.value),
        data: nextTransaction.data,
      };

      const txRequest = populateExecuteDispatch({ account: safeConfig.address }, transaction);

      const txHash = await sendTransaction(wagmiAdapter.wagmiConfig, {
        to: txRequest.to as Address,
        data: txRequest.data as `0x${string}`,
        value: BigInt(txRequest.value),
      });

      toast.success("Transaction executed successfully!");
      console.info("Execution transaction hash:", txHash);

      // Remove from local storage
      removeTransaction(safeConfig.address, nextTransaction.timestamp);

      // Refresh queue and balance
      refetch();
      onTransactionExecuted?.();

      // Reload stored transactions
      const updatedTransactions = getStoredTransactions(safeConfig.address);
      setStoredTransactions(updatedTransactions);
    } catch (error) {
      console.error("Error executing transaction:", error);
      toast.error(extractErrorMessage(error, "Error executing transaction"));
    } finally {
      setIsExecuting(false);
    }
  }, [safeConfig?.address, queueInfo?.hasPendingTransactions, nextTransaction, refetch, onTransactionExecuted]);

  const handleSkipExpired = useCallback(async () => {
    if (!safeConfig?.address || !queueInfo?.hasExpiredTransactions) {
      return;
    }

    setIsSkippingExpired(true);

    try {
      // Get the delay module address
      const { delay: delayModAddress } = predictAddresses(safeConfig.address);

      // Call skipExpired on the delay module
      const txHash = await writeContract(wagmiAdapter.wagmiConfig, {
        address: delayModAddress as Address,
        abi: DELAY_MOD_ABI,
        functionName: "skipExpired",
      });

      toast.success("Expired transactions skipped successfully!");
      console.info("Skip expired transaction hash:", txHash);

      // Clear the stored transaction from local storage since it's expired
      if (nextTransaction) {
        removeTransaction(safeConfig.address, nextTransaction.timestamp);
      }

      // Refresh queue and balance
      refetch();
      onTransactionExecuted?.();

      // Reload stored transactions
      const updatedTransactions = getStoredTransactions(safeConfig.address);
      setStoredTransactions(updatedTransactions);
    } catch (error) {
      console.error("Error skipping expired transactions:", error);
      toast.error(extractErrorMessage(error, "Error skipping expired transactions"));
    } finally {
      setIsSkippingExpired(false);
    }
  }, [safeConfig?.address, queueInfo?.hasExpiredTransactions, nextTransaction, refetch, onTransactionExecuted]);

  if (isError) {
    return <StandardAlert variant="destructive" description="Failed to fetch delay module queue information." />;
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 bg-card p-4 rounded-lg">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-16 w-full" />
      </div>
    );
  }

  if (!queueInfo || !queueInfo.hasPendingTransactions) {
    return null;
  }

  return (
    <div className="flex flex-col gap-4 bg-card p-4 rounded-lg" data-testid="delay-module-queue">
      <h2 className="font-bold text-secondary text-lg">Transaction Queue</h2>

      {queueInfo.hasPendingTransactions && (
        <div className="space-y-4">
          {queueInfo.hasExpiredTransactions && (
            <StandardAlert
              variant="destructive"
              description={`The next transaction has expired. Transactions expire after ${expirationMinutes} minutes past the cooldown period. Click "Skip Expired" to remove it from the queue.`}
              customIcon={<AlertTriangle className="h-4 w-4" />}
            />
          )}

          {queueInfo.hasExpiredTransactions ? (
            <>
              {nextTransaction && (
                <div className="flex flex-col gap-2 p-3 rounded-lg border border-border bg-card">
                  <h3 className="font-medium text-foreground">Next Transaction to Execute</h3>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Token</span>
                    <span className="font-medium text-foreground">{nextTransaction.tokenSymbol}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Amount</span>
                    <span className="font-medium text-foreground">
                      {nextTransaction.amount && nextTransaction.tokenAddress
                        ? formatUnits(BigInt(nextTransaction.amount), 18)
                        : "N/A"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">To</span>
                    <span className="font-medium text-foreground text-xs">
                      {shortenAddress(nextTransaction.recipient)}
                    </span>
                  </div>
                </div>
              )}

              <Button
                onClick={handleSkipExpired}
                disabled={isSkippingExpired}
                loading={isSkippingExpired}
                variant="destructive"
                className="w-full"
              >
                <AlertTriangle className="mr-2 h-4 w-4" />
                Skip Expired Transaction
              </Button>
            </>
          ) : nextTransaction ? (
            <>
              <div className="flex flex-col gap-2 p-3 rounded-lg border border-border bg-card">
                <h3 className="font-medium text-foreground">Next Transaction to Execute</h3>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Token</span>
                  <span className="font-medium text-foreground">{nextTransaction.tokenSymbol}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Amount</span>
                  <span className="font-medium text-foreground">
                    {nextTransaction.amount && nextTransaction.tokenAddress
                      ? formatUnits(BigInt(nextTransaction.amount), 18)
                      : "N/A"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">To</span>
                  <span className="font-medium text-foreground text-xs">
                    {shortenAddress(nextTransaction.recipient)}
                  </span>
                </div>
                {!canExecute && timeRemaining > 0 && (
                  <div className="flex items-center justify-between text-sm pt-2 border-t border-border">
                    <span className="text-muted-foreground">Time until executable</span>
                    <span className="font-medium text-foreground font-mono">{formatTimeRemaining(timeRemaining)}</span>
                  </div>
                )}
              </div>

              <Button
                onClick={handleExecuteNext}
                disabled={isExecuting || !canExecute}
                loading={isExecuting}
                className="w-full"
              >
                {canExecute ? (
                  <>
                    Execute Transaction
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                ) : (
                  <>
                    <Clock className="mr-2 h-4 w-4" />
                    Waiting for cooldown ({formatTimeRemaining(timeRemaining)})
                  </>
                )}
              </Button>
            </>
          ) : (
            <StandardAlert
              variant="warning"
              description="No transaction details found. Transaction details are stored locally when you submit a withdrawal. Please submit a new withdrawal to execute it after the cooldown period."
            />
          )}
        </div>
      )}
    </div>
  );
};
