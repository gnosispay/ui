import type { Event, IbanOrder } from "@/client";

export enum Erc20TokenEventDirection {
  Incoming = "Incoming",
  Outgoing = "Outgoing",
}

export interface Erc20TokenEvent {
  direction: Erc20TokenEventDirection;
  date: Date;
  hash: `0x${string}`;
  from: `0x${string}`;
  to: `0x${string}`;
  value: bigint;
}

export enum TransactionType {
  CARD = "card",
  IBAN = "iban",
  ONCHAIN = "onchain",
}

export interface Transaction {
  id: string;
  createdAt: string;
  type: TransactionType;
  data: Event | IbanOrder | Erc20TokenEvent;
}
