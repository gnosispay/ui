import { type CardInfo, useCards } from "@/context/CardsContext";
import { CreditCard, Smartphone, EllipsisVertical, CircleX, Ban, EyeIcon, EyeClosed } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "./ui/button";
import type { Card as CardType } from "@/client";
import { useCallback, useMemo, useState } from "react";
import { ConfirmDangerousActionModal } from "./modals/confirm-dangerous-action";
import { usePSE } from "@/context/PSEContext";
import { toast } from "sonner";
import type GPSDK from "@gnosispay/pse-sdk";
import { ElementType } from "@gnosispay/pse-sdk";
import { ChangePinModal } from "./modals/change-pin";

interface Props {
  card: CardType;
  cardInfo: CardInfo;
}

export const Card = ({ card, cardInfo }: Props) => {
  const { freezeCard, unfreezeCard, markCardAsStolen, markCardAsLost } = useCards();
  const [isConfirmingStolen, setIsConfirmingStolen] = useState(false);
  const [isConfirmingLost, setIsConfirmingLost] = useState(false);
  const [isChangePinModalOpen, setIsChangePinModalOpen] = useState(false);
  const { getGpSdk } = usePSE();
  const [cardDataIframe, setCardDataIframe] = useState<ReturnType<GPSDK["init"]> | null>(null);
  const [pinIframe, setPinIframe] = useState<ReturnType<GPSDK["init"]> | null>(null);
  const cardDataId = useMemo(() => `pse-card-data-${card.id}`, [card.id]);
  const pinId = useMemo(() => `pse-pin-data-${card.id}`, [card.id]);

  const showCardDetails = useCallback(
    async (cardToken: string | undefined) => {
      if (!cardToken) {
        const errorMessage = "No card token";
        console.error(errorMessage);
        toast.error(errorMessage);
        return;
      }

      const gpSdk = await getGpSdk();
      if (!gpSdk) {
        const errorMessage = "PSE SDK not initialized";
        console.error(errorMessage);
        toast.error(errorMessage);
        return;
      }

      const cd = gpSdk.init(ElementType.CardData, `#${cardDataId}`, {
        cardToken,
      });

      setCardDataIframe(cd);
    },
    [getGpSdk, cardDataId],
  );

  const hideCardDetails = useCallback(() => {
    if (!cardDataIframe) {
      return;
    }

    cardDataIframe.destroy();
    setCardDataIframe(null);
  }, [cardDataIframe]);

  const showPin = useCallback(
    async (cardToken: string | undefined) => {
      if (!cardToken) {
        const errorMessage = "No card token";
        console.error(errorMessage);
        toast.error(errorMessage);
        return;
      }

      const gpSdk = await getGpSdk();
      if (!gpSdk) {
        const errorMessage = "PSE SDK not initialized";
        console.error(errorMessage);
        toast.error(errorMessage);
        return;
      }

      const pin = gpSdk.init(ElementType.CardPin, `#${pinId}`, {
        cardToken,
      });

      setPinIframe(pin);
    },
    [getGpSdk, pinId],
  );

  const hidePinDetails = useCallback(() => {
    if (!pinIframe) {
      return;
    }

    pinIframe.destroy();
    setPinIframe(null);
  }, [pinIframe]);

  const markAsStolen = useCallback(async () => {
    await markCardAsStolen(card.id);
  }, [markCardAsStolen, card]);

  const markAsLost = useCallback(async () => {
    await markCardAsLost(card.id);
  }, [markCardAsLost, card]);

  const cardProblem = cardInfo.isBlocked
    ? "Blocked"
    : cardInfo.isFrozen
      ? "Frozen"
      : cardInfo.isLost
        ? "Lost"
        : cardInfo.isStolen
          ? "Stolen"
          : null;

  return (
    <div
      key={card.id}
      className={`relative border rounded-lg p-4 shadow-sm bg-card border-border ${
        !card.activatedAt ? "opacity-50" : ""
      }`}
    >
      <div className="absolute top-2 right-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="link" className="p-2 hover:bg-muted">
              <EllipsisVertical className="w-5 h-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {!card.virtual && (
              <DropdownMenuItem
                onClick={() => {
                  setIsChangePinModalOpen(true);
                }}
              >
                Change pin
              </DropdownMenuItem>
            )}
            {cardInfo?.isFrozen && (
              <DropdownMenuItem
                onClick={() => {
                  unfreezeCard(card.id);
                }}
              >
                Unfreeze
              </DropdownMenuItem>
            )}
            {!cardInfo?.isFrozen && (
              <DropdownMenuItem
                onClick={() => {
                  freezeCard(card.id);
                }}
              >
                Freeze
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              onClick={() => {
                setIsConfirmingStolen(true);
              }}
            >
              Report Stolen
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                setIsConfirmingLost(true);
              }}
            >
              Report Lost
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <p className="flex items-center gap-2 text-muted-foreground">
        {card.virtual ? <Smartphone /> : <CreditCard />} {card.virtual ? "Virtual" : "Physical"}
      </p>

      {/* ---------CARD ITEM--------- */}
      {!cardDataIframe && (
        <div className="flex items-center gap-2">
          <p className="font-medium text-card-foreground">●●●● ●●●● ●●●● {card.lastFourDigits}</p>
          <Button variant="link" className="p-2 hover:bg-muted" onClick={() => showCardDetails(card.cardToken)}>
            <EyeClosed size={16} />
          </Button>
        </div>
      )}
      <div className={`flex items-center gap-2 ${cardDataIframe ? "mt-2" : "mt-0"}`}>
        <p id={cardDataId} />
        {cardDataIframe && (
          <Button variant="link" className="p-2 hover:bg-muted" onClick={hideCardDetails}>
            <EyeIcon size={16} />
          </Button>
        )}
      </div>

      {/* ---------PIN ITEM--------- */}
      {!card.virtual && (
        <>
          {!pinIframe && (
            <div className="flex items-center gap-2">
              <p className="font-medium text-card-foreground">Pin: ●●●●</p>
              <Button variant="link" className="p-2 hover:bg-muted" onClick={() => showPin(card.cardToken)}>
                <EyeClosed size={16} />
              </Button>
            </div>
          )}
          <div className={`flex items-center gap-2 ${pinIframe ? "h-5" : "h-0"}`}>
            <p id={pinId} className={pinIframe ? "h-5" : "h-0"} />
            {pinIframe && (
              <Button variant="link" className="p-2 hover:bg-muted" onClick={hidePinDetails}>
                <EyeIcon size={16} />
              </Button>
            )}
          </div>
        </>
      )}

      {!card.activatedAt && (
        <p className="flex items-center gap-2 text-muted-foreground mt-2">
          <Ban /> Inactive
        </p>
      )}
      {cardProblem && (
        <p className="flex items-center gap-2 text-destructive mt-2">
          <CircleX /> {cardProblem}
        </p>
      )}
      {isConfirmingStolen && (
        <ConfirmDangerousActionModal
          onClose={() => setIsConfirmingStolen(false)}
          message="Are you sure you want to report this card as stolen? This action cannot be undone."
          action={markAsStolen}
        />
      )}
      {isConfirmingLost && (
        <ConfirmDangerousActionModal
          onClose={() => setIsConfirmingLost(false)}
          message="Are you sure you want to report this card as lost? This action cannot be undone."
          action={markAsLost}
        />
      )}
      {isChangePinModalOpen && <ChangePinModal onClose={() => setIsChangePinModalOpen(false)} card={card} />}
    </div>
  );
};
