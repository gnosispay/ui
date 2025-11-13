"use client";

import { useState } from "react";
import { formatUnits } from "viem";
import { createInnerLimitTransaction } from "@gnosispay/account-kit";

import { type FiatCurrencySymbol, TOKEN_BY_ADDRESS } from "@gnosispay/tokens";
import toast from "react-hot-toast";
import useAccountQuery from "@/hooks/use-account-query";
import useDelayRelay from "@/hooks/use-delay-relay";

import FillableBar from "@/app/dashboard/(balances)/fillable-bar";
import LimitDialog from "@/app/dashboard/(balances)/limit-dialog";
import SkeletonLoader from "@/components/skeleton-loader";

const oneDay = 60 * 60 * 24;
const startOfTodayDate = new Date();
startOfTodayDate.setHours(0, 0, 0, 0);
const startOfToday = startOfTodayDate.getTime() / 1000;

interface LimitProps {
  account: `0x${string}`;
  currencySymbol: FiatCurrencySymbol;
  tokenAddress: `0x${string}`;
}

const Limit: React.FC<LimitProps> = ({
  account,
  currencySymbol,
  tokenAddress,
}) => {
  const { data, isLoading } = useAccountQuery(account);
  const { delayRelay } = useDelayRelay(account);
  const [open, setOpen] = useState(false);
  const [isSignatureInProgress, setIsSignatureInProgress] = useState(false);

  const token = TOKEN_BY_ADDRESS[tokenAddress];
  if (!token) {
    toast.error("Unsupported token");
    return null;
  }

  const limit = Number(
    (data?.allowance?.refill || BigInt(0)) / BigInt(10 ** token.decimals),
  );

  const updateLimit = async (newLimit: number) => {
    setIsSignatureInProgress(true);

    try {
      await delayRelay(
        createInnerLimitTransaction(account, {
          refill: BigInt(newLimit) * BigInt(10 ** token.decimals),
          period: oneDay,
          timestamp: startOfToday,
        }),
      );
    } catch (e) {}

    setIsSignatureInProgress(false);
    setOpen(false);
  };

  return (
    <div className="w-full sm:w-[250px] flex flex-col justify-end items-end gap-2">
      <div className="flex flex-col gap-1 w-full">
        <div className="flex justify-between w-full items-center">
          <dt>Spendable today</dt>
          <dd>
            <SkeletonLoader isLoading={isLoading}>
              {data?.allowance && (
                <>
                  {currencySymbol}
                  {formatUnits(
                    data.allowance.balance,
                    token.decimals,
                  ).toString()}
                </>
              )}
            </SkeletonLoader>
          </dd>
        </div>
        <SkeletonLoader className="w-full h-[4px]" isLoading={isLoading}>
          {data?.allowance && (
            <FillableBar
              fillPercent={
                data.allowance.refill === BigInt(0)
                  ? 0
                  : (Number(data.allowance.balance) /
                      Number(data.allowance.refill)) *
                    100
              }
            />
          )}
        </SkeletonLoader>
      </div>
      <SkeletonLoader className="w-40 inline-block h-6" isLoading={isLoading}>
        <div className="flex gap-2">
          <div className="text-gray-500">
            Limit: {currencySymbol}
            {data?.allowance && limit}
            /day
          </div>
          <button
            className="text-blue-500 hover:text-blue-700"
            onClick={() => {
              setOpen(true);
            }}
          >
            Edit
          </button>
          <LimitDialog
            value={limit}
            onChange={updateLimit}
            isOpen={open}
            onClose={() => {
              setOpen(false);
            }}
            currencySymbol={currencySymbol}
            safeAddress={account}
            isSignatureInProgress={isSignatureInProgress}
          />
        </div>
      </SkeletonLoader>
    </div>
  );
};

export default Limit;
