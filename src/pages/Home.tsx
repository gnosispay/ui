import { Cards } from "../components/cards";
import { Balances } from "@/components/balances";
import { AddFundsModal } from "@/components/modals/add-funds/add-funds";
import { SendFundsModal } from "@/components/modals/send-funds/send-funds";
import { Transactions } from "@/components/transactions/transactions";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

export const Home = () => {
  const [sendFundsModalOpen, setSendFundsModalOpen] = useState(false);
  const [addFundsModalOpen, setAddFundsModalOpen] = useState(false);

  return (
    <div className="grid grid-cols-6 gap-4 h-full mt-4">
      <div className="col-span-6 lg:col-start-2 lg:col-span-4">
        <Balances />
        <div className="mb-12 mt-4 flex gap-4">
          <Button onClick={() => setSendFundsModalOpen(true)}>Send funds</Button>
          <Button onClick={() => setAddFundsModalOpen(true)}>Add funds</Button>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-3 mx-4 lg:mx-0 lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h1 className="font-bold text-secondary">Transactions</h1>
              <Link to="/transactions" className="flex items-center gap-2">
                View all <ChevronRight size={16} />
              </Link>
            </div>
            <Transactions history={7} />
          </div>
          <div className="col-span-3 mx-4 lg:mx-0 lg:col-span-1 lg:col-start-3">
            <div className="flex items-center justify-between mb-4">
              <h1 className="font-bold text-secondary">Cards</h1>
              <Link to="/cards" className="flex items-center gap-2">
                View details <ChevronRight size={16} />
              </Link>
            </div>
            <Cards />
          </div>
        </div>
      </div>
      <SendFundsModal open={sendFundsModalOpen} onOpenChange={setSendFundsModalOpen} />
      <AddFundsModal open={addFundsModalOpen} onOpenChange={setAddFundsModalOpen} />
    </div>
  );
};
