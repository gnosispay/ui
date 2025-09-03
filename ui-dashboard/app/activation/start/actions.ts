"use server";

import { cookies } from "next/headers";
import { fetchApi } from "@/lib/api";

export const createSafe = async (signerAddress: `0x${string}`) => {
  return await fetchApi(`/account`, {
    cookies,
    method: "POST",
    body: JSON.stringify({ chainId: "100", signerAddress }),
  });
};
