"use client";
import Image from "next/image";
import { Hourglass, ShieldWarning } from "@phosphor-icons/react";
import { TOKEN_BY_ADDRESS } from "@gnosispay/tokens";
import toast from "react-hot-toast";
import { CreditCardFrontBase } from "@/app/activation/lib/gnosis-pay-card";
import BalanceCard from "../(balances)/balance-card";
import { useAccountBalances } from "../(balances)/use-balance";

interface BalanceProps {
  tokenAddress: `0x${string}`;
  safeAddress: `0x${string}`;
  currencyName: string;
}

export const TotalBalanceCard = ({
  tokenAddress,
  safeAddress,
  currencyName,
}: BalanceProps) => {
  const { data: balances } = useAccountBalances(safeAddress, tokenAddress);
  const token = TOKEN_BY_ADDRESS[tokenAddress];
  if (!token) {
    toast.error("Unsupported token");
    return null;
  }

  const linkToSafe = `https://app.safe.global/transactions/history?safe=gno:${safeAddress}`;
  return (
    <BalanceCard
      className="w-full px-2 mb-4"
      title="Safe Balance"
      description={
        <div>
          The total amount deposited in {currencyName} on your{" "}
          <a href={linkToSafe} target="_blank" className="underline">
            Safe account
          </a>
          . Whatever happens, you&apos;re always in control of all the money on
          your Safe.
        </div>
      }
      currencyName={currencyName}
      amount={(balances?.total && BigInt(balances?.total)) || BigInt(0)}
      decimals={token.decimals}
      icon={
        <Image
          src="/static/safe-logo.svg"
          className="mb-auto"
          width={54}
          height={54}
          alt="Safe Logo"
        />
      }
    />
  );
};

export const SpendableBalanceCard = ({
  tokenAddress,
  safeAddress,
  currencyName,
}: BalanceProps) => {
  const { data: balances } = useAccountBalances(safeAddress, tokenAddress);
  const token = TOKEN_BY_ADDRESS[tokenAddress];
  if (!token) {
    toast.error("Unsupported token");
    return null;
  }
  return (
    <BalanceCard
      className="mb-4 w-full"
      title="Spendable Balance"
      description="This amount is immediately spendable from your Gnosis Pay Card."
      currencyName={currencyName}
      amount={(balances?.spendable && BigInt(balances?.spendable)) || BigInt(0)}
      decimals={token.decimals}
      icon={<CreditCardFrontBase className="h-full w-full rounded-none" />}
    />
  );
};

export const PendingBalanceCard = ({
  tokenAddress,
  safeAddress,
  currencyName,
}: BalanceProps) => {
  const { data: balances } = useAccountBalances(safeAddress, tokenAddress);
  const token = TOKEN_BY_ADDRESS[tokenAddress];
  if (!token) {
    toast.error("Unsupported token");
    return null;
  }
  return (
    <BalanceCard
      className="mb-4 w-full"
      title="Pending Top Up"
      description={`This amount will soon be spendable refresh the dashboard in a few minutes.`}
      currencyName={currencyName}
      amount={(balances?.pending && BigInt(balances?.pending)) || BigInt(0)}
      decimals={token.decimals}
      icon={<Hourglass className="h-7 w-7 text-stone-800 rounded-none" />}
    />
  );
};

export const InReviewBalanceCard = ({
  tokenAddress,
  safeAddress,
  currencyName,
}: BalanceProps) => {
  const { data: balances } = useAccountBalances(safeAddress, tokenAddress);
  const flaggedAmount =
    (balances?.total &&
      balances?.pending &&
      balances?.spendable &&
      BigInt(balances?.total) -
        (BigInt(balances?.pending) + BigInt(balances?.spendable))) ||
    BigInt(0);
  const token = TOKEN_BY_ADDRESS[tokenAddress];
  if (!token) {
    toast.error("Unsupported token");
    return null;
  }
  const showReviewWarning =
    flaggedAmount > BigInt(0.009 * Math.pow(10, token.decimals));
  return showReviewWarning ? (
    <BalanceCard
      className="mb-4 w-full"
      title="In Review Balance"
      description="This amount is currently under review, and not available for spending. Please contact support to learn more."
      currencyName={currencyName}
      amount={
        (balances?.total &&
          BigInt(balances?.total) -
            (BigInt(balances?.pending) + BigInt(balances?.spendable))) ||
        BigInt(0)
      }
      decimals={token.decimals}
      icon={
        <div className="w-7 h-7 opacity-80 absolute l-0">
          <ShieldWarning className="h-7 w-7 text-stone-800 rounded-none" />
        </div>
      }
    />
  ) : null;
};
