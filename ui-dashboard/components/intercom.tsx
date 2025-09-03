"use client";

import { ErrorBoundary } from "@sentry/nextjs";
import { useFeatureFlagEnabled } from "posthog-js/react";
import { IntercomProvider } from "react-use-intercom";

interface IntercomProps {
  userEmail?: string;
  intercomUserHash?: string;
  shouldInitialize: boolean;
  children: React.ReactNode;
}

const Intercom = ({
  userEmail,
  intercomUserHash,
  shouldInitialize,
  children,
}: IntercomProps) => {
  const isEnabled = useFeatureFlagEnabled(
    "zendesk-instead-of-intercom-enabled",
  );

  const posthogFeatureFlagsInitialized = typeof isEnabled !== "undefined";

  const intercomEnabled =
    shouldInitialize && posthogFeatureFlagsInitialized && !isEnabled;

  return (
    <ErrorBoundary
      onError={(error) => {
        console.error("Intercom Error caught:", error);
      }}
      fallback={<>{children}</>}
    >
      <IntercomProvider
        appId={process.env.NEXT_PUBLIC_INTERCOM_APP_ID || ""}
        shouldInitialize={intercomEnabled}
        autoBoot={intercomEnabled}
        autoBootProps={{
          email: userEmail,
          userHash: intercomUserHash,
        }}
      >
        {children}
      </IntercomProvider>
    </ErrorBoundary>
  );
};

export default Intercom;
