"use server";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { fetchApi } from "@/lib/api";

export const freezeCard = async (cardId: string) => {
  revalidatePath("/dashboard/card");

  const { data } = await fetchApi(`/cards/${cardId}/freeze`, {
    method: "POST",
    cookies,
  });

  return data;
};

export const unFreezeCard = async (cardId: string) => {
  revalidatePath("/dashboard/card");

  const { data } = await fetchApi(`/cards/${cardId}/unfreeze`, {
    method: "POST",
    cookies,
  });
  return data;
};

export const markCardAsStolen = async (cardId: string) => {
  revalidatePath("/dashboard/card");

  const { data } = await fetchApi(`/cards/${cardId}/stolen`, {
    method: "POST",
    cookies,
  });

  return data;
};

export const markCardAsLost = async (cardId: string) => {
  revalidatePath("/dashboard/card");

  const { data } = await fetchApi(`/cards/${cardId}/lost`, {
    method: "POST",
    cookies,
  });

  return data;
};

export const getCardStatus = async (cardId?: string) => {
  if (!cardId) {
    return null;
  }

  try {
    const { data } = await fetchApi(`/cards/${cardId}/status`, {
      method: "GET",
      cookies,
    });

    return data;
  } catch (error) {
    console.error(`Failed to get card status for cardId: ${cardId}`, error);
    throw error; // Re-throw to maintain current behavior
  }
};

export const getCardType = async (cardId: string) => {
  try {
    const { data } = await fetchApi(`/cards/${cardId}/type`, {
      method: "GET",
      cookies,
    });

    return data;
  } catch (error) {
    console.error(`Failed to get card status for cardId: ${cardId}`, error);
    throw error; // Re-throw to maintain current behavior
  }
};
