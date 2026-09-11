import { OnchainBalance } from "@/components/OnchainBalance";
import { WithdrawFundsForm } from "@/components/WithdrawFundsForm";
import { DelayModuleQueue } from "@/components/DelayModuleQueue/DelayModuleQueue";
import { useTokenBalance } from "@/hooks/useTokenBalance";
import { DelayModuleQueueContextProvider, useDelayModuleQueue } from "@/context/DelayModuleQueueContext";
import { useUser } from "@/context/UserContext";
import { StandardAlert } from "@/components/ui/standard-alert";
import { TROUBLE_LOGGING_IN_URL } from "@/constants";
import { useCallback, useRef, useState, useEffect } from "react";
import type { Address } from "viem";

interface WithdrawContentProps {
  safeAddress: Address;
  currenciesWithBalance: ReturnType<typeof useTokenBalance>["currenciesWithBalance"];
  isLoading: boolean;
  isError: boolean;
  onTransactionExecuted: () => void;
}

const WithdrawContent = ({
  safeAddress,
  currenciesWithBalance,
  isLoading,
  isError,
  onTransactionExecuted,
}: WithdrawContentProps) => {
  const { queue } = useDelayModuleQueue();
  const [justQueued, setJustQueued] = useState(false);
  const queueRef = useRef<HTMLDivElement>(null);
  // Track whether the queue has been seen as non-empty since justQueued was set,
  // so the banner isn't immediately dismissed before the async refetch returns.
  const hasSeenNonEmptyQueue = useRef(false);

  useEffect(() => {
    if (justQueued && queue.length > 0) {
      hasSeenNonEmptyQueue.current = true;
    }
    if (justQueued && queue.length === 0 && hasSeenNonEmptyQueue.current) {
      setJustQueued(false);
      hasSeenNonEmptyQueue.current = false;
    }
  }, [justQueued, queue.length]);

  const handleJustQueued = useCallback(() => {
    setJustQueued(true);
    onTransactionExecuted();
    // Small delay so the queue card has time to render before scrolling
    setTimeout(() => {
      queueRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  }, [onTransactionExecuted]);

  return (
    <div className="grid grid-cols-6 gap-4 h-full m-4 lg:m-0 lg:mt-4">
      <div className="col-span-6 lg:col-start-2 lg:col-span-4">
        <div className="flex flex-col gap-4">
          <OnchainBalance currenciesWithBalance={currenciesWithBalance} isLoading={isLoading} isError={isError} />
          <div ref={queueRef} className="flex flex-col gap-4">
            {justQueued && (
              <StandardAlert
                variant="info"
                description="Step 1 of 2 complete — your withdrawal is queued. Return here after the cooldown period to click Execute."
              />
            )}
            <DelayModuleQueue />
          </div>
          <WithdrawFundsForm
            safeAddress={safeAddress}
            kind="next"
            currenciesWithBalance={currenciesWithBalance}
            isLoadingBalances={isLoading}
            onSuccess={handleJustQueued}
          />
        </div>
      </div>
    </div>
  );
};

export const WithdrawRoute = () => {
  const { safeConfig } = useUser();
  const { currenciesWithBalance, isLoading, isError, refetch } = useTokenBalance();
  const safeAddress = safeConfig?.address as Address | undefined;

  const handleTransactionExecuted = useCallback(() => {
    refetch();
  }, [refetch]);

  if (!safeAddress) {
    return (
      <div className="grid grid-cols-6 gap-4 h-full m-4 lg:m-0 lg:mt-4">
        <div className="col-span-6 lg:col-start-2 lg:col-span-4">
          <div className="flex flex-col items-center gap-4 bg-card p-8 rounded-lg text-center">
            <h2 className="font-bold text-secondary text-lg">No Safe found</h2>
            <p className="text-sm text-muted-foreground">
              We couldn&apos;t find a Safe for the connected wallet. If you have a Gnosis Pay account, make sure you are
              connected with the wallet you signed up with, then reload this page.
            </p>
            <a
              className="text-xs text-muted-foreground underline"
              href={TROUBLE_LOGGING_IN_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              Trouble logging in? Get help
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <DelayModuleQueueContextProvider
      safeAddress={safeAddress}
      kind="next"
      onTransactionExecuted={handleTransactionExecuted}
    >
      <WithdrawContent
        safeAddress={safeAddress}
        currenciesWithBalance={currenciesWithBalance}
        isLoading={isLoading}
        isError={isError}
        onTransactionExecuted={handleTransactionExecuted}
      />
    </DelayModuleQueueContextProvider>
  );
};
