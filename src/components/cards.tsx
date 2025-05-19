import { useCards } from "@/context/CardsContext";
import { CreditCard } from "lucide-react";
import { Skeleton } from "./ui/skeleton";
import { Card } from "./card";

export const Cards = () => {
  const { cards, cardInfoMap } = useCards();
  const loading = !cards || !cardInfoMap;

  if (!!cards && cards.length === 0) {
    return <div className="text-center text-muted-foreground">No cards found.</div>;
  }

  return (
    <div className="p-6">
      <h1 className="flex items-center gap-2 text-2xl font-bold mb-6 text-foreground">
        <CreditCard className="w-6 h-6" />
        Cards
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
    </div>
  );
};
