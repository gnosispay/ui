"use client";

import { useEffect } from "react";
import { ArrowsCounterClockwiseIcon, ArrowSquareOutIcon, ButterflyIcon, ExportIcon, Warning } from "@phosphor-icons/react";
import Link from "next/link";
import posthog from "posthog-js";
import { signOut } from "next-auth/react";
import Button from "@/components/buttons/buttonv2";

export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
}) {
  const resetAuthState = async () => {
    try {
      posthog?.reset();
      localStorage.clear();
      sessionStorage.clear();
      
      await signOut({ redirect: true, redirectTo: "/signin" });
      
    } catch (resetError) {
      console.error('Failed to reset auth state:', resetError);
    }
  };

  useEffect(() => {
    posthog.captureException(error, { global_error: true });
  }, [error]);

  return (
    <html>
      <body>
        <div className="bg-gp-bg-app min-h-screen flex flex-col items-center justify-center gap-4 p-4">
          <Warning size={64} weight="thin" className="text-red-500" />
          
          <h1 className="text-4xl font-bold text-gray-900">
            Something went wrong
          </h1>
          
          <p className="text-gray-600 text-center max-w-md">
            We&apos;re sorry, but something unexpected happened. Our team has been notified.
          </p>

          <span className="text-gray-600 text-center max-w-md">
            In the meantime, we suggest you try out our new{" "}
            <Link
              className="underline"
              href="https://app.gnosispay.com/"
            >
              web app
            </Link>
            .
          </span>
          <span className="text-gray-600 text-center max-w-md">
            Alternatively, you might try again or reach out to us in our{" "}
            <Link
              className="underline"
              href="https://discord.com/invite/gnosispay"
            >
              discord server
            </Link>
            .
          </span>

          <Button
            onClick={() => open('https://app.gnosispay.com', '__blank')}
            className="mt-6 px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Login to new Web App (wallet only) <ArrowSquareOutIcon size={20} />
          </Button>
          <Button
            onClick={resetAuthState}
            className="mt-0 px-6 py-3 bg-transparent text-black bg-rounded-lg hover:bg-gray-300 transition-colors"
          >
            Reset App & Sign In Again <ArrowsCounterClockwiseIcon size={20} />
          </Button>
        </div>
      </body>
    </html>
  );
}
