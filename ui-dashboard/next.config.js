import { PrismaPlugin } from "@prisma/nextjs-monorepo-workaround-plugin";
import { withSentryConfig } from "@sentry/nextjs";

/** @type {import('next').NextConfig} */
const nextConfig = {
  skipTrailingSlashRedirect: true,
  rewrites: async () => {
    return [
      {
        source: "/api/:path*",
        destination: `${process.env.NEXT_PUBLIC_GNOSIS_PAY_API_URL}/api/:path*`,
      },
      /**
       * Used to proxy Spindl requests
       */
      {
        source: "/spindl-ingest/:path*",
        destination: "https://spindl.link/:path*",
      },
      /**
       * Used to proxy Layer3 requests
       */
      {
        source: "/partner-quest/:path*",
        destination: `${process.env.NEXT_PUBLIC_GNOSIS_PAY_API_URL}/api/v1/partner-quest/:path*`,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/auth/:path*",
        headers: [{ key: "Cache-Control", value: "no-store, max-age=0" }],
      },
    ];
  },
  async redirects() {
    return [
      {
        source: "/",
        permanent: false,
        destination: "/dashboard",
      },
      {
        source: "/app/signup",
        destination: "/order/verify/kyc/sumsub",
        permanent: false,
      },
      {
        source: "/connect",
        destination: "/signin",
        permanent: true,
      },
      {
        source: "/order/verify/kyc/embedded",
        destination: "/order/verify/kyc/sumsub",
        permanent: true,
      },
    ];
  },
  webpack: (config, { isServer }) => {
    config.externals.push("pino-pretty", "lokijs", "encoding");

    if (isServer) {
      config.plugins = [...config.plugins, new PrismaPlugin()];
    }

    return config;
  },
  transpilePackages: [
    "@lifi/widget",
    "@lifi/wallet-management",
    "@web3-name-sdk/core",
  ],
};

export default withSentryConfig(nextConfig, {
  // For all available options, see:
  // https://github.com/getsentry/sentry-webpack-plugin#options

  // Suppresses source map uploading logs during build
  silent: true,
  org: "gnosis-pay",
  project: "ui-dashboard",
  tunnelRoute: "/sentry-tunnel",
  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Transpiles SDK to be compatible with IE11 (increases bundle size)
  transpileClientSDK: true,

  // Routes browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers (increases server load)

  // Hides source maps from generated client bundles
  hideSourceMaps: true,

  // Automatically tree-shake Sentry logger statements to reduce bundle size
  disableLogger: true,
});
