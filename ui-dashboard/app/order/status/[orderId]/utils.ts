import { addBusinessDays, isBefore } from "date-fns";
import type { CardOrder, CardOrderStatus } from "../../types";

export const getOrderDisplayStatus = (cardOrder: CardOrder) => {
  const CARDCREATED: CardOrderStatus = "CARDCREATED";

  if (cardOrder.status === CARDCREATED) {
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
  const dateCardCreated = cardOrder.createdAt;
  const dateCardShipped = addBusinessDays(dateCardCreated, 1);
  return isBefore(dateCardShipped, new Date()) ? dateCardShipped : null;
};
