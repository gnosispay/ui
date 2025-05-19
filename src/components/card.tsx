import { type CardInfo, useCards } from "@/context/CardsContext";
import { CreditCard, Smartphone, EllipsisVertical, CircleX, Ban } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "./ui/button";
import type { Card as CardType } from "@/client";
import { useCallback, useState } from "react";
import { ConfirmDangerousActionModal } from "./modals/confirm-dangerous-action";

interface Props {
  card: CardType;
  cardInfo: CardInfo;
}

export const Card = ({ card, cardInfo }: Props) => {
  const { freezeCard, unfreezeCard, markCardAsStolen, markCardAsLost } = useCards();
  const [isConfirmingStolen, setIsConfirmingStolen] = useState(false);
  const [isConfirmingLost, setIsConfirmingLost] = useState(false);

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
      <p className="font-medium text-card-foreground">●●●● ●●●● ●●●● {card.lastFourDigits}</p>
      <p className="flex items-center gap-2 text-muted-foreground">
        {card.virtual ? <Smartphone /> : <CreditCard />} {card.virtual ? "Virtual" : "Physical"}
      </p>
      {!card.activatedAt && (
        <p className="flex items-center gap-2 text-muted-foreground">
          <Ban /> Inactive
        </p>
      )}
      {cardProblem && (
        <p className="flex items-center gap-2 text-destructive">
          <CircleX />
          {cardProblem}
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
    </div>
  );
};
