"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useChainIsSupported, useSIWE } from "connectkit";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { EnvelopeSimple } from "@phosphor-icons/react";
import Button from "@/components/buttons/buttonv2";
import Spinner from "@/components/spinner";
import { SwitchToGnosisButton } from "@/app/activation/configure-safe/[cardId]/form";
import Input from "@/components/inputs/input-base";
import { triggerEvent as triggerGTMEvent, GTM_EVENTS } from "../../../lib/gtm";
import { authWithEmail } from "../signup/actions/auth-email";
import SiweButton from "../../../components/buttons/siwe-button";

const SignInPage = () => {
  const { push } = useRouter();
  const { isSignedIn, signOut, isError } = useSIWE();
  const session = useSession();

  const { register, handleSubmit } = useForm<{
    email: string;
  }>();

  const searchParams = useSearchParams();

  const [isSigningIn, setIsSigningIn] = useState<boolean>(false);
  const { isConnected, chain } = useAccount();
  const isChainSupported = useChainIsSupported(chain?.id);

  const onSignOut = async () => {
    signOut();
  };

  const onEmailSignin = async (data: { email: string }) => {
    await authWithEmail(data.email, {
      intent: "signin",
      next: encodeURIComponent(searchParams.get("next") || "/dashboard"),
    });
  };

  useEffect(() => {
    const isLoggedIn = session.status === "authenticated";

    async function verifyRegistration() {
      setIsSigningIn(true);

      triggerGTMEvent(GTM_EVENTS.ACTIONS.USER_SIGNED_IN);

      const nextParam = searchParams.get("next");
      if (nextParam) {
        const redirect = nextParam?.startsWith("/")
          ? nextParam
          : `/${nextParam}`;
        push(redirect);
      } else {
        push("/dashboard");
      }

      setIsSigningIn(false)
    }

    if (isSignedIn || isLoggedIn) {
      verifyRegistration();
    }
  }, [
    isSignedIn,
    push,
    searchParams,
    session.status,
    session.data?.user.id,
    session.data?.user.email,
  ]);

  const showSwitchToGnosisChain = isConnected && !isChainSupported;
  const showSignOut = isSignedIn && !isSigningIn && !showSwitchToGnosisChain;
  const showSignIn = !isSignedIn && !isSigningIn && !showSwitchToGnosisChain;

  return (
    <div className="flex flex-1">
      <div className="flex mx-12 relative z-20 flex-1 items-center">
        <div className="flex flex-col flex-1 space-y-8 -mt-24">
          <h1 className="text-3xl text-center font-brand">Welcome back</h1>
          {session.status === "loading" ? (
            <div className="flex items-center justify-center">
              <Spinner monochromatic className="w-4 h-4 mr-2" />
              <span>Checking session...</span>
            </div>
          ) : (
            <>
              <form
                className="space-y-4"
                onSubmit={handleSubmit(onEmailSignin)}
              >
                <Input
                  required
                  type="email"
                  placeholder="example@gnosis.io"
                  className="border border-gray-300 rounded-lg p-3 shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  {...register("email")}
                />
                <Button type="submit" className="w-full py-3 rounded-lg">
                  <EnvelopeSimple /> Sign in with Email
                </Button>
              </form>
              <div className="flex items-center justify-center">
                <hr className="w-1/2 border-gray-300" />
                <span className="mx-4 text-gray-500">or</span>
                <hr className="w-1/2 border-gray-300" />
              </div>
              <div className="space-y-4 flex-1 items-center">
                {isSigningIn && (
                  <Button className="w-full">
                    <Spinner monochromatic className="w-4 h-4 mr-2" />
                    Signing in...
                  </Button>
                )}
                {showSwitchToGnosisChain && (
                  <SwitchToGnosisButton className="w-full py-3 rounded-lg" />
                )}
                {showSignIn && (
                  <SiweButton
                    className="w-full py-3 rounded-lg"
                    connectWalletText="Sign in with Wallet"
                  />
                )}
                {isError && (
                  <div className={`p-2 rounded-md text-sm bg-slate-200 w-full`}>
                    We could not find an account associated with your wallet,
                    please try signing up.
                  </div>
                )}
                {showSignOut && (
                  <Button className="w-full" onClick={onSignOut}>
                    Disconnect wallet
                  </Button>
                )}

                <div className="text-center">
                  {`Don't have an account? `}
                  <Link href="/signup" className="underline">
                    Sign up
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SignInPage;
