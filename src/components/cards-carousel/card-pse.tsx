import { CreditCard, Eye, Snowflake, AlertOctagon, Loader2, Sun } from "lucide-react";
import { CardActionButton } from "./card-action-button";
import type { Card } from "@/client";
import { useGpSdk } from "@/hooks/useGpSdk";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogTitle } from "../ui/dialog";
import { useState } from "react";
import { useCards } from "@/context/CardsContext";
import { ReportCardModal } from "../modals/report-card";

export const CardPSE = ({ card }: { card: Card }) => {
  const { showCardDetails, showPin, isLoading } = useGpSdk();
  const { freezeCard, unfreezeCard, markCardAsStolen, markCardAsLost, cardInfoMap } = useCards();
  const [isPSEModalOpen, setIsPSEModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  const onShowCardDetails = (cardToken?: string) => {
    if (!cardToken) {
      toast.error("No card token");
      return;
    }

    try {
      showCardDetails(cardToken, "pse-iframe");
      setIsPSEModalOpen(true);
    } catch (error) {
      console.error(error);
      toast.error("Error showing card details");
    }
  };

  const onShowPin = (cardToken?: string) => {
    if (!cardToken) {
      toast.error("No card token");
      return;
    }

    try {
      showPin(cardToken, "pse-iframe");
      setIsPSEModalOpen(true);
    } catch (error) {
      console.error(error);
      toast.error("Error showing PIN");
    }
  };

  const cardInfo = cardInfoMap?.[card.id];

  return (
    <>
      <div className="flex gap-8">
        <CardActionButton
          icon={<CreditCard size={22} className="text-white" />}
          label="Show details"
          onClick={() => onShowCardDetails(card.cardToken)}
        />
        <CardActionButton
          icon={<Eye size={22} className="text-white" />}
          label="See PIN"
          onClick={() => onShowPin(card.cardToken)}
        />
        {cardInfo?.isFrozen ? (
          <CardActionButton
            icon={<Sun size={22} className="text-white" />}
            label="Unfreeze"
            onClick={() => unfreezeCard(card.id)}
          />
        ) : (
          <CardActionButton
            icon={<Snowflake size={22} className="text-white" />}
            label="Freeze"
            onClick={() => freezeCard(card.id)}
          />
        )}
        <CardActionButton
          icon={<AlertOctagon size={22} className="text-white" />}
          label="Report"
          onClick={() => setIsReportModalOpen(true)}
        />
      </div>

      <Dialog open={isPSEModalOpen} onOpenChange={setIsPSEModalOpen}>
        <DialogContent aria-describedby={undefined}>
          <DialogTitle>Card Details</DialogTitle>
          <div className="grid flex-1 gap-2">
            <div id="pse-iframe" />
          </div>
          {isLoading && (
            <div className="flex h-full items-center justify-center">
              <Loader2 className="h-10 w-10 animate-spin" />
            </div>
          )}
        </DialogContent>
      </Dialog>

      {isReportModalOpen && (
        <ReportCardModal
          onClose={() => setIsReportModalOpen(false)}
          onReportAsLost={() => markCardAsLost(card.id)}
          onReportAsStolen={() => markCardAsStolen(card.id)}
        />
      )}
    </>
  );
};
