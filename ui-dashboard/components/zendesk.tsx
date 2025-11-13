"use client";

import Script from "next/script";

export const Zendesk = () => {
  if (!process.env.NEXT_PUBLIC_ZENDESK_KEY) {
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
