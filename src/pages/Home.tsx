import { Cards } from "../components/cards";
import { Balances } from "@/components/balances";
import { Transactions } from "@/components/transactions/transactions";

export const Home = () => {
  return (
    <div className="grid grid-cols-6 gap-4 h-full mt-4">
      <div className="col-span-6 lg:col-start-2 lg:col-span-4">
        <Balances />
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-3 mx-4 lg:mx-0 lg:col-span-2">
            <Transactions />
          </div>
          <div className="col-span-3 lg:col-span-1 lg:col-start-3">
            <h1 className="font-bold text-secondary my-4">Cards</h1>
            <Cards />
          </div>
        </div>
      </div>
    </div>
  );
};
