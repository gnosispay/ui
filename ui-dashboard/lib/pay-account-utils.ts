import {
  SUPPORTED_CURRENCIES,
  SUPPORTED_TOKENS,
  TOKEN_TO_CURRENCY,
} from "@gnosispay/tokens";
import type { UserData } from "./get-user";

export const getPaySafeAccounts = (user: UserData | null) => {
  const gnosisPayAccountData = user?.accounts.filter(
    (account: any) => account.type === "L1SAFE",
  );

  const gnosisPayAccount = gnosisPayAccountData?.[0]?.address as
    | `0x${string}`
    | undefined;

  const safeTokenSymbol = gnosisPayAccountData?.[0]?.tokenSymbol;

  return {
    safeAddress: gnosisPayAccount,
    safeTokenData: safeTokenSymbol
      ? SUPPORTED_TOKENS[safeTokenSymbol]
      : undefined,
    currencyData: safeTokenSymbol
      ? SUPPORTED_CURRENCIES[TOKEN_TO_CURRENCY[safeTokenSymbol]]
      : undefined,
  };
};
