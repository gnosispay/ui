"use server";

import prisma from "@gnosispay/prisma";
import { initEventTracker, trackEvent } from "@gnosispay/event-tracker";
import {
  generateVerificationToken,
  sendOTPEmail,
  OTP_FROM_EMAIL,
  OTP_MAX_AGE_IN_SECONDS,
  hashToken,
} from "@gnosispay/email-otp-verification";

// this needs to be initilized again as these run in a state that inherits the page runtime state they were invoked on (next js server actions behaviour)
initEventTracker({
  posthogApiKey: process.env.NEXT_PUBLIC_POSTHOG_KEY,
  sendgridApiKey: process.env.SENDGRID_SECRET,
  loopsApiKey: process.env.LOOPS_API_KEY,
  spindlApiKey: process.env.SPINDL_API_KEY,
});

export async function requestEmailChange(newEmail: string) {
  try {
    const otp = await generateVerificationToken();
    const expires = new Date(Date.now() + OTP_MAX_AGE_IN_SECONDS * 1000);

    if (!process.env.AUTH_SECRET) {
      throw new Error("AUTH_SECRET is not set");
    }

    const hashedToken = await hashToken(otp, process.env.AUTH_SECRET);

    await prisma.verificationToken.create({
      data: {
        identifier: newEmail,
        token: hashedToken,
        expires,
      },
    });

    if (!process.env.SENDGRID_SECRET) {
      throw new Error("SENDGRID_SECRET is not set");
    }

    const res = await sendOTPEmail({
      from: OTP_FROM_EMAIL,
      sendgridApiKey: process.env.SENDGRID_SECRET,
      to: newEmail,
      token: otp,
    });

    if (!res.ok) {
      throw new Error("Failed to send verification email");
    }

    return { success: true };
  } catch (error) {
    console.error("Error requesting email change:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

export async function validateEmailChangeToken(
  userId: string,
  newEmail: string,
  token: string,
): Promise<{ success: boolean; message: string }> {
  if (!process.env.AUTH_SECRET) {
    console.error("Error: AUTH_SECRET environment variable not set");
    return { success: false, message: "Failed to validate token" };
  }

  const secret = process.env.AUTH_SECRET;
  const hashedToken = await hashToken(token, secret);

  try {
    const verificationToken = await prisma.verificationToken.delete({
      where: {
        identifier_token: {
          identifier: newEmail,
          token: hashedToken,
        },
      },
    });

    if (!verificationToken) {
      return { success: false, message: "Invalid or expired token" };
    }

    if (verificationToken.expires < new Date()) {
      return { success: false, message: "Token has expired" };
    }

    await prisma.user.update({
      where: { id: userId },
      data: { email: newEmail.toLowerCase() },
    });

    trackEvent({
      type: "user",
      event: "email_changed",
      userId,
      integrations: ["posthog", "loops"],
      posthogProperties: {
        $set: {
          email: newEmail,
        },
      },
      // loops email gets updated automatically
    });

    return { success: true, message: "Email change verified successfully" };
  } catch (error) {
    console.error("Error validating email change token:", error);
    return { success: false, message: "Failed to validate token" };
  }
}
