"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { fetchApi } from "@/lib/api";

export const revalidateDashboard = async () => {
  // used to make sure the layout is updated
  // without it the user could sometimes still see a warning being showed
  revalidatePath("/dashboard");
};

export const setCardPin = async (
  cardId: string,
  encryptedPin: string,
  encryptedKey: string,
  iv: string,
) => {
  const { data } = await fetchApi(`/cards/${cardId}/pin`, {
    method: "POST",
    body: { encryptedPin, encryptedKey, iv },
    cookies,
  });

  return data;
};
