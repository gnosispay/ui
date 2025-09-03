"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { auth } from "@/auth";
import { fetchApi } from "@/lib/api";

export const verifyOgStatus = async () => {
  const session = await auth();

  if (!session) {
    return { error: "Unauthorized" };
  }

  revalidatePath("/dashboard/rewards");

  try {
    const { data } = await fetchApi("/rewards", {
      method: "GET",
      cookies,
    });

    return data.isOg;
  } catch (error) {
    console.error("Error verifying OG status:", error);
    return false;
  }
};
