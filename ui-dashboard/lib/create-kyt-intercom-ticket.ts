"use server";

import { cookies } from "next/headers";
import { fetchApi } from "./api";

export const createKytIntercomTicket = async () => {
  try {
    const { data } = await fetchApi(`/account-balances/kyt-intercom-ticket`, {
      method: "POST",
      cookies,
    });

    return data;
  } catch (error) {
    console.error("Error occurred during API call:", error);
    throw error;
  }
};
