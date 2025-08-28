import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useRef, useCallback, useEffect } from "react";
import { CardPreview } from "./card-preview";
import { useCards } from "@/context/CardsContext";
import { CardSkeleton } from "./card-skeleton";

const minSwipeDistance = 50;

export const CardsCarousel = ({
  currentIndex,
  setCurrentIndex,
  onCardChange,
}: {
  currentIndex: number;
  setCurrentIndex: (index: number) => void;
  onCardChange?: (index: number) => void;
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { cards, cardInfoMap } = useCards();
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchEndX, setTouchEndX] = useState<number | null>(null);

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEndX(null);
    setTouchStartX(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEndX(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (touchStartX === null || touchEndX === null) return;
    const distance = touchStartX - touchEndX;
    if (Math.abs(distance) > minSwipeDistance) {
      if (distance > 0) {
        // Swiped left
        nextCard();
      } else {
        // Swiped right
        prevCard();
      }
    } else {
      // Small swipe: revert to current card smoothly
      scrollToCard(currentIndex);
    }
    setTouchStartX(null);
    setTouchEndX(null);
  };

  const scrollToCard = useCallback((index: number) => {
    const cardElement = scrollContainerRef.current?.children[index] as HTMLElement;
    if (cardElement) {
      cardElement.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    }
  }, []);

  const nextCard = useCallback(() => {
    if (!cards || cards.length === 0) return;
    const nextIndex = (currentIndex + 1) % cards.length;
    setCurrentIndex(nextIndex);
    scrollToCard(nextIndex);
    onCardChange?.(nextIndex);
  }, [cards, currentIndex, scrollToCard, setCurrentIndex, onCardChange]);

  const prevCard = useCallback(() => {
    if (!cards || cards.length === 0) return;
    const prevIndex = (currentIndex - 1 + cards.length) % cards.length;
    setCurrentIndex(prevIndex);
    scrollToCard(prevIndex);
    onCardChange?.(prevIndex);
  }, [cards, currentIndex, scrollToCard, setCurrentIndex, onCardChange]);

  const goToCard = useCallback(
    (index: number) => {
      if (!cards || cards.length === 0) return;
      setCurrentIndex(index);
      scrollToCard(index);
      onCardChange?.(index);
    },
    [cards, scrollToCard, setCurrentIndex, onCardChange],
  );

  // Ensure carousel scrolls to correct position when currentIndex changes
  // This is especially important after cards refresh (e.g., after freeze/unfreeze)
  useEffect(() => {
    if (cards && cardInfoMap && cards.length > 0 && currentIndex >= 0 && currentIndex < cards.length) {
      // Double requestAnimationFrame to ensure DOM is fully rendered and painted
      const rafId = requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          scrollToCard(currentIndex);
        });
      });

      return () => cancelAnimationFrame(rafId);
    }
  }, [cards, cardInfoMap, currentIndex, scrollToCard]);

  if (!cards || !cardInfoMap) {
    return <CardSkeleton />;
  }

  return (
    <div className="w-full sm:w-sm flex flex-col gap-4 lg:mx-0 mx-auto">
      {/* Cards Container with Side Arrows */}
      <div className="relative group">
        {/* Left Arrow */}
        {currentIndex > 0 && (
          <button
            type="button"
            onClick={prevCard}
            className="hidden lg:block absolute left-2 top-1/2 -translate-y-1/2 text-primary z-10 bg-background opacity-80 rounded-full p-1 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity cursor-pointer"
            aria-label="Previous card"
          >
            <ChevronLeft strokeWidth={1} size={24} />
          </button>
        )}
        {/* Cards Row */}
        <div
          ref={scrollContainerRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide select-none"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          {cards.map((card, index) => {
            const cardInfo = !!card.cardToken && cardInfoMap?.[card.cardToken];

            if (!cardInfo) return null;

            return (
              <div
                key={card.id}
                className={`flex-shrink-0 transition-opacity duration-300 ${
                  index === currentIndex ? "opacity-100" : "opacity-40"
                } ${index === 0 ? "ml-[calc(50%-10rem)] sm:ml-0" : index === cards.length - 1 ? "mr-[calc(50%-10rem)] sm:mr-0" : ""}`}
              >
                <CardPreview
                  cardType={card.virtual ? "Virtual" : "Physical"}
                  cardInfo={cardInfo}
                  last4={card.lastFourDigits}
                />
              </div>
            );
          })}
        </div>
        {/* Right Arrow */}
        {currentIndex < cards.length - 1 && (
          <button
            type="button"
            onClick={nextCard}
            className="hidden lg:block absolute right-2 top-1/2 -translate-y-1/2 z-10 text-primary bg-background opacity-80 rounded-full p-1 shadow-md lg:opacity-0 lg:group-hover:opacity-100 transition-opacity cursor-pointer"
            aria-label="Next card"
          >
            <ChevronRight strokeWidth={1} size={24} />
          </button>
        )}
      </div>

      {/* Dots indicator */}
      {cards.length > 1 && (
        <div className="flex justify-center items-center px-4 sm:px-0 mt-2">
          <div className="flex gap-2">
            {cards.map((card, index) => (
              <button
                key={card.id}
                type="button"
                onClick={() => goToCard(index)}
                className={`w-3 h-3 rounded-full transition-colors cursor-pointer border ${index === currentIndex ? "border-primary" : "bg-border"}`}
                aria-label={`Go to card ${index + 1}`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
