import { useUser } from "@/context/UserContext";
import { CreditCard, OctagonX, Smartphone } from "lucide-react";

export const Cards = () => {
  const { cards, cardInfoMap } = useUser();

  if (!cards) {
    return;
  }

  console.log("cardInfoMap: ", cardInfoMap);
  if (cards.length === 0) {
    return <div>No cards found.</div>;
  }

  return (
    <div className="p-6">
      <h1 className="flex items-center gap-2 text-2xl font-bold mb-6">
        <CreditCard className="w-6 h-6" />
        Card List
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

          console.log("Card info: ", cardInfo);
          return (
            <div key={card.id} className="border border-gray-300 rounded-lg p-4 shadow-sm bg-white">
              <p className="font-medium">●●●● ●●●● ●●●● {card.lastFourDigits}</p>
              <p className="flex items-center gap-2">
                {card.virtual ? <Smartphone /> : <CreditCard />} {card.virtual ? "Virtual" : "Physical"}
              </p>
              {!card.activatedAt && (
                <p className="flex items-center gap-2">
                  <OctagonX /> Not Activated
                </p>
              )}
              {cardInfo && <p>Status code: {cardInfo.statusCode}</p>}
              {cardProblem && <p className="text-red-500">State: {cardProblem}</p>}
            </div>
          );
        })}
      </div>
    </div>
  );
};
