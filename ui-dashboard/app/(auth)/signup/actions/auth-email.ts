"use server";

import { stringify } from "querystring";
import prisma from "@gnosispay/prisma";
import { redirect } from "next/navigation";
import { signIn } from "@/auth";

export const authWithEmail = async (
  email: string,
  {
    intent,
    next,
    referalCouponCode,
    siweMessage,
    siweSignature,
  }: {
    referalCouponCode?: string;
    siweMessage?: string;
    siweSignature?: string;
    intent?: "signup" | "signin";
    next?: string;
  } = {},
) => {
  // The sign-in flow should be enabled for users who:
  // - Have an account when signing in
  // - Are signing up
  const shouldTriggerSignIn =
    intent === "signup" ||
    (await prisma.user.findUnique({
      where: {
        email,
      },
    }));

  if (shouldTriggerSignIn) {
    await signIn("sendgrid", {
      email,
      callbackUrl: "/dashboard",
      redirect: false,
    });
  }

  const queryString = stringify({
    email,
    intent,
    next,
    rcc: referalCouponCode,
    siwe_message: siweMessage,
    siwe_signature: siweSignature,
  });

  redirect(`/verify-request?${queryString}`);
};
