"use client";
import posthog from "posthog-js";
import { PostHogProvider } from "posthog-js/react";

import { useSession } from "next-auth/react";
import { posthogHostUrl } from "./posthog";

export function MonitoringProvider({ children }: { children: React.ReactNode }) {
  const session = useSession();

  if (session.data?.user) {
    posthog.identify(session.data.user.id, {
      email: session.data.user.email,
    });
  }

  return (
    <PostHogProvider
      apiKey={process.env.NEXT_PUBLIC_POSTHOG_KEY}
      options={{
        api_host: "/relay-gp-ph",
        ui_host: posthogHostUrl,
        capture_pageview: false,
        capture_pageleave: true,
        persistence: "localStorage+cookie",
      }}
    >
      {children}
    </PostHogProvider>
  );
}
