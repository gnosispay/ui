/*
This file is responsible for making sure that the environment variables are set.
It is run on "prebuild".


To make sure that this replciates NextJS behavior we use loadEnvConfig from @next/env
reference: https://nextjs.org/docs/pages/building-your-application/configuring/environment-variables#test-environment-variables
*/

const { loadEnvConfig } = require("@next/env");

const projectDir = process.cwd();
loadEnvConfig(projectDir);

const isVercelProduction = process.env.VERCEL_ENV === "production";

if (!process.env.NEXT_PUBLIC_GNOSIS_PAY_API_URL) {
  throw new Error("NEXT_PUBLIC_GNOSIS_PAY_API_URL is not set");
}

if (!process.env.NEXT_PUBLIC_PAYMENTOLOGY_PUBLIC_KEY) {
  throw new Error("NEXT_PUBLIC_PAYMENTOLOGY_PUBLIC_KEY is not set");
}

if (isVercelProduction && process.env.NEXT_PUBLIC_SAFE_ACCOUNT_ADDRESS) {
  throw new Error(
    "NEXT_PUBLIC_SAFE_ACCOUNT_ADDRESS is a develpment helper and SHOULD NOT be not set in production",
  );
}

if (
  isVercelProduction &&
  process.env.NEXT_PUBLIC_DANGEROUS_OVERRIDE_PAYMENT_AMOUNT
) {
  throw new Error(
    "NEXT_PUBLIC_DANGEROUS_OVERRIDE_PAYMENT_AMOUNT SHOULD NOT be set in production",
  );
}

if (!process.env.NEXT_PUBLIC_WALLET_CONNECT_ID) {
  throw new Error("NEXT_PUBLIC_WALLET_CONNECT_ID is not set");
}
