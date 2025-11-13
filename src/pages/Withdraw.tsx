import { OnchainBalance } from "@/components/OnchainBalance";
import { WithdrawFundsForm } from "@/components/WithdrawFundsForm";
import { DelayModuleQueue } from "@/components/DelayModuleQueue";
import { useTokenBalance } from "@/hooks/useTokenBalance";
import { useDelayModuleQueue } from "@/hooks/useDelayModuleQueue";
import { useCallback } from "react";

export const WithdrawRoute = () => {
  const { refetch: refetchBalance } = useTokenBalance();
  const { refetch: refetchQueue } = useDelayModuleQueue();

  const handleWithdrawSuccess = useCallback(() => {
    refetchBalance();
    refetchQueue();
  }, [refetchBalance, refetchQueue]);

  const handleTransactionExecuted = useCallback(() => {
    refetchBalance();
    refetchQueue();
  }, [refetchBalance, refetchQueue]);

  return (
    <div className="grid grid-cols-6 gap-4 h-full m-4 lg:m-0 lg:mt-4">
      <div className="col-span-6 lg:col-start-2 lg:col-span-4">
        <div className="flex flex-col gap-4">
          <h1 className="font-bold text-primary text-2xl">Withdraw Funds</h1>

          <DelayModuleQueue onTransactionExecuted={handleTransactionExecuted} />
          <OnchainBalance />
          <WithdrawFundsForm onSuccess={handleWithdrawSuccess} />
        </div>
      </div>
    </div>
  );
};
