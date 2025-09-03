import {
  SUPPORTED_CURRENCIES,
  SUPPORTED_TOKENS,
  TOKEN_TO_CURRENCY,
} from "@gnosispay/tokens";
import type { TokenSymbol } from "@gnosispay/prisma/client";
import type { Me } from "./get-user";

export const getPaySafeAccounts = (user: Me | null) => {
  const gnosisPayAccountData = user?.accounts.filter(
    (account: any) => account.type === "L1SAFE",
  );

  const gnosisPayAccount = gnosisPayAccountData?.[0]?.address as
    | `0x${string}`
    | undefined;

  const safeTokenSymbol: TokenSymbol = gnosisPayAccountData?.[0]?.tokenSymbol;

  return {
    safeAddress: gnosisPayAccount,
    safeTokenData: SUPPORTED_TOKENS[safeTokenSymbol],
    currencyData: SUPPORTED_CURRENCIES[TOKEN_TO_CURRENCY[safeTokenSymbol]],
  };
};
