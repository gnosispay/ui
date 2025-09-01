import { CardsCarousel } from "@/components/cards-carousel/cards-carousel";
import { CardsOrderModal } from "@/components/modals/cards-order.tsx";
import { PendingCardOrder } from "@/components/pending-card-order";
import { Button } from "@/components/ui/button";
import { ChevronRight, InboxIcon, PlusIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useCards } from "@/context/CardsContext";
import { CardActions } from "@/components/cards-carousel/card-actions";
import { CardTransactions } from "@/components/transactions/card-transactions";
import { Link } from "react-router-dom";

export const CardsRoute = () => {
  const [open, setOpen] = useState(false);
  const { cards, hideVoidedCards } = useCards();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selectedCard = cards && cards.length > 0 ? cards[selectedIndex] : undefined;

  // Reset selected index when cards are filtered
  useEffect(() => {
    if (cards && selectedIndex >= cards.length) {
      setSelectedIndex(0);
    }
  }, [cards, selectedIndex]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: we actually want to reset the selected card 0 on hide/unhide
  useEffect(() => {
    setSelectedIndex(0);
  }, [hideVoidedCards]);

  return (
    <div className="grid grid-cols-6 gap-8 h-full mt-4 md:px-0">
      <div className="col-span-6 md:col-span-4 md:col-start-2 px-4 sm:px-0">
        <PendingCardOrder />
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Cards</h1>
          <Button variant="default" className="mt-6" onClick={() => setOpen(true)}>
            <PlusIcon className="w-4 h-4" />
            Add Card
          </Button>
        </div>
      </div>
      <div className="col-span-6 md:col-span-4 md:col-start-2">
        <div className="w-full flex flex-col lg:flex-row gap-6">
          <CardsCarousel currentIndex={selectedIndex} setCurrentIndex={setSelectedIndex} />
          <div className="flex-1 flex items-center justify-center">
            {selectedCard && <CardActions card={selectedCard} />}
          </div>
        </div>
      </div>
      <div className="col-span-6 mx-4 lg:mx-0 lg:col-span-4 lg:col-start-2">
        <div className="flex items-center justify-between mb-4">
          <h1 className="font-bold text-secondary">Transactions</h1>
        </div>
        <CardTransactions cardToken={selectedCard?.cardToken} />
      </div>
      {!cards ||
        (cards.length === 0 && (
          <div className="col-span-6 mx-4 lg:mx-0 lg:col-span-4 lg:col-start-2">
            <div className="flex flex-col gap-4 bg-card p-4 rounded-xl">
              <div className="flex flex-col items-center justify-center mt-4">
                <InboxIcon className="w-10 h-10 mb-2 text-secondary" />
                <div className="text-center text-secondary">No cards found.</div>
              </div>
            </div>
          </div>
        ))}
      <CardsOrderModal open={open} onOpenChange={setOpen} />
    </div>
  );
};
