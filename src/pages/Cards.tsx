import { CardsCarousel } from "@/components/cards-carousel/cards-carousel";
import { VirtualCardsOrderModal } from "@/components/modals/virtual-cards-order";

export const CardsRoute = () => {
  return (
    <div className="grid grid-cols-6 gap-8 h-full mt-4">
      <div className="col-span-4 col-start-2">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Cards</h1>
          <VirtualCardsOrderModal />
        </div>
      </div>
      <div className="col-span-4 col-start-2">
        <CardsCarousel />
      </div>
    </div>
  );
};
