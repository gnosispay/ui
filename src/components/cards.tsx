import { useCards } from "@/context/CardsContext";
import { Skeleton } from "./ui/skeleton";
import { CardsOrderModal } from "./modals/cards-order.tsx/cards-order";
import CardFront from "./cards-carousel/card-front";
import { PlusIcon } from "lucide-react";
import { useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";

export const Cards = () => {
  const { cards, cardInfoMap } = useCards();
  const navigate = useNavigate();
  const isLoading = useMemo(() => !cards || !cardInfoMap, [cards, cardInfoMap]);
  const [open, setOpen] = useState(false);

  const handleAddCard = useCallback(() => {
    setOpen(true);
  }, []);

  const handleCardClick = useCallback(
    (index: number) => {
      if (index === 0) {
        navigate("/cards");
      } else {
        navigate(`/cards?cardIndex=${index}`);
      }
    },
    [navigate],
  );

  return (
    <>
      <div className="flex flex-col gap-4 bg-card p-4 rounded-xl">
        {isLoading &&
          [1, 2, 3].map((i) => (
            <div key={`skeleton-${i}`} className="flex items-center gap-4">
              <Skeleton className="rounded-sm w-17 h-14" />
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
        {!isLoading &&
          cards?.map((card, index) => (
            <button
              key={card.id}
              type="button"
              className="flex items-center gap-4 w-full text-left hover:bg-muted/50 rounded-lg p-2 -m-2 transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              onClick={() => handleCardClick(index)}
              aria-label={`Go to card ending in ${card.lastFourDigits}`}
            >
              <CardFront className="rounded-sm w-17" />
              <div className="flex flex-col gap-2">
                <div className="text-sm text-primary">
                  <span className="mr-2">•••</span>
                  {card.lastFourDigits}
                </div>
                <div className="text-sm font-light text-secondary">{card.virtual ? "Virtual" : "Physical"}</div>
              </div>
            </button>
          ))}
        <div className="flex items-center gap-4">
          <button
            type="button"
            className="cursor-pointer rounded-sm w-17 h-11 bg-muted flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
