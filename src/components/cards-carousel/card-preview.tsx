import CardFront from "./card-front";
import { AlertTriangle, Snowflake } from "lucide-react";
import type { GetApiV1CardsByCardIdStatusResponses } from "@/client";

interface CardPreviewProps {
  cardType: "Physical" | "Virtual";
  last4: string;
  cardInfo: GetApiV1CardsByCardIdStatusResponses[200];
}

export const CardPreview = ({ cardType, last4, cardInfo }: CardPreviewProps) => {
  return (
    <div className="rounded-xl overflow-hidden w-xs bg-black relative">
      <CardFront />
      {cardInfo.isFrozen && (
        <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center z-10">
          <Snowflake size={40} className="text-white mb-2" />
          <span className="text-white text-sm font-semibold tracking-widest">FROZEN</span>
        </div>
      )}
      {cardInfo.isStolen && (
        <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center z-10">
          <AlertTriangle size={40} className="text-white mb-2" />
          <span className="text-white text-sm font-semibold tracking-widest">STOLEN</span>
        </div>
      )}
      {cardInfo.isLost && (
        <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center z-10">
          <AlertTriangle size={40} className="text-white mb-2" />
          <span className="text-white text-sm font-semibold tracking-widest">LOST</span>
        </div>
      )}
      <div className="absolute left-4 bottom-4 flex flex-col items-start">
        <span className="text-secondary text-sm font-medium mb-1">{cardType}</span>
        <div className="flex items-center text-white text-lg font-semibold">
          <span className="mr-2">•••</span>
          <span>{last4}</span>
        </div>
      </div>
    </div>
  );
};
