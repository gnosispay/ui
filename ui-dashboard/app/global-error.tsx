"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";
import { Warning } from "@phosphor-icons/react";
import Link from "next/link";
import posthog from "posthog-js";

export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
}) {

  useEffect(() => {
    Sentry.captureException(error);
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
            Please try again later, or reach out to us in our{" "}
            <Link
              className="underline"
              href="https://discord.com/invite/gnosispay"
            >
              discord server
            </Link>
            .
          </span>
        </div>
      </body>
    </html>
  );
}
