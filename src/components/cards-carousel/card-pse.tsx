import { CreditCard, Eye, Snowflake, AlertOctagon, Loader2, Sun } from "lucide-react";
import { IconButton } from "../ui/icon-button";
import type { Card } from "@/client";
import { useGpSdk } from "@/hooks/useGpSdk";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogTitle } from "../ui/dialog";
import { useState } from "react";
import { useCards } from "@/context/CardsContext";
import { ReportCardModal } from "../modals/report-card";

const PSE_IFRAME_ID = "pse-iframe";

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
      showCardDetails(cardToken, PSE_IFRAME_ID);
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
      showPin(cardToken, PSE_IFRAME_ID);
      setIsPSEModalOpen(true);
    } catch (error) {
      console.error(error);
      toast.error("Error showing PIN");
    }
  };

  const cardInfo = cardInfoMap?.[card.id];

  return (
    <>
      <div className="flex flex-wrap gap-4 lg:gap-8 justify-center">
        <IconButton
          icon={<CreditCard size={22} className="text-white" />}
          label="Show details"
          onClick={() => onShowCardDetails(card.cardToken)}
          size="lg"
          variant="default"
        />
        <IconButton
          icon={<Eye size={22} className="text-white" />}
          label="See PIN"
          onClick={() => onShowPin(card.cardToken)}
          size="lg"
          variant="default"
          disabled={card.virtual}
        />
        {cardInfo?.isFrozen ? (
          <IconButton
            icon={<Sun size={22} className="text-white" />}
            label="Unfreeze"
            onClick={() => unfreezeCard(card.id)}
            size="lg"
            variant="default"
          />
        ) : (
          <IconButton
            icon={<Snowflake size={22} className="text-white" />}
            label="Freeze"
            onClick={() => freezeCard(card.id)}
            size="lg"
            variant="default"
          />
        )}
        <IconButton
          icon={<AlertOctagon size={22} className="text-white" />}
          label="Report"
          onClick={() => setIsReportModalOpen(true)}
          size="lg"
          variant="default"
        />
      </div>

      <Dialog open={isPSEModalOpen} onOpenChange={setIsPSEModalOpen}>
        <DialogContent aria-describedby={undefined}>
          <DialogTitle>Card Details</DialogTitle>
          <div className="grid flex-1 gap-2">
            <div id={PSE_IFRAME_ID} />
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
