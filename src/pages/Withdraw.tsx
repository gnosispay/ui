import { OnchainBalance } from "@/components/OnchainBalance";

export const WithdrawRoute = () => {
  return (
    <div className="grid grid-cols-6 gap-4 h-full m-4 lg:m-0 lg:mt-4">
      <div className="col-span-6 lg:col-start-2 lg:col-span-4">
        <div className="flex flex-col gap-4">
          <h1 className="font-bold text-primary text-2xl">Withdraw Funds</h1>
          <p className="text-muted-foreground">
            Your account has been deactivated. You can withdraw your remaining token balances.
          </p>
          <OnchainBalance />
        </div>
      </div>
    </div>
  );
};
