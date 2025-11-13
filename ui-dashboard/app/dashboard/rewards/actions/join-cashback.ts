"use server";

import prisma from "@gnosispay/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { CASHBACK_TOS_SLUG, CASHBACK_TOS_VERSIONS } from "@/lib/constants";

export const joinCashback = async () => {
  "use server";
  const session = await auth();

  if (!session) {
    return { error: "Unauthorized" };
  }

  revalidatePath("/dashboard/rewards");

  await prisma.terms.create({
    data: {
      userId: session.user.id,
      version:
        CASHBACK_TOS_VERSIONS[CASHBACK_TOS_VERSIONS.length - 1] ??
        "TOS_CASHBACK_UNKNOWN",
      terms: CASHBACK_TOS_SLUG,
    },
  });

  return true;
};
