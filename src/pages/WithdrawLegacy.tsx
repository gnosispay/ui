import { OnchainBalance } from "@/components/OnchainBalance";
import { WithdrawFundsForm } from "@/components/WithdrawFundsForm";
import { DelayModuleQueue } from "@/components/DelayModuleQueue/DelayModuleQueue";
import { DelayModuleQueueContextProvider } from "@/context/DelayModuleQueueContext";
import { useSafeMigration } from "@/hooks/useSafeMigration";
import { useOldSafeBalances } from "@/hooks/useOldSafeBalances";
import { Skeleton } from "@/components/ui/skeleton";
import { buttonVariants } from "@/components/ui/button";
import { useCallback } from "react";
import { Link } from "react-router-dom";
import { isAddress, type Address } from "viem";

export const WithdrawLegacyRoute = () => {
  const { oldSafe, isLoading: isMigrationLoading } = useSafeMigration();
  const oldSafeAddress = oldSafe?.address && isAddress(oldSafe.address) ? (oldSafe.address as Address) : undefined;
  const { currenciesWithBalance, isLoading, isError, refetch } = useOldSafeBalances(oldSafeAddress);

  const handleTransactionExecuted = useCallback(() => {
    refetch();
  }, [refetch]);

  if (isMigrationLoading) {
    return (
      <div className="grid grid-cols-6 gap-4 h-full m-4 lg:m-0 lg:mt-4">
        <div className="col-span-6 lg:col-start-2 lg:col-span-4">
          <Skeleton className="h-40 w-full" />
        </div>
      </div>
    );
  }

  if (!oldSafeAddress) {
    return (
      <div className="grid grid-cols-6 gap-4 h-full m-4 lg:m-0 lg:mt-4">
        <div className="col-span-6 lg:col-start-2 lg:col-span-4">
          <div className="flex flex-col items-center gap-4 bg-card p-8 rounded-lg text-center">
            <h2 className="font-bold text-secondary text-lg">No previous Safe found</h2>
            <p className="text-sm text-muted-foreground">
              We couldn't find a previous Safe with recoverable funds for your account.
            </p>
            <Link to="/withdraw" className={buttonVariants()}>
              Go to withdraw
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <DelayModuleQueueContextProvider
      safeAddress={oldSafeAddress}
      kind="legacy"
      onTransactionExecuted={handleTransactionExecuted}
    >
      <div className="grid grid-cols-6 gap-4 h-full m-4 lg:m-0 lg:mt-4">
        <div className="col-span-6 lg:col-start-2 lg:col-span-4">
          <div className="flex flex-col gap-4">
            <OnchainBalance currenciesWithBalance={currenciesWithBalance} isLoading={isLoading} isError={isError} />
            <DelayModuleQueue />
            <WithdrawFundsForm
              safeAddress={oldSafeAddress}
              kind="legacy"
              currenciesWithBalance={currenciesWithBalance}
              isLoadingBalances={isLoading}
              onSuccess={handleTransactionExecuted}
            />
          </div>
        </div>
      </div>
    </DelayModuleQueueContextProvider>
  );
};
