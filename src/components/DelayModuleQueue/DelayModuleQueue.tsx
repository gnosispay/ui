import { StandardAlert } from "@/components/ui/standard-alert";
import { useDelayModuleQueue } from "@/context/DelayModuleQueueContext";
import { PendingTransactionItem } from "./PendingTransactionItem";
import { Button } from "../ui/button";
import { useState, useCallback } from "react";

export const DelayModuleQueue = () => {
  const { queue, isError, hasExpiredTransaction, skipExpired } = useDelayModuleQueue();
  const [isSkippingExpired, setIsSkippingExpired] = useState(false);

  const handleSkipExpired = useCallback(async () => {
    setIsSkippingExpired(true);
    try {
      await skipExpired();
    } finally {
      setIsSkippingExpired(false);
    }
  }, [skipExpired]);

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
          <PendingTransactionItem key={transaction.nonce.toString()} transaction={transaction} />
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
