import { OnchainBalance } from "@/components/OnchainBalance";
import { WithdrawFundsForm } from "@/components/WithdrawFundsForm";
import { DelayModuleQueue } from "@/components/DelayModuleQueue/DelayModuleQueue";
import { useTokenBalance } from "@/hooks/useTokenBalance";
import { DelayModuleQueueContextProvider } from "@/context/DelayModuleQueueContext";
import { useCallback } from "react";

export const WithdrawRoute = () => {
  const { refetch: refetchBalance } = useTokenBalance();

  const handleTransactionExecuted = useCallback(() => {
    refetchBalance();
  }, [refetchBalance]);

  return (
    <DelayModuleQueueContextProvider onTransactionExecuted={handleTransactionExecuted}>
      <div className="grid grid-cols-6 gap-4 h-full m-4 lg:m-0 lg:mt-4">
        <div className="col-span-6 lg:col-start-2 lg:col-span-4">
          <div className="flex flex-col gap-4">
            <OnchainBalance />
            <DelayModuleQueue />
            <WithdrawFundsForm onSuccess={handleTransactionExecuted} />
          </div>
        </div>
      </div>
    </DelayModuleQueueContextProvider>
  );
};
