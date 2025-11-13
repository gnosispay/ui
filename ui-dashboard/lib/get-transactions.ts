import api from "./api";
import type { ReadonlyRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies";
import type { Event } from "@gnosispay/types";

interface GetTransactionsOptions {
  cookies?: (() => ReadonlyRequestCookies | undefined) | undefined;
  before?: Date;
  after?: Date;
  billingCurrency?: string;
  transactionCurrency?: string;
  mcc?: string;
}

async function getTransactions({
  cookies,
  before,
  after,
  billingCurrency,
  transactionCurrency,
  mcc,
}: GetTransactionsOptions) {
  try {
    const searchParams = new URLSearchParams();
    if (before) {
      searchParams.append("before", before.toISOString());
    }
    if (after) {
      searchParams.append("after", after.toISOString());
    }
    if (billingCurrency) {
      searchParams.append("billingCurrency", billingCurrency);
    }
    if (transactionCurrency) {
      searchParams.append("transactionCurrency", transactionCurrency);
    }
    if (mcc) {
      searchParams.append("mcc", mcc);
    }

    const response = await api(cookies).get(
      `/transactions?${searchParams.toString()}`,
    );
    const transactions: Event[] = await response.json();
    return transactions;
  } catch {
    return [];
  }
}

export default getTransactions;
