import type { CardInfo } from "@/context/CardsContext";
import CardFront from "./card-front";
import { CardStatusOverlay } from "./card-status-overlay";

interface CardPreviewProps {
  cardType: "Physical" | "Virtual";
  last4: string;
  cardInfo: CardInfo;
}

export const CardPreview = ({ cardType, last4, cardInfo }: CardPreviewProps) => {
  return (
    <div className="rounded-xl overflow-hidden w-xs bg-black relative" data-testid={`card-preview-${last4}`}>
      <CardFront />
      {cardInfo?.isFrozen && <CardStatusOverlay status="frozen" />}
      {cardInfo?.isStolen && <CardStatusOverlay status="stolen" />}
      {cardInfo?.isLost && <CardStatusOverlay status="lost" />}
      {cardInfo?.isVoid && <CardStatusOverlay status="void" />}
      {!cardInfo?.isFrozen &&
        !cardInfo?.isStolen &&
        !cardInfo?.isLost &&
        !cardInfo?.isVoid &&
        cardInfo?.statusCode !== 1000 && <CardStatusOverlay status="other" />}
      <div className="absolute left-4 bottom-4 flex flex-col items-start">
        <span className="text-secondary text-sm font-medium mb-1" data-testid="card-type">
          {cardType}
        </span>
        <div className="flex items-center text-white text-lg font-semibold">
          <span className="mr-2">•••</span>
          <span data-testid="card-last4">{last4}</span>
        </div>
      </div>
    </div>
  );
};
