import "./globals.css";

import { Figtree } from "next/font/google";
import { Toaster } from "react-hot-toast";
import dynamic from "next/dynamic";
import { SessionProvider } from "next-auth/react";
import { classNames } from "@/lib/utils";

import { ConnectionProvider } from "@/components/providers/wallet-provider";
import { MonitoringProvider } from "@/lib/monitoring-provider";
import MarketingHead from "@/components/marketing/marketing-head";
import MarketingScripts from "@/components/marketing/marketing-scripts";
import QueryProvider from "@/components/providers/query-provider";
import { Zendesk } from "@/components/zendesk";
import { ZendeskInitializer } from "@/components/zendesk-initializer";
import { AppDeprecationBanner } from "@/components/banners/app-deprecation-banner";
import type { Metadata } from "next";

const figtree = Figtree({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Gnosis Pay",
  description: "Decentralization. Accepted Everywhere.",
};

const PostHogPageView = dynamic(() => import("./posthog-page-view"), {
  ssr: false,
});

const CookieBannerComponent = dynamic(
  () => import("@/components/cookie-banner/index"),
  {
    ssr: false,
  },
);

const DeactivatedAccountDialogComponent = dynamic(
  () => import("@/components/deactivated-account-dialog"),
  {
    ssr: false,
  },
);

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={classNames(figtree.className, "h-full bg-white")}
    >
      <head>
        <MarketingHead />
      </head>

      <body className="h-full">
        <Toaster position="top-right" gutter={8} />
        <AppDeprecationBanner />
        <QueryProvider>
          <SessionProvider basePath="/auth">
            <MonitoringProvider>
              <PostHogPageView />
              <Zendesk />

              <ConnectionProvider>
                <MarketingScripts />
                {children}
                <ZendeskInitializer />
              </ConnectionProvider>

              <CookieBannerComponent />
              <DeactivatedAccountDialogComponent />
            </MonitoringProvider>
          </SessionProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
