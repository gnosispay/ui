import type { Event, IbanOrder } from "@/client";

export enum TransactionType {
  CARD = "card",
  IBAN = "iban",
}

export interface Transaction {
  id: string;
  createdAt: string;
  type: TransactionType;
  data: Event | IbanOrder;
}
