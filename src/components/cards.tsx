import { useCards } from "@/context/CardsContext";
import { Skeleton } from "./ui/skeleton";
import { CardsOrderModal } from "./modals/cards-order.tsx/cards-order";
import CardFront from "./cards-carousel/card-front";
import { PlusIcon } from "lucide-react";
import { useState } from "react";

export const Cards = () => {
  const { cards, cardInfoMap } = useCards();
  const loading = !cards || !cardInfoMap;
  const [open, setOpen] = useState(false);

  const handleAddCard = () => {
    setOpen(true);
  };

  return (
    <>
      <div className="flex flex-col gap-4 bg-card p-4 rounded-xl">
        {loading &&
          [1, 2, 3].map((i) => (
            <div key={`skeleton-${i}`} className="flex items-center gap-2">
              <Skeleton className="rounded-sm w-20 h-14" />
              <div className="flex flex-col gap-2">
                <div className="text-sm text-primary">
                  <Skeleton className="w-20 h-4" />
                </div>
                <div className="text-sm font-light text-secondary">
                  <Skeleton className="w-10 h-4" />
                </div>
              </div>
            </div>
          ))}
        {!!cards &&
          !!cardInfoMap &&
          cards.map((card) => (
            <div key={card.id} className="flex items-center gap-2">
              <CardFront className="rounded-sm w-20" />
              <div className="flex flex-col gap-2">
                <div className="text-sm text-primary">
                  <span className="mr-2">•••</span>
                  {card.lastFourDigits}
                </div>
                <div className="text-sm font-light text-secondary">{card.virtual ? "Virtual" : "Physical"}</div>
              </div>
            </div>
          ))}
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="cursor-pointer rounded-sm w-20 h-14 bg-muted flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            onClick={handleAddCard}
            aria-label="Add card"
          >
            <PlusIcon className="w-4 h-4" />
          </button>
          <div className="flex flex-col gap-2">
            <div className="text-sm text-primary">
              <span className="mr-2">Add card</span>
            </div>
          </div>
        </div>
      </div>
      <CardsOrderModal open={open} onOpenChange={setOpen} />
    </>
  );
};
