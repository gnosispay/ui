import { cookies } from "next/headers";
import {
  SUPPORTED_CURRENCIES,
  SUPPORTED_TOKENS,
  TOKEN_TO_CURRENCY,
} from "@gnosispay/tokens";
import getUser from "@/lib/get-user";

import {
  InReviewBalanceCard,
  PendingBalanceCard,
  SpendableBalanceCard,
  TotalBalanceCard,
} from "./balances";
import type { TokenSymbol } from "@gnosispay/prisma/client";

export default async function Home() {
  const user = await getUser(cookies);

  const gnosisPayAccountData = user?.accounts.filter(
    (account: any) => account.type === "L1SAFE",
  );
  const safeTokenSymbol: TokenSymbol = gnosisPayAccountData?.[0]?.tokenSymbol;

  const token = SUPPORTED_TOKENS[safeTokenSymbol];
  const currency = SUPPORTED_CURRENCIES[TOKEN_TO_CURRENCY[safeTokenSymbol]];

  const showReviewWarning = false;
  const safeAddress = gnosisPayAccountData?.[0]?.address as
    | `0x${string}`
    | undefined;
  if (!safeAddress) {
    return null;
  }

  return (
    <div className="flex flex-col gap-4 pt-6">
      <TotalBalanceCard
        tokenAddress={token?.address}
        safeAddress={safeAddress}
        currencyName={currency.code}
      />
      <div
        className={`grid grid-cols-1 md:grid-cols-2 gap-3 ${
          showReviewWarning ? "lg:grid-cols-3" : "grid-cols-2"
        }`}
      >
        <SpendableBalanceCard
          tokenAddress={token?.address}
          safeAddress={safeAddress}
          currencyName={currency.code}
        />
        <PendingBalanceCard
          tokenAddress={token?.address}
          safeAddress={safeAddress}
          currencyName={currency.code}
        />
        <InReviewBalanceCard
          tokenAddress={token?.address}
          safeAddress={safeAddress}
          currencyName={currency.code}
        />
      </div>
    </div>
  );
}
