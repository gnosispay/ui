import { CardsCarousel } from "@/components/cards-carousel/cards-carousel";
import { CardsOrderModal } from "@/components/modals/cards-order.tsx";
import { PendingCardOrder } from "@/components/pending-card-order";
import { Button } from "@/components/ui/button";
import { InboxIcon, PlusIcon } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { useCards } from "@/context/CardsContext";
import { CardActions } from "@/components/cards-carousel/card-actions";
import { CardTransactions } from "@/components/transactions/card-transactions";

export const CardsRoute = () => {
  const [open, setOpen] = useState(false);
  const { cards, isHideVoidedCards, setIsHideVoidedCards } = useCards();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedCardIndex, setSelectedCardIndex] = useState(0);
  const selectedCard = cards && cards.length > 0 ? cards[selectedCardIndex] : undefined;

  // Track if we're updating the URL ourselves to prevent circular updates
  const isUpdatingUrl = useRef(false);

  // Initialize selected index from URL parameter (only when not updating URL ourselves)
  useEffect(() => {
    if (isUpdatingUrl.current) {
      isUpdatingUrl.current = false;
      return;
    }

    const cardIndexParam = searchParams.get("cardIndex");
    if (cardIndexParam !== null && cards && cards.length > 0) {
      const index = parseInt(cardIndexParam, 10);
      if (!Number.isNaN(index) && index >= 0 && index < cards.length) {
        setSelectedCardIndex(index);
      } else {
        console.error("Invalid card index from URL", index);
        setSelectedCardIndex(0);
      }
    }
  }, [searchParams, cards]);

  // Update URL when selected index changes
  useEffect(() => {
    isUpdatingUrl.current = true;
    const newParams = new URLSearchParams(searchParams);
    if (selectedCardIndex === 0) {
      newParams.delete("cardIndex");
    } else {
      newParams.set("cardIndex", selectedCardIndex.toString());
    }
    setSearchParams(newParams, { replace: true });
  }, [selectedCardIndex, searchParams, setSearchParams]);

  // Reset selected index when cards are filtered or when selected index is out of bounds
  useEffect(() => {
    if (cards && selectedCardIndex >= cards.length) {
      setSelectedCardIndex(0);
    }
  }, [cards, selectedCardIndex]);

  // Toggle voided cards visibility and reset selected index
  const handleToggleVoidedCardsVisibility = () => {
    setIsHideVoidedCards(!isHideVoidedCards);
    setSelectedCardIndex(0);
  };

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
          <CardsCarousel currentIndex={selectedCardIndex} setCurrentIndex={setSelectedCardIndex} />
          <div className="flex-1 flex items-center justify-center">
            {selectedCard && (
              <CardActions card={selectedCard} onToggleVoidedCardsVisibility={handleToggleVoidedCardsVisibility} />
            )}
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
            <div className="flex flex-col gap-4 bg-card p-4 rounded-lg">
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
