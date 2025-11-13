"use server";

import { cookies } from "next/headers";
import { fetchApi } from "./api";
import type { Event } from "@gnosispay/types";

interface ReportFraudulentTransactionParams {
  transaction: Event;
}
export const reportFraudulentTransaction = async ({
  transaction,
}: ReportFraudulentTransactionParams) => {
  try {
    const { data } = await fetchApi(`/transactions/report-fraudulent`, {
      method: "POST",
      cookies,
      body: { transaction },
    });

    return data;
  } catch (error) {
    console.error("Error occurred during API call:", error);
    throw error;
  }
};
