"use client";

import { isCountrySupported } from "@gnosispay/countries";
import { useSIWE } from "connectkit";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { EnvelopeSimple } from "@phosphor-icons/react";
import { useSession } from "next-auth/react";
import { useFeatureFlagEnabled } from "posthog-js/react";
import Spinner from "@/components/spinner";
import Button from "../../../../components/buttons/buttonv2";
import { CountryPicker } from "../../../../components/country-picker";
import Input from "../../../../components/inputs/input-base";
import { TitleSubtitle } from "../../../../components/layout/title-subtitle";
import { signupWithWallet } from "../actions/signup-wallet";
import { authWithEmail } from "../actions/auth-email";
import { WaitlistModal } from "./waitlist-modal";
import { ContinueOrderModal } from "./continue-order-modal";
import type { CountryOption } from "../../../../components/country-picker";

const SignUpForm = () => {
  const { watch, control, register, handleSubmit } = useForm<{
    country: CountryOption;
    email: string;
  }>();
  const { isSignedIn } = useSIWE();
  const session = useSession();

  const sumsubCountryFlagEnabled = useFeatureFlagEnabled("sumsub-country");

  const posthogFeatureFlagsInitialized =
    typeof sumsubCountryFlagEnabled !== "undefined";

  const { push } = useRouter();
  const [isWaitlistOpen, setIsWaitlistOpen] = useState<boolean>(false);
  const [isContinueOrderOpen, setIsContinueOrderOpen] =
    useState<boolean>(false);

  const selectedCountry = watch("country");
  const authEmail = watch("email");

  const showActionButton =
    !selectedCountry || isCountrySupported({ alpha2: selectedCountry.alpha2 });

  const searchParams = useSearchParams();
  const referalCouponCode = searchParams.get("rcc") || "";
  const marketingCampaign = searchParams.get("utm_campaign") || "";
  const siweMessage = searchParams.get("siwe_message") || "";
  const siweSignature = searchParams.get("siwe_signature") || "";

  useEffect(() => {
    if (session.status === "authenticated") {
      push("/welcome");
    }
  }, [session.status]);

  useEffect(() => {
    if (isSignedIn && authEmail?.length > 0) {
      onWalletSignUp();
    }
  }, [isSignedIn, authEmail]);

  const onEmailSignUp = async () => {
    await authWithEmail(authEmail, {
      intent: "signup",
      referalCouponCode,
      siweMessage,
      siweSignature,
    });
  };

  const onWalletSignUp = async () => {
    try {
      const data = await signupWithWallet({
        email: authEmail,
        referalCouponCode,
        marketingCampaign,
      });

      if (data?.id) {
        push("/welcome");
      }
    } catch (e) {
      const error = e as Error;
      toast.error(error.message);

      /**
       * Currently, we are matching errors by their messages, which is not ideal.
       *
       * Potential future improvement: We could introduce shared error codes
       * and handle errors based on these codes instead of error messages.
       */
      const continueOrderErrors = [
        "This e-mail is already registered, please sign in",
        "That wallet is already connected with a user account, please sign in",
      ];
      if (continueOrderErrors.includes(error.message)) {
        setIsContinueOrderOpen(true);
      }
    }
  };

  if (!posthogFeatureFlagsInitialized) {
    return null;
  }

  return (
    <div className="flex flex-1">
      <form
        className="flex mx-12 relative z-20 flex-1 items-center"
        onSubmit={handleSubmit(onEmailSignUp)}
      >
        <div className="flex flex-col flex-1 space-y-8 -mt-24">
          <TitleSubtitle title="Sign up" />
          {session.status === "loading" ? (
            <div className="flex items-center justify-center">
              <Spinner monochromatic className="w-4 h-4 mr-2" />
              <span>Checking session...</span>
            </div>
          ) : (
            <>
              {!sumsubCountryFlagEnabled && (
                <div className="space-y-2 flex flex-col">
                  <label>Country of residence</label>
                  <Controller
                    control={control}
                    name="country"
                    render={({ field }) => (
                      <CountryPicker id="country" {...field} />
                    )}
                  />
                </div>
              )}
              <div className="space-y-2 flex flex-col">
                <label>Email</label>
                <Input
                  required
                  type="email"
                  placeholder="example@gnosis.io"
                  maxLength={50}
                  className="border border-gray-300 rounded-lg p-3 shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  {...register("email")}
                />
              </div>
              <div className="space-y-4 w-full">
                {showActionButton || sumsubCountryFlagEnabled ? (
                  <div>
                    <Button
                      type="submit"
                      className="w-full py-3 rounded-lg"
                      disabled={!selectedCountry && !sumsubCountryFlagEnabled}
                    >
                      <EnvelopeSimple />
                      Sign up
                    </Button>
                  </div>
                ) : (
                  <Button
                    onClick={() => setIsWaitlistOpen(true)}
                    type="button"
                    className="w-full rounded-lg py-3"
                  >
                    Join waitlist
                  </Button>
                )}
                <div className="text-center">
                  Already have an account?{" "}
                  <Link href="/signin" className="underline">
                    Sign in
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>
      </form>
      <WaitlistModal
        isOpen={isWaitlistOpen}
        onClose={() => setIsWaitlistOpen(false)}
        selectedCountry={selectedCountry}
        email={authEmail}
      />
      <ContinueOrderModal
        isOpen={isContinueOrderOpen}
        onClose={() => setIsContinueOrderOpen(false)}
      />
    </div>
  );
};

export default SignUpForm;
