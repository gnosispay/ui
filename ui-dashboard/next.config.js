import { PrismaPlugin } from "@prisma/nextjs-monorepo-workaround-plugin";

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

export default nextConfig;
