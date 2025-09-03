import { cookies } from "next/headers";
import { fetchApi } from "@/lib/api";
import type { Card } from "./types";

export const getCards = async (): Promise<Card[]> => {
  const {
    data,
    response: { status, ok },
  } = await fetchApi("/cards", { cookies });

  if (status === 404) {
    return [];
  }

  if (!ok) {
    console.error("Failed to fetch cards");
    throw new Error("Failed to fetch cards");
  }

  return data as Card[];
};

export const getNonVoidedCards = async (): Promise<Card[]> => {
  const {
    data,
    response: { status, ok },
  } = await fetchApi("/cards?exclude_voided=true", { cookies });

  if (status === 404) {
    return [];
  }

  if (!ok) {
    throw new Error("Failed to fetch cards");
  }

  return data as Card[];
};
