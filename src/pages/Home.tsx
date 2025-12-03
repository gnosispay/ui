import { Cards } from "../components/cards";
import { Balances } from "@/components/balances";
import { AddFundsModal } from "@/components/modals/add-funds/add-funds";
import { SendFundsModal } from "@/components/modals/send-funds/send-funds";
import { Transactions } from "@/components/transactions/transactions";
import { PendingCardOrder } from "@/components/pending-card-order";
import { Rewards } from "@/components/rewards";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { StatusHelpIcon } from "@/components/ui/status-help-icon";
import { PartnerBanner } from "@/components/ui/partner-banner";
import { IbanBanner } from "@/components/ui/iban-banner";
import { UnspendableAmountAlert } from "@/components/unspendable-amount-alert";
import { predictAddresses } from "@gnosispay/account-kit";
import { useUser } from "@/context/UserContext";

export const Home = () => {
  const [sendFundsModalOpen, setSendFundsModalOpen] = useState(false);
  const [addFundsModalOpen, setAddFundsModalOpen] = useState(false);
  const { safeConfig } = useUser();

  useEffect(() => {
    if (!safeConfig?.address) return;
    try {
      console.log("predictAddresses", predictAddresses(safeConfig.address).delay);
      console.log("should be 0xf790dfD01a0Df68e82fE72614b03247042e99936");
    } catch (error) {
      console.error("Error predicting addresses:", error);
    }
  }, [safeConfig]);

  return (
    <div className="grid grid-cols-6 gap-4 h-full mt-4">
      <div className="col-span-6 lg:col-start-2 lg:col-span-4">
        <div className="mx-4 lg:mx-0">
          <PendingCardOrder />
          <UnspendableAmountAlert />
        </div>

        <div className="lg:grid lg:grid-cols-3 lg:gap-x-4">
          {/* Balances - Row 1 Left on desktop */}
          <div className="mx-4 lg:mx-0 lg:col-span-2 lg:row-start-1">
            <Balances />
            <div className="mb-12 mt-4 flex gap-4 mx-4 lg:mx-0">
              <Button onClick={() => setSendFundsModalOpen(true)}>Send funds</Button>
              <Button onClick={() => setAddFundsModalOpen(true)}>Add funds</Button>
            </div>
          </div>

          {/* Banners - After Balances on mobile, Row 1 Right on desktop */}
          <div className="m-4 lg:mx-0 lg:mb-0 lg:col-span-1 lg:col-start-3 lg:row-start-1">
            <PartnerBanner />
            <IbanBanner />
          </div>

          {/* Rewards and Cards - After Partner on mobile, Row 2 Right on desktop */}
          <div className="m-4 lg:m-0 lg:col-span-1 lg:col-start-3 lg:row-start-2">
            <div className="flex items-center justify-between mb-4">
              <h1 className="font-bold text-secondary text-lg">
                Rewards <StatusHelpIcon type="rewards" />
              </h1>
            </div>
            <Rewards />
            <div className="flex items-center justify-between mb-4 mt-6">
              <h1 className="font-bold text-secondary text-lg">Cards</h1>
              <Link to="/cards" className="flex items-center gap-2">
                View details <ChevronRight size={16} />
              </Link>
            </div>
            <Cards />
          </div>

          {/* Transactions - Last on mobile, Row 2 Left on desktop */}
          <div className="mx-4 lg:mx-0 lg:col-span-2 lg:row-start-2">
            <div className="flex items-center justify-between mb-4">
              <h1 className="font-bold text-secondary text-lg">Transactions</h1>
            </div>
            <Transactions />
          </div>
        </div>
      </div>
      <SendFundsModal open={sendFundsModalOpen} onOpenChange={setSendFundsModalOpen} />
      <AddFundsModal open={addFundsModalOpen} onOpenChange={setAddFundsModalOpen} />
    </div>
  );
};
