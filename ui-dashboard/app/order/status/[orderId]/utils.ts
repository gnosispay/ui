import { addBusinessDays, isBefore, parseISO } from "date-fns";
import { CardOrderStatus } from "../../types";
import type { CardOrder } from "../../types";

export const getCardStatus = (cardOrder: CardOrder) => {
  if (cardOrder?.card?.activatedAt) {
    return {
      label: "Your card is activated and ready to use",
      stepReached: 2,
    };
  }

  if (cardOrder.status === CardOrderStatus.CARDCREATED) {
    if (getCardShippedDate(cardOrder)) {
      return {
        label: "Your card has shipped and should be with you soon",
        stepReached: 1,
      };
    }
  }

  return {
    label: "We'll let you know when the card has shipped",
    stepReached: 0,
  };
};

export const getCardShippedDate = (cardOrder: CardOrder) => {
  const dateCardCreated = parseISO(cardOrder.createdAt);
  const dateCardShipped = addBusinessDays(dateCardCreated, 1);
  return isBefore(dateCardShipped, new Date()) ? dateCardShipped : null;
};
