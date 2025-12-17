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
  const [isDragging, setIsDragging] = useState(false);
  const initialScrollLeft = useRef<number>(0);

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

  // Add non-passive touch event listeners to allow preventDefault
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleTouchStart = (e: TouchEvent) => {
      if (!container) return;

      setTouchEndX(null);
      setTouchStartX(e.touches[0].clientX);
      setIsDragging(true);

      // Store the initial scroll position
      initialScrollLeft.current = container.scrollLeft;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (touchStartX === null || !isDragging) return;

      if (!container || !cards || cards.length === 0) return;

      const currentX = e.touches[0].clientX;
      const rawDistance = touchStartX - currentX; // Positive = left swipe, negative = right swipe
      setTouchEndX(currentX);

      // Calculate the maximum allowed scroll distance to adjacent cards
      const containerWidth = container.offsetWidth;
      const cardWidth = containerWidth * 0.8; // Approximate card width
      const maxScrollDistance = cardWidth + 16; // Card width + gap

      // Apply resistance when approaching boundaries
      let constrainedDistance = rawDistance;

      // Check boundaries and apply resistance
      if (rawDistance > 0 && currentIndex >= cards.length - 1) {
        // Trying to swipe left at last card - apply strong resistance
        constrainedDistance = rawDistance * 0.1;
      } else if (rawDistance < 0 && currentIndex <= 0) {
        // Trying to swipe right at first card - apply strong resistance
        constrainedDistance = rawDistance * 0.1;
      } else {
        // Normal case - limit to adjacent card distance with some resistance
        const maxDistance = maxScrollDistance * 0.7; // Allow 70% of card width for smooth feel
        if (Math.abs(rawDistance) > maxDistance) {
          constrainedDistance = Math.sign(rawDistance) * maxDistance;
        }
      }

      // Apply the scroll offset
      container.scrollLeft = initialScrollLeft.current + constrainedDistance;

      // Prevent default scrolling behavior
      e.preventDefault();
    };

    const handleTouchEnd = () => {
      if (touchStartX === null || touchEndX === null || !isDragging) return;

      const distance = touchStartX - touchEndX;
      const shouldChangeCard = Math.abs(distance) > minSwipeDistance;

      setIsDragging(false);

      if (shouldChangeCard && cards) {
        if (distance > 0 && currentIndex < cards.length - 1) {
          // Swiped left and not at last card
          nextCard();
        } else if (distance < 0 && currentIndex > 0) {
          // Swiped right and not at first card
          prevCard();
        } else {
          // At boundary - snap back to current card
          scrollToCard(currentIndex);
        }
      } else {
        // Small swipe: revert to current card smoothly
        scrollToCard(currentIndex);
      }

      setTouchStartX(null);
      setTouchEndX(null);
    };

    const handleTouchCancel = () => {
      // Handle touch cancel (e.g., when user drags outside the container)
      if (isDragging) {
        setIsDragging(false);
        scrollToCard(currentIndex);
      }
      setTouchStartX(null);
      setTouchEndX(null);
    };

    // Add non-passive event listeners
    container.addEventListener("touchstart", handleTouchStart, { passive: false });
    container.addEventListener("touchmove", handleTouchMove, { passive: false });
    container.addEventListener("touchend", handleTouchEnd, { passive: false });
    container.addEventListener("touchcancel", handleTouchCancel, { passive: false });

    return () => {
      container.removeEventListener("touchstart", handleTouchStart);
      container.removeEventListener("touchmove", handleTouchMove);
      container.removeEventListener("touchend", handleTouchEnd);
      container.removeEventListener("touchcancel", handleTouchCancel);
    };
  }, [touchStartX, touchEndX, isDragging, cards, currentIndex, nextCard, prevCard, scrollToCard]);

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
            data-testid="card-carousel-arrow-prev"
          >
            <ChevronLeft strokeWidth={1} size={24} />
          </button>
        )}
        {/* Cards Row */}
        <div ref={scrollContainerRef} className="flex gap-4 overflow-x-auto scrollbar-hide select-none">
          {cards.map((card, index) => {
            const cardInfo = !!card.cardToken && cardInfoMap?.[card.cardToken];

            if (!cardInfo) return null;

            return (
              <div
                key={card.id}
                data-testid={`card-carousel-item-${card.lastFourDigits}`}
                data-selected={index === currentIndex}
                className={`shrink-0 transition-opacity duration-300 ${
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
            data-testid="card-carousel-arrow-next"
          >
            <ChevronRight strokeWidth={1} size={24} />
          </button>
        )}
      </div>

      {/* Dots indicator */}
      {cards.length > 1 && (
        <div className="flex justify-center items-center px-4 sm:px-0 mt-2" data-testid="card-carousel-dots">
          <div className="flex gap-2">
            {cards.map((card, index) => (
              <button
                key={card.id}
                type="button"
                onClick={() => goToCard(index)}
                className={`w-3 h-3 rounded-full transition-colors cursor-pointer border ${index === currentIndex ? "border-primary" : "bg-border"}`}
                aria-label={`Go to card ${index + 1}`}
                data-testid={`card-carousel-dot-${card.lastFourDigits}`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
