"use client";

import { ArrowSquareOut } from "@phosphor-icons/react";
import React from "react";
import { twMerge } from "tailwind-merge";
import { Disclosure } from "@headlessui/react";
import { ArrowSquareIn } from "@phosphor-icons/react/dist/ssr";
import { friendlyFormatIBAN } from "ibantools";
import {
  MoneriumOrderKind,
  MoneriumPaymentStandard,
  type MoneriumIbanOrder,
} from "@gnosispay/types";
import { classNames } from "@/lib/utils";
import FormattedDateTime from "../../format-date";
import SkeletonLoader from "../../skeleton-loader";

export const BankTransferRow = ({
  moneriumIbanOrder,
  showDate,
}: {
  moneriumIbanOrder: MoneriumIbanOrder;
  showDate: boolean;
}) => {
  const {
    state: transferState,
    meta: { placedAt },
    counterpart: {
      details: { name: counterpartName },
      identifier,
    },
    amount,
    kind,
    memo,
    currency,
  } = moneriumIbanOrder;

  const isIbanTransfer = identifier.standard === MoneriumPaymentStandard.IBAN;

  const counterpart = isIbanTransfer
    ? friendlyFormatIBAN(identifier.iban)
    : identifier.address;

  const isIncomingTransfer = kind === MoneriumOrderKind.Issue;

  const formattedAmount = Number(amount)
    .toLocaleString("en-US", {
      style: "currency",
      currency: currency.toUpperCase(),
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
      useGrouping: true,
    })
    .replace(",", ".");

  const dateTime = new Date(placedAt);

  const getTransferStatusColor = (status: string) => {
    if (status === "processed") {
      return "text-success";
    }

    if (status === "rejected") {
      return "text-red-400";
    }

    return "text-warning";
  };

  const getTransferStatusLabel = (status: string) => {
    return `${status.charAt(0).toUpperCase()}${status.slice(1)}`;
  };

  return (
    <Disclosure>
      <Disclosure.Button as={React.Fragment}>
        {({ open }) => (
          <tr
            className={classNames(
              open && "bg-gp-sand",
              "hover:cursor-pointer hover:bg-gp-sand [&:first-child]:border-t",
            )}
          >
            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-xs font-medium sm:pl-2">
              <div
                className={twMerge(
                  "min-w-[100px]",
                  !open && !showDate && "invisible",
                )}
              >
                <SkeletonLoader className="w-20 h-4 inline-block">
                  <span className="text-gp-text-hc">
                    <FormattedDateTime date={dateTime} format="MMM d" />
                  </span>
                  {open && (
                    <span className="text-gp-text-lc">
                      {" at "}
                      <FormattedDateTime date={dateTime} format="p" />
                    </span>
                  )}
                </SkeletonLoader>
              </div>
            </td>

            <td className="whitespace-nowrap px-3 py-4 text-sm text-gp-text-hc border-t">
              <div className="flex flex-row gap-2">
                {isIncomingTransfer ? (
                  <ArrowSquareIn className="h-5 w-5 text-gp-icon-active" />
                ) : (
                  <ArrowSquareOut className="h-5 w-5 text-gp-icon-active" />
                )}

                {counterpartName || ""}
              </div>
            </td>
            <td
              className={twMerge(
                "whitespace-nowrap px-3 py-4 text-sm text-gp-text-hc border-t text-right",
              )}
            >
              <span className="relative">
                {isIncomingTransfer ? "+" : "-"} {formattedAmount}
              </span>
            </td>

            <td
              className={classNames(
                "whitespace-nowrap px-3 py-4 text-sm text-gp-text-hc border-t text-center",
              )}
            ></td>
          </tr>
        )}
      </Disclosure.Button>
      <Disclosure.Panel as="tr" className="bg-gp-sand">
        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-0"></td>
        <td
          className="relative whitespace-nowrap py-4 pr-4 text-sm font-medium sm:pr-0 pl-3"
          colSpan={5}
        >
          <div className="flex justify-between">
            <div className="flex gap-8">
              <div className="flex flex-row gap-32">
                <div className="flex flex-col text-secondary gap-3">
                  <p>Status</p>
                  <p>{isIbanTransfer ? "IBAN" : "Address"}</p>
                  <p>Reference</p>
                </div>
                <div className="flex flex-col gap-3">
                  <p className={getTransferStatusColor(transferState)}>
                    {getTransferStatusLabel(transferState)}
                  </p>
                  <p className="text-primary">{counterpart}</p>
                  <p className="text-primary">{memo || "-"}</p>
                </div>
              </div>
            </div>
          </div>
        </td>
      </Disclosure.Panel>
    </Disclosure>
  );
};
