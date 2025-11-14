import { StandardAlert } from "@/components/ui/standard-alert";
import { useDelayModuleQueue } from "@/hooks/useDelayModuleQueue";
import { PendingTransactionItem } from "./PendingTransactionItem";
import { useCallback, useMemo, useState } from "react";
import { Button } from "../ui/button";
import { useUser } from "@/context/UserContext";
import { predictAddresses } from "@gnosispay/account-kit";
import { writeContract, waitForTransactionReceipt } from "wagmi/actions";
import { wagmiAdapter } from "@/wagmi";
import type { Address } from "viem";
import { toast } from "sonner";
import { extractErrorMessage } from "@/utils/errorHelpers";
import { DELAY_MOD_ABI } from "@/utils/abis/delayAbi";

interface DelayModuleQueueProps {
  onTransactionExecuted?: () => void;
}

export const DelayModuleQueue = ({ onTransactionExecuted }: DelayModuleQueueProps = {}) => {
  const { queue, queueInfo, isError, refetch } = useDelayModuleQueue();
  const { safeConfig } = useUser();
  const [isSkippingExpired, setIsSkippingExpired] = useState(false);

  const hasExpiredTransaction = useMemo(() => {
    return queue?.some((transaction) => transaction.isExpired);
  }, [queue]);

  const handleSkipExpired = useCallback(async () => {
    if (!safeConfig?.address || !hasExpiredTransaction) {
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

      // Wait for transaction confirmation
      await waitForTransactionReceipt(wagmiAdapter.wagmiConfig, {
        hash: txHash,
      });

      toast.success("Expired transactions skipped successfully!");
      console.info("Skip expired transaction hash:", txHash);

      // Refresh queue
      refetch();
    } catch (error) {
      console.error("Error skipping expired transactions:", error);
      toast.error(extractErrorMessage(error, "Error skipping expired transactions"));
    } finally {
      setIsSkippingExpired(false);
    }
  }, [safeConfig?.address, hasExpiredTransaction, refetch]);

  if (isError) {
    return <StandardAlert variant="destructive" description="Failed to fetch delay module queue information." />;
  }

  if (!queue || queue.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-4 bg-card p-4 rounded-lg" data-testid="delay-module-queue">
      <h2 className="font-bold text-secondary text-lg">Transaction Queue</h2>

      <div className="space-y-3">
        {queue.map((transaction) => (
          <PendingTransactionItem
            key={transaction.nonce.toString()}
            transaction={transaction}
            hasExpiredTx={hasExpiredTransaction}
            onExecuteSuccess={onTransactionExecuted}
            cooldown={queueInfo?.cooldown ?? 0n}
            refetchQueue={refetch}
          />
        ))}
        {hasExpiredTransaction && (
          <Button
            variant="default"
            size="sm"
            onClick={handleSkipExpired}
            disabled={isSkippingExpired}
            loading={isSkippingExpired}
          >
            Skip Expired
          </Button>
        )}
      </div>
    </div>
  );
};
