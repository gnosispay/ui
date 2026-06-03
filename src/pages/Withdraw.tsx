import { OnchainBalance } from "@/components/OnchainBalance";
import { WithdrawFundsForm } from "@/components/WithdrawFundsForm";
import { DelayModuleQueue } from "@/components/DelayModuleQueue/DelayModuleQueue";
import { useTokenBalance } from "@/hooks/useTokenBalance";
import { DelayModuleQueueContextProvider } from "@/context/DelayModuleQueueContext";
import { useUser } from "@/context/UserContext";
import { useCallback } from "react";
import type { Address } from "viem";

export const WithdrawRoute = () => {
  const { safeConfig } = useUser();
  const { currenciesWithBalance, isLoading, isError, refetch } = useTokenBalance();
  const safeAddress = safeConfig?.address as Address | undefined;

  const handleTransactionExecuted = useCallback(() => {
    refetch();
  }, [refetch]);

  if (!safeAddress) {
    return null;
  }

  return (
    <DelayModuleQueueContextProvider
      safeAddress={safeAddress}
      kind="next"
      onTransactionExecuted={handleTransactionExecuted}
    >
      <div className="grid grid-cols-6 gap-4 h-full m-4 lg:m-0 lg:mt-4">
        <div className="col-span-6 lg:col-start-2 lg:col-span-4">
          <div className="flex flex-col gap-4">
            <OnchainBalance currenciesWithBalance={currenciesWithBalance} isLoading={isLoading} isError={isError} />
            <DelayModuleQueue />
            <WithdrawFundsForm
              safeAddress={safeAddress}
              kind="next"
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
