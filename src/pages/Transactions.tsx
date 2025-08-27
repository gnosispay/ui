import { Transactions } from "@/components/transactions/transactions";

export const TransactionsRoute = () => {
  return (
    <div className="grid grid-cols-6 gap-4 h-full mt-4">
      <div className="col-span-6 mx-4 lg:mx-0 lg:col-span-4 lg:col-start-2">
        <h1 className="text-xl">Transactions</h1>
      </div>
      <div className="col-span-6 mx-4 lg:mx-0 lg:col-span-4 lg:col-start-2">
        <Transactions history={30} />
      </div>
    </div>
  );
};
