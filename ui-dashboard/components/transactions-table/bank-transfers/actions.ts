"use server";

import { cookies } from "next/headers";
import { fetchApi } from "@/lib/api";
import type { MoneriumIbanOrder } from "@gnosispay/types";

export const getMoneriumIbanOrders = async (): Promise<
  MoneriumIbanOrder[] | undefined | null
> => {
  try {
    const { data } = await fetchApi<{ data: MoneriumIbanOrder[] }>(
      `/ibans/orders`,
      {
        cookies,
      },
    );

    return data?.data;
  } catch (error) {
    console.log("Error fetching Monerium IBAN orders");
    console.error(error);

    return null;
  }
};
