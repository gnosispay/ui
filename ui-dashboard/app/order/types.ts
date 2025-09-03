import type { Card } from "../dashboard/(cards)/cards/types";

export enum personalizationSource {
  KYC = "KYC",
  ENS = "ENS",
}

export enum CardOrderStatus {
  PENDINGTRANSACTION = "PENDINGTRANSACTION",
  TRANSACTIONCOMPLETE = "TRANSACTIONCOMPLETE",
  CONFIRMATIONREQUIRED = "CONFIRMATIONREQUIRED",
  READY = "READY",
  CARDCREATED = "CARDCREATED",
  SHIPPED = "SHIPPED",
  ACTIVATED = "ACTIVATED",
  FAILEDTRANSACTION = "FAILEDTRANSACTION",
}

export type CardOrder = {
  id: string;
  transactionHash: string;
  embossedName: string | null;
  address1: string | null;
  address2: string | null;
  city: string | null;
  postalCode: string | null;
  state: string | null;
  country: string | null;
  userId: string;
  status: CardOrderStatus;
  personalizationSource: personalizationSource;
  createdAt: string; // ISO date string
  card?: Card;
  couponCode?: string;
  totalAmountEUR?: number;
  totalDiscountEUR?: number;
};
