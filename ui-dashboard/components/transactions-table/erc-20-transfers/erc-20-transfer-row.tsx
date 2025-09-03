"use client";

import React from "react";
import { Erc20TokenEventDirection } from "@gnosispay/types";
import { ArrowUpRight } from "@phosphor-icons/react";
import { twMerge } from "tailwind-merge";

import { classNames, shortenAddress } from "@/lib/utils";

import FormattedDateTime from "../../format-date";
import SkeletonLoader from "../../skeleton-loader";
import FormatCurrency from "../../format-currency";
import Erc20TransferIcon from "./erc-20-transfer-icon";
import type { Erc20TokenEvent } from "@gnosispay/types";

const Erc20TransferRow = ({
  transaction,
  currencyName,
  tokenDecimals,
}: {
  transaction: Erc20TokenEvent;
  currencyName?: string;
  tokenDecimals?: number;
}) => {
  const { date, direction, hash, from, to, value } = transaction;

  const isIncomingTransfer = direction === Erc20TokenEventDirection.Incoming;

  return (
    <tr className="[&:first-child]:border-t">
      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-xs font-medium sm:pl-2">
        <div className={twMerge("min-w-[100px]")}>
          <SkeletonLoader className="w-20 h-4 inline-block">
            <span className="text-gp-text-hc">
              <FormattedDateTime date={date} format="MMM d" />
            </span>
            <span className="text-gp-text-hc">
              {" at "}
              <FormattedDateTime date={date} format="p" />
            </span>
          </SkeletonLoader>
        </div>
      </td>
      <td className="py-4 pl-3 pr-4  sm:pr-0 border-t">
        <Erc20TransferIcon
          direction={direction}
          classNames="h-5 w-5 text-gp-icon-active"
        />
      </td>
      <td className="whitespace-nowrap px-3 py-4 text-sm text-gp-text-hc border-t font-medium">
        <a
          className="block w-24"
          target="_blank"
          rel="noopener noreferrer"
          href={`https://gnosisscan.io/tx/${hash}`}
        >
          {isIncomingTransfer ? shortenAddress(from) : shortenAddress(to)}
          <ArrowUpRight className="inline-block ml-0.5 mb-1" />
        </a>
      </td>
      <td
        className={twMerge(
          "whitespace-nowrap px-3 py-4 text-sm text-gp-text-hc border-t text-right",
        )}
      >
        {isIncomingTransfer ? "+ " : "- "}
        <FormatCurrency
          currency={currencyName}
          decimals={tokenDecimals!}
          amount={Number(value)}
        />
      </td>

      <td
        className={classNames(
          "whitespace-nowrap px-3 py-4 text-sm text-gp-text-hc border-t text-center",
        )}
      ></td>
    </tr>
  );
};

export default Erc20TransferRow;
