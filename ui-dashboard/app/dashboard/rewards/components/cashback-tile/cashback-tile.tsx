"use client";
import { useState } from "react";
import { Info, MoneyWavy } from "@phosphor-icons/react/dist/ssr";
import { useBalance } from "wagmi";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { formatUnits, type Address } from "viem";
import { PAYMENT_CHAIN_ID } from "@/app/activation/lib/constants";
import { CASHBACK_TOS_SLUG, GNO_TOKEN_ADDRESS } from "@/lib/constants";
import FormatCurrency from "@/components/format-currency";
import { Tile } from "../tile";
import { EmptyTile } from "../empty-tile";
import { CashbackRateModal } from "../cashback-rate-modal";
import { calculateCashbackRate } from "../../utils/rate";
import { OgTokenTag } from "../og-token-tag";
import { CashbackCtas } from "./cashback-ctas";
import { TileRow } from "./tile-row";
import type { Prisma } from "@gnosispay/prisma/client";

export type UserWithTerms = Prisma.UserGetPayload<{
  include: { Terms: true; SafeAccount: true };
}>;
export const CashbackTile = ({
  user,
  safeAddress,
  isOgTokenHolder,
  safeCurrency = "EUR",
}: {
  user: UserWithTerms;
  safeAddress?: Address;
  isOgTokenHolder: boolean;
  safeCurrency?: string | undefined;
}) => {
  const [isCashbackRateOpen, setIsCashbackRateOpen] = useState(false);

  const { data: gnoBalance } = useBalance({
    address: safeAddress,
    chainId: PAYMENT_CHAIN_ID,
    token: GNO_TOKEN_ADDRESS,
  });

  const { data: gnoPrice } = useQuery<number>({
    queryKey: ["gnoPrice", safeCurrency],
    queryFn: async () => {
      const response = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=gnosis&vs_currencies=${safeCurrency}`,
      );
      const data = await response.json();
      return data.gnosis[safeCurrency.toLowerCase()];
    },
  });

  const isUserFromUK = user.country === "GB";

  const gnoNumberValue = gnoBalance?.value
    ? Number(formatUnits(gnoBalance.value, 18))
    : 0;

  const calculatedRate = calculateCashbackRate(gnoNumberValue);

  const optedInCashback = user.Terms.some(
    (term) => term.terms === CASHBACK_TOS_SLUG,
  );

  if (optedInCashback && gnoNumberValue && gnoNumberValue > 0) {
    const gnoFiatValue =
      gnoPrice && gnoBalance ? gnoNumberValue * gnoPrice : null;

    return (
      <Tile
        title="Cashback"
        icon={<MoneyWavy />}
        cta={
          <CashbackCtas
            safeAddress={safeAddress}
            optedInCashback={optedInCashback}
            isUserFromUK={isUserFromUK}
          />
        }
        moreLink={
          <a
            className="text-secondary cursor-pointer"
            onClick={() => setIsCashbackRateOpen(true)}
          >
            Learn more
          </a>
        }
      >
        <div className="space-y-4">
          <TileRow
            label={
              <div className="flex space-x-2 items-center">
                <Image
                  src="/static/logo-simple-black.svg"
                  alt="Gnosis Pay"
                  width={16}
                  height={16}
                />
                <span>GNO balance</span>
              </div>
            }
            value={gnoNumberValue.toFixed(2)}
            subvalue={
              gnoFiatValue ? (
                <FormatCurrency
                  currency={safeCurrency}
                  amount={gnoFiatValue}
                  decimals={0}
                  FractionClassName="hidden"
                  decimalClassName="hidden"
                />
              ) : (
                "-"
              )
            }
          />
          <TileRow
            label={
              <div className="flex space-x-2 items-center">
                <span>Cashback rate</span>
                <Info
                  className="cursor-pointer"
                  onClick={() => setIsCashbackRateOpen(true)}
                />
              </div>
            }
            value={
              <div className="flex space-x-2 items-center">
                <span>{calculatedRate.toFixed(2)}%</span>
                {isOgTokenHolder && <OgTokenTag />}
              </div>
            }
          />
          {/* <TileRow label="Total cashback rewards" value="-" subvalue="-" /> */}
        </div>
        {safeAddress && (
          <CashbackRateModal
            safeAddress={safeAddress}
            isOpen={isCashbackRateOpen}
            onClose={() => setIsCashbackRateOpen(false)}
            isOgTokenHolder={isOgTokenHolder}
          />
        )}
      </Tile>
    );
  }

  return (
    <EmptyTile
      title="Cashback"
      icon={<MoneyWavy />}
      text={
        <>
          The more $GNO you have in your Gnosis Pay Safe the higher the cashback
          rate, with up to 4% cashback*.{" "}
          <a
            onClick={() => {
              setIsCashbackRateOpen(true);
            }}
          >
            See cashback rates
          </a>
        </>
      }
      subtext={`OG NFT holders earn an extra 1% cashback`}
      cta={
        <CashbackCtas
          safeAddress={safeAddress}
          isUserFromUK={isUserFromUK}
          optedInCashback={optedInCashback}
        />
      }
    />
  );
};
