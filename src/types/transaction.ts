import type { Event } from "@/client";
import type { Address, Hash } from "viem";

export enum Erc20TokenEventDirection {
  Incoming = "Incoming",
  Outgoing = "Outgoing",
}

export interface Erc20TokenEvent {
  direction: Erc20TokenEventDirection;
  date: Date;
  hash: Hash;
  from: Address;
  to: Address;
  value: bigint;
  tokenAddress?: Address;
}

export enum TransactionType {
  CARD = "card",
  ONCHAIN = "onchain",
}

export interface Transaction {
  id: string;
  createdAt: string;
  type: TransactionType;
  data: Event | Erc20TokenEvent;
}
