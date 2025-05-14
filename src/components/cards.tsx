import { useUser } from "@/context/UserContext";
import { CreditCard, OctagonX, Smartphone, EllipsisVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "./ui/button";

export const Cards = () => {
  const { cards, cardInfoMap } = useUser();

  if (!cards) {
    return;
  }

  if (cards.length === 0) {
    return <div className="text-center text-muted-foreground">No cards found.</div>;
  }

  return (
    <div className="p-6">
      <h1 className="flex items-center gap-2 text-2xl font-bold mb-6 text-foreground">
        <CreditCard className="w-6 h-6" />
        Cards
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card) => {
          const cardInfo = cardInfoMap?.[card.id];

          const cardProblem = cardInfo?.isBlocked
            ? "Blocked"
            : cardInfo?.isFrozen
              ? "Frozen"
              : cardInfo?.isLost
                ? "Lost"
                : cardInfo?.isStolen
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
                    <DropdownMenuItem onClick={() => console.log("View details")}>View Details</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => console.log("Edit card")}>Edit Card</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => console.log("Delete card")}>Delete Card</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <p className="font-medium text-card-foreground">●●●● ●●●● ●●●● {card.lastFourDigits}</p>
              <p className="flex items-center gap-2 text-muted-foreground">
                {card.virtual ? <Smartphone /> : <CreditCard />} {card.virtual ? "Virtual" : "Physical"}
              </p>
              {!card.activatedAt && (
                <p className="flex items-center gap-2 text-muted-foreground">
                  <OctagonX /> Inactive
                </p>
              )}
              {cardProblem && <p className="text-destructive">{cardProblem}</p>}
            </div>
          );
        })}
      </div>
    </div>
  );
};
