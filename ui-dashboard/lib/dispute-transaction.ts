"use server";

import { cookies } from "next/headers";
import { fetchApi } from "./api";
import type { Event } from "@gnosispay/types";

interface DisputeTransactionParams {
  transaction: Event;
}
export const disputeTransaction = async ({
  transaction,
}: DisputeTransactionParams) => {
  try {
    const { data } = await fetchApi(`/transactions/dispute`, {
      method: "POST",
      body: {
        transaction,
      },
      cookies,
    });

    return data;
  } catch (error) {
    console.error("Error occurred during API call:", error);
    throw error;
  }
};
