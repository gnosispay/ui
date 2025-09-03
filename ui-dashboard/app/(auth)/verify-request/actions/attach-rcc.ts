"use server";

import prisma from "@gnosispay/prisma";
import { auth } from "@/auth";

export const attachRcc = async (rcc: string) => {
  const session = await auth();

  if (!session) {
    return { error: "Unauthorized" };
  }

  const existingUser = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (existingUser?.referalCouponCode || existingUser?.referrerCode === rcc) {
    console.log(`User already has this referal code ${rcc}`);
    return { error: "Not allowed" };
  }

  return await prisma.user.update({
    where: { id: session.user.id },
    data: { referalCouponCode: rcc },
  });
};
