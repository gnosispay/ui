"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import toast from "react-hot-toast";
import OTPInput from "@/components/otp-input";
import { authWithEmail } from "../signup/actions/auth-email";
import { TitleSubtitle } from "../../../components/layout/title-subtitle";
import { attachRcc } from "./actions/attach-rcc";
import { attachWallet } from "./actions/attach-wallet";

interface PageProps {
  searchParams: {
    email: string;
    intent?: "signin" | "signup";
    next?: string;
    rcc?: string;
    siwe_message?: string;
    siwe_signature?: string;
  };
}
function Page({ searchParams }: PageProps) {
  const session = useSession();
  const {
    email,
    next,
    intent,
    rcc,
    siwe_message: siweMessage,
    siwe_signature: siweSignature,
  } = searchParams;

  if (session.data) {
    redirect("/dashboard");
  }

  const handleRedirect = () => {
    if (next) {
      window.location.href = decodeURIComponent(next);
      return;
    }

    if (intent === "signup") {
      window.location.href = "/welcome";
      return;
    }

    window.location.href = "/dashboard";
  };

  const handleComplete = async (token: string) => {
    try {
      const verificationUrl = `/auth/callback/sendgrid?email=${encodeURIComponent(
        email.toLocaleLowerCase(),
      )}&token=${token}`;

      const response = await fetch(verificationUrl, {
        method: "GET",
      });

      if (siweMessage && siweSignature) {
        const attachResult = await attachWallet({
          email,
          message: siweMessage,
          signature: siweSignature,
        });

        if (attachResult.error) {
          throw attachResult.error;
        }
      }

      if (rcc) {
        await attachRcc(rcc);
      }

      if (response.ok) {
        toast.success("You're all set! Redirecting you now.");
        handleRedirect();
      } else {
        throw "Invalid OTP provided.";
      }
    } catch (error) {
      toast.error("Verification failed. Please try again.");
      console.error(error);
      throw error; // Propagate the error to OTPInput for attempt counting
    }
  };

  const handleResend = async () => {
    await authWithEmail(email, {
      intent,
      siweMessage,
      siweSignature,
      ...(next ? { next } : {}),
    });

    toast.success("New OTP sent successfully");
  };

  return (
    <div className="flex flex-1">
      <div className="flex mx-12 relative z-20 flex-1 items-center">
        <div className="flex flex-col flex-1 space-y-12 -mt-24">
          <div className="flex flex-col space-y-3">
            <TitleSubtitle
              title="Verify your email"
              subtitle={`A one-time password (OTP) has been sent to the associated email account. Please check your inbox and enter the code below:`}
            />

            <OTPInput onComplete={handleComplete} onResend={handleResend} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Page;
