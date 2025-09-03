import prisma from "@gnosispay/prisma";
import { SUPPORTED_TOKENS, TOKEN_TO_CURRENCY } from "@gnosispay/tokens";
import { auth } from "@/auth";
import { CASHBACK_TOS_SLUG, GNO_TOKEN_ADDRESS } from "@/lib/constants";
import { fetchErc20Transfers } from "@/lib/erc-20";
import { ReferralTile } from "./components/referral-tile";
import { CashbackTile } from "./components/cashback-tile/cashback-tile";
import { RecentTransactions } from "./components/recent-transactions";
import {
  byWhitelistedSender,
  mergeTransactionsByDate,
} from "./utils/transactions";
import { SENDER_CASHBACK_ADDRESS, SENDER_REFERRAL_ADDRESS } from "./constants";
import { verifyOgStatus } from "./actions/verify-og";
import { OGBanner } from "./components/og-banner";

export default async function Page() {
  const session = await auth();

  const user = await prisma.user.findUnique({
    where: { id: session?.user.id },
    include: {
      SafeAccount: true,
      Token: true,
      Terms: {
        where: {
          terms: CASHBACK_TOS_SLUG,
        },
      },
    },
  });

  const safe = user?.SafeAccount?.[0];
  const safeAddress = safe?.address as `0x${string}` | undefined;

  const token = safe?.tokenSymbol
    ? SUPPORTED_TOKENS[safe.tokenSymbol]
    : undefined;

  const cashbackGnoTransactions = safeAddress
    ? await fetchErc20Transfers({
        safeAddress,
        tokenAddress: GNO_TOKEN_ADDRESS,
      })
    : [];

  const referralEurTransactions = safeAddress
    ? await fetchErc20Transfers({
        safeAddress,
        tokenAddress: SUPPORTED_TOKENS["EURe"].address,
      })
    : [];

  const cashbackTransactions = cashbackGnoTransactions.filter(
    byWhitelistedSender([SENDER_CASHBACK_ADDRESS]),
  );

  const referralTransactions = referralEurTransactions.filter(
    byWhitelistedSender([SENDER_REFERRAL_ADDRESS]),
  );

  const mergedTransactions = mergeTransactionsByDate(
    cashbackTransactions,
    referralTransactions,
  );

  const ogToken = user?.Token?.[0];
  const isOgTokenHolder = !!ogToken;

  if (!isOgTokenHolder) {
    verifyOgStatus();
  }

  if (!user) {
    return null;
  }

  const currencyCode = token ? TOKEN_TO_CURRENCY[token.symbol] : undefined;

  return (
    <div className="p-8 space-y-8">
      <OGBanner ogToken={ogToken} />
      <div className="space-y-8 md:space-y-0 md:space-x-8 flex flex-col md:flex-row">
        <CashbackTile
          isOgTokenHolder={isOgTokenHolder}
          user={user}
          safeAddress={safeAddress}
          safeCurrency={currencyCode}
        />
        <ReferralTile isOgTokenHolder={isOgTokenHolder} />
      </div>
      <RecentTransactions transactions={mergedTransactions} />
    </div>
  );
}
