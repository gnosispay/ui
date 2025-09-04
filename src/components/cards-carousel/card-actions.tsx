import {
  CreditCard,
  Eye,
  Snowflake,
  AlertOctagon,
  Loader2,
  Sun,
  MoreHorizontal,
  MailCheck,
  EyeOff,
} from "lucide-react";
import { IconButton } from "../ui/icon-button";
import type { Card } from "@/client";
import { useGpSdk } from "@/hooks/useGpSdk";
import { toast } from "sonner";
import { Dialog } from "../ui/dialog";
import { useMemo, useState } from "react";
import { useCards } from "@/context/CardsContext";
import { ReportCardModal } from "../modals/report-card";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "../ui/dropdown-menu";

import { PSEDialogContent, PSEDialogTitle } from "../PSEDialog";
import { ConfirmationDialog } from "../modals/confirmation-dialog";
import { Switch } from "../ui/switch";

const PSE_IFRAME_ID = "pse-iframe";

export const CardActions = ({
  card,
  onToggleVoidedCardsVisibility,
}: {
  card: Card;
  onToggleVoidedCardsVisibility: () => void;
}) => {
  const { showCardDetails, showPin, isLoading } = useGpSdk();
  const { freezeCard, unfreezeCard, markCardAsStolen, markCardAsLost, cardInfoMap, activateCard, isHideVoidedCards } =
    useCards();
  const [isCardDetailsModalOpen, setIsCardDetailsModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isActivationDialogOpen, setIsActivationDialogOpen] = useState(false);
  const cardInfo = useMemo(() => {
    if (!card.cardToken || !cardInfoMap) {
      return undefined;
    }

    return cardInfoMap[card.cardToken];
  }, [card.cardToken, cardInfoMap]);
  const canReport =
    !!card.activatedAt && !cardInfo?.isFrozen && !cardInfo?.isStolen && !cardInfo?.isLost && !cardInfo?.isVoid;

  const onShowCardDetails = (cardToken?: string) => {
    if (!cardToken) {
      toast.error("No card token");
      return;
    }

    try {
      showCardDetails(cardToken, PSE_IFRAME_ID);
      setIsCardDetailsModalOpen(true);
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
      setIsCardDetailsModalOpen(true);
    } catch (error) {
      console.error(error);
      toast.error("Error showing PIN");
    }
  };

  const onConfirmActivation = () => {
    activateCard(card.id);
    setIsActivationDialogOpen(false);
  };

  return (
    <>
      <div className="flex flex-wrap gap-4 lg:gap-8 justify-center">
        {!card.activatedAt && (
          <IconButton
            icon={<MailCheck size={22} />}
            label="Activate"
            onClick={() => setIsActivationDialogOpen(true)}
            size="lg"
          />
        )}
        <IconButton
          icon={<CreditCard size={22} />}
          label="Show details"
          onClick={() => onShowCardDetails(card.cardToken)}
          size="lg"
          variant="default"
        />
        <IconButton
          icon={<Eye size={22} />}
          label="See PIN"
          onClick={() => onShowPin(card.cardToken)}
          size="lg"
          variant="default"
          disabled={card.virtual}
        />
        {cardInfo?.isFrozen ? (
          <IconButton
            icon={<Sun size={22} />}
            label="Unfreeze"
            onClick={() => unfreezeCard(card.id)}
            size="lg"
            variant="default"
          />
        ) : (
          <IconButton
            icon={<Snowflake size={22} />}
            label="Freeze"
            onClick={() => freezeCard(card.id)}
            size="lg"
            variant="default"
          />
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <span>
              <IconButton icon={<MoreHorizontal size={22} />} label="More" size="lg" variant="default" />
            </span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={(e) => {
                e.preventDefault();
                onToggleVoidedCardsVisibility();
              }}
              className="flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <EyeOff size={22} />
                Hide voided cards
              </div>
              <Switch
                checked={isHideVoidedCards}
                onCheckedChange={onToggleVoidedCardsVisibility}
                onClick={(e) => e.stopPropagation()}
              />
            </DropdownMenuItem>

            {canReport && (
              <DropdownMenuItem onClick={() => setIsReportModalOpen(true)}>
                <AlertOctagon size={22} /> Report
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Dialog open={isCardDetailsModalOpen} onOpenChange={setIsCardDetailsModalOpen}>
        <PSEDialogContent>
          <PSEDialogTitle>Card Details</PSEDialogTitle>
          <div className="grid flex-1 gap-2">
            <div id={PSE_IFRAME_ID} />
          </div>
          {isLoading && (
            <div className="flex h-full items-center justify-center">
              <Loader2 className="h-10 w-10 animate-spin" />
            </div>
          )}
        </PSEDialogContent>
      </Dialog>

      {isReportModalOpen && (
        <ReportCardModal
          onClose={() => setIsReportModalOpen(false)}
          onReportAsLost={() => markCardAsLost(card.id)}
          onReportAsStolen={() => markCardAsStolen(card.id)}
        />
      )}

      <ConfirmationDialog
        open={isActivationDialogOpen}
        onOpenChange={setIsActivationDialogOpen}
        title="Activate Card"
        iconColor="text-warning"
        message="Only activate your card if you have physically received it."
        confirmText="Activate Card"
        onConfirm={onConfirmActivation}
      />
    </>
  );
};
