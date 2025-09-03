import api from "./api";
import type { ReadonlyRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies";

export type DelayTransactionStatus =
  | "QUEUING"
  | "WAITING"
  | "EXECUTING"
  | "EXECUTED"
  | "FAILED";

export interface DelayTransaction {
  id: string;
  userId: string;
  safeAddress: string;
  transactionData: string;
  enqueueTaskId: string;
  dispatchTaskId: string | null;
  createdAt: string;
  readyAt: string | null;
  status: DelayTransactionStatus;
}

async function getDelayTransactionsOrThrow(
  cookies?: (() => ReadonlyRequestCookies | undefined) | undefined,
) {
  const response = await api(cookies).get("/delay-relay");
  const delayTransactions = (await response.json()) as DelayTransaction[];
  return delayTransactions;
}

export default getDelayTransactionsOrThrow;
