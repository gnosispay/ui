"use server";
import { cookies } from "next/headers";

import { fetchApi } from "@/lib/api";

export interface AccountBalancesResponse {
  pending: bigint;
  spendable: bigint;
  total: bigint;
}

export const getAccountBalances =
  async (): Promise<AccountBalancesResponse | null> => {
    try {
      const { data } = await fetchApi(`/account-balances`, {
        cookies,
      });

      return data;
    } catch {
      return null;
    }
  };
