import { CardsCarousel } from "@/components/cards-carousel/cards-carousel";
import { VirtualCardsOrderModal } from "@/components/modals/virtual-cards-order";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import { useState } from "react";

export const CardsRoute = () => {
  const [open, setOpen] = useState(false);
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
        <CardsCarousel />
      </div>
      <VirtualCardsOrderModal open={open} onOpenChange={setOpen} />
    </div>
  );
};
