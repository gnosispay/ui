"use server";

import prisma from "@gnosispay/prisma";
import { SiweMessage } from "siwe";
import { verifySmartSignature } from "@/lib/verification";

export const attachWallet = async ({
  message,
  signature,
  email,
}: {
  message: string;
  signature: string;
  email: string;
}) => {
  const siwe = new SiweMessage(message);
  const result = await verifySmartSignature(siwe, signature);

  if (!result.success) {
    return { error: "Invalid signature or message provided" };
  }

  const { address } = siwe;

  const existingAccount = await prisma.eOAAccount.findUnique({
    where: { address },
    include: { user: true },
  });

  if (existingAccount && existingAccount.user?.email !== email) {
    return { error: "Wallet is already configured for another user" };
  }

  if (!existingAccount) {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return { error: "User with provided email not found" };
    }

    await prisma.eOAAccount.create({
      data: {
        userId: user.id,
        address,
      },
    });
  }

  return { ok: true };
};
