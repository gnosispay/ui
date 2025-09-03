"use client";

import Script from "next/script";
import { useFeatureFlagEnabled } from "posthog-js/react";

export const Zendesk = () => {
  const isEnabled = useFeatureFlagEnabled(
    "zendesk-instead-of-intercom-enabled",
  );

  const posthogFeatureFlagsInitialized = typeof isEnabled !== "undefined";

  if (
    !process.env.NEXT_PUBLIC_ZENDESK_KEY ||
    !posthogFeatureFlagsInitialized ||
    !isEnabled
  ) {
    return null;
  }

  return (
    <Script
      id="ze-snippet"
      src={`https://static.zdassets.com/ekr/snippet.js?key=${process.env.NEXT_PUBLIC_ZENDESK_KEY}`}
      strategy="lazyOnload"
    />
  );
};
