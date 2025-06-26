import { useCards } from "@/context/CardsContext";
import { Skeleton } from "./ui/skeleton";
import { Card } from "./card";
import { VirtualCardsOrderModal } from "./modals/virtual-cards-order";

export const Cards = () => {
  const { cards, cardInfoMap } = useCards();
  const loading = !cards || !cardInfoMap;

  if (!!cards && cards.length === 0) {
    return <div className="text-center text-muted-foreground">No cards found.</div>;
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-6">
        {loading && (
          <>
            <Skeleton className="h-30 w-full rounded-lg" />
            <Skeleton className="h-30 w-full rounded-lg" />
          </>
        )}
        {!!cards &&
          !!cardInfoMap &&
          cards.map((card) => <Card key={card.id} card={card} cardInfo={cardInfoMap[card.id]} />)}
      </div>
      <VirtualCardsOrderModal />
    </>
  );
};
