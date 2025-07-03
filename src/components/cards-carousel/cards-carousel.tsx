import { ArrowLeftCircle, ArrowRightCircle } from "lucide-react";
import { useState, useRef } from "react";
import { CardPreview } from "./card-preview";
import { useCards } from "@/context/CardsContext";
import { CardSkeleton } from "./card-skeleton";
import { CardPSE } from "./card-pse";

export const CardsCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const { cards, cardInfoMap } = useCards();
  const loading = !cards || !cardInfoMap;

  if (loading) {
    return <CardSkeleton />;
  }

  const nextCard = () => {
    const nextIndex = (currentIndex + 1) % cards.length;
    setCurrentIndex(nextIndex);
    scrollToCard(nextIndex);
  };

  const prevCard = () => {
    const prevIndex = (currentIndex - 1 + cards.length) % cards.length;
    setCurrentIndex(prevIndex);
    scrollToCard(prevIndex);
  };

  const scrollToCard = (index: number) => {
    if (scrollContainerRef.current) {
      const cardElement = scrollContainerRef.current.children[index] as HTMLElement;
      if (cardElement) {
        cardElement.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "center",
        });
      }
    }
  };

  const goToCard = (index: number) => {
    setCurrentIndex(index);
    scrollToCard(index);
  };

  return (
    <div className="w-full flex flex-col lg:flex-row gap-6">
      {/* Cards Section */}
      <div className="w-sm flex flex-col gap-4 mx-auto lg:mx-0">
        {/* Cards Container */}
        <div className="overflow-hidden">
          <div
            ref={scrollContainerRef}
            className="flex gap-4 overflow-x-auto scrollbar-hide select-none pointer-events-none"
          >
            {cards.map((card, index) => (
              <div
                key={card.id}
                className={`flex-shrink-0 transition-opacity duration-300 ${
                  index === currentIndex ? "opacity-100" : "opacity-40"
                }`}
              >
                <CardPreview
                  cardType={card.virtual ? "Virtual" : "Physical"}
                  cardInfo={cardInfoMap?.[card.id]}
                  last4={card.lastFourDigits}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          {/* Arrows */}
          <div className="flex gap-1 text-brand">
            <button
              type="button"
              onClick={prevCard}
              className="hover:opacity-70 transition-opacity cursor-pointer"
              aria-label="Previous card"
            >
              <ArrowLeftCircle strokeWidth={1} size={36} />
            </button>
            <button
              type="button"
              onClick={nextCard}
              className="hover:opacity-70 transition-opacity cursor-pointer"
              aria-label="Next card"
            >
              <ArrowRightCircle strokeWidth={1} size={36} />
            </button>
          </div>

          {/* Dots indicator */}
          <div className="flex gap-2">
            {cards.map((card, index) => (
              <button
                key={card.id}
                type="button"
                onClick={() => goToCard(index)}
                className={`w-3 h-3 rounded-full transition-colors cursor-pointer border ${index === currentIndex ? "border-brand" : "border-gray-300"}`}
                aria-label={`Go to card ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Action Buttons Section */}
      <div className="flex-1 flex items-center justify-center">
        <CardPSE card={cards[currentIndex]} />
      </div>
    </div>
  );
};
