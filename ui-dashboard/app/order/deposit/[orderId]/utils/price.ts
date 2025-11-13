import { parseEther } from "viem";
import { CARD_PRICE_EURE } from "../../../../../lib/constants";
import type { CardOrder } from "../../../types";

export const getTotalPriceEUR = (cardOrder: CardOrder) => {
  const totalPrice = cardOrder.totalAmountEUR || CARD_PRICE_EURE;
  const couponDiscount = cardOrder.totalDiscountEUR || 0;

  return totalPrice - couponDiscount;
};

export const getTotalPriceEther = (totalEUR: string) => {
  return parseEther(
    process.env.NEXT_PUBLIC_DANGEROUS_OVERRIDE_PAYMENT_AMOUNT || totalEUR,
  );
};
