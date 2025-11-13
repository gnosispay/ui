"use client";

import { Question } from "@phosphor-icons/react/dist/ssr";
import toast from "react-hot-toast";
import {
  type FiatCurrencyCode,
  type FiatCurrencySymbol,
  TOKEN_BY_ADDRESS,
} from "@gnosispay/tokens";
import SkeletonLoader from "@/components/skeleton-loader";
import FormatCurrency from "../../../components/format-currency";
import Limit from "./limit";
import CardBalanceWarning from "./card-balance-warning";
import { useAccountBalances } from "./use-balance";

type BalanceProps = {
  account: `0x${string}`;
  currencySymbol: FiatCurrencySymbol;
  currencyName: FiatCurrencyCode;
  tokenAddress: `0x${string}`;
};

const Balance: React.FC<BalanceProps> = ({
  account,
  currencySymbol,
  currencyName,
  tokenAddress,
}) => {
  const { data: balances, isLoading } = useAccountBalances(
    account,
    tokenAddress,
  );

  const token = TOKEN_BY_ADDRESS[tokenAddress];
  if (!token) {
    toast.error("Unsupported token");
    return null;
  }

  // if there is more than 1 cent pending, show the warninr
  const showPendingWarning = balances?.pending
    ? BigInt(balances.pending) > BigInt(0.009 * Math.pow(10, token.decimals))
    : false;
  // if there is more than 1 cent in flagged amount, show the warning
  const showReviewWarning =
    balances?.total && balances?.pending && balances?.spendable
      ? BigInt(balances.total) -
          (BigInt(balances.pending) + BigInt(balances.spendable)) >
        BigInt(0.009 * Math.pow(10, token.decimals))
      : false;

  return (
    <div className="border-b pb-5">
      {showReviewWarning && (
        <div className="py-2">
          <CardBalanceWarning />
        </div>
      )}
      <dl className="flex flex-col gap-8 justify-between sm:flex-row">
        <div className="flex flex-col">
          <dt className="text-sm leading-6 text-gray-500">Balance</dt>
          <dd className="flex gap-1 items-baseline">
            {isLoading ? (
              <SkeletonLoader className="h-[60px] w-[250px]" />
            ) : (
              <FormatCurrency
                currency={currencyName}
                amount={Number(balances?.spendable)}
                decimals={token.decimals}
                currencyClassName="text-4xl"
                integerClassName="text-6xl"
                decimalClassName="text-6xl"
                FractionClassName="text-4xl opacity-100"
              />
            )}
          </dd>

          {showPendingWarning && (
            <div className="flex flex-row items-center gap-2">
              <dd className="flex gap-1 items-baseline">
                <FormatCurrency
                  currency={currencyName}
                  amount={Number(balances?.pending)}
                  decimals={token.decimals}
                  currencyClassName="text-xl ml-2 text-stone-700"
                  integerClassName="text-2xl text-stone-700"
                  decimalClassName="text-xl text-stone-700"
                  FractionClassName="text-xl opacity-100 text-stone-700"
                />
              </dd>

              <div className="bg-stone-200 rounded-md px-2 py-1 text-stone-900 text-sm relative">
                Pending
                <div className="relative inline-block group">
                  {/* <Question className="text-stone-900 inline-block -mt-0.5 ml-1 w-4 h-4" /> */}
                  <span className="w-40 text-center absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs rounded py-1 px-2 shadow-lg hidden group-hover:block">
                    Some of your funds are still pending.
                  </span>

                  <Question className="text-stone-900 inline-block -mt-0.5 ml-1 w-4 h-4" />
                </div>
              </div>
            </div>
          )}
        </div>
        {account && (
          <Limit
            account={account}
            currencySymbol={currencySymbol}
            tokenAddress={tokenAddress}
          />
        )}
      </dl>
    </div>
  );
};

export default Balance;
