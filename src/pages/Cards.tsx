import { CardsCarousel } from "@/components/cards-carousel/cards-carousel";
import { VirtualCardsOrderModal } from "@/components/modals/virtual-cards-order";
import { Button } from "@/components/ui/button";
import { ChevronRight, PlusIcon } from "lucide-react";
import { useState } from "react";
import { useCards } from "@/context/CardsContext";
import { CardActions } from "@/components/cards-carousel/card-actions";
import { CardTransactions } from "@/components/transactions/card-transactions";
import { Link } from "react-router-dom";

export const CardsRoute = () => {
  const [open, setOpen] = useState(false);
  const { cards } = useCards();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selectedCard = cards && cards.length > 0 ? cards[selectedIndex] : undefined;
  return (
    <div className="grid grid-cols-6 gap-8 h-full mt-4 md:px-0">
      <div className="col-span-6 md:col-span-4 md:col-start-2 px-4 sm:px-0">
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
          <Link to="/transactions" className="flex items-center gap-2">
            View all <ChevronRight size={16} />
          </Link>
        </div>
        <CardTransactions cardToken={selectedCard?.cardToken} />
      </div>
      <VirtualCardsOrderModal open={open} onOpenChange={setOpen} />
    </div>
  );
};
