"use server";
import { cookies } from "next/headers";
import { fetchApi } from "@/lib/api";

export const createOrder = async ({
  personalizationSource,
  ensName,
  coupon = false,
}: {
  personalizationSource: "ENS" | "KYC";
  ensName: string | null | undefined;
  coupon: boolean;
}) => {
  const { data } = await fetchApi("/order/create", {
    method: "POST",
    body: {
      coupon,
      personalizationSource,
      ENSName: personalizationSource === "ENS" ? ensName : undefined,
    },
    cookies,
  });

  return data;
};
