"use server";

import prisma from "@gnosispay/prisma";
import { auth } from "@/auth";
import type { Session } from "next-auth";

export const signupWithWallet = async ({
  email,
  referalCouponCode,
  marketingCampaign,
}: {
  email: string;
  referalCouponCode?: string;
  marketingCampaign?: string;
}) => {
  const session = (await auth()) as (Session & { address: string }) | null;
  const signerAddress = session?.address;

  const existingAccount = await prisma.eOAAccount.findUnique({
    where: { address: signerAddress },
    include: {
      user: true,
    },
  });

  const existingEmail = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (existingEmail) {
    throw new Error("This e-mail is already registered, please sign in");
  }

  let user;
  if (existingAccount?.user) {
    if (existingAccount.user.hasSignedUp) {
      throw new Error(
        "That wallet is already connected with a user account, please sign in",
      );
    }

    user = await prisma.user.update({
      where: { id: existingAccount.user.id },
      data: { hasSignedUp: true, email: email.toLowerCase() },
    });
  } else {
    user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        hasSignedUp: true,
        referalCouponCode,
        marketingCampaign,
        verifiedEOA: signerAddress
          ? {
              create: [{ address: signerAddress }],
            }
          : {},
      },
    });
  }

  //   TODO: implement posthog
  // trackEvent({
  //   type: 'user',
  //   event: 'signed_up',
  //   userId: user.id,
  //   integrations: ['posthog'],
  //   posthogProperties: {
  //     $set: {
  //       email: user.email,
  //       kycApproved: "no",
  //       kycLinked: "no",
  //     },
  //     realm: REALM,
  //   },
  // });

  return user;
};
