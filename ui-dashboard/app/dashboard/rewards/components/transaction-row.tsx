import { format } from "date-fns";
import { formatEther } from "viem";
import { useState, useMemo } from "react";
import Dialog from "@/components/dialog";
import { shortenAddress } from "@/lib/utils";
import {
  computeCashbackPeriod,
  getTransactionMeta,
} from "../utils/transactions";
import type { Erc20TokenEvent } from "@gnosispay/types";

export const TransactionRow = ({
  transaction,
}: {
  transaction: Erc20TokenEvent;
}) => {
  const { Icon, title, currency } = getTransactionMeta(transaction);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const transactionDateLabel = useMemo(() => {
    if (title === "Cashback") {
      const { cashbackPeriodStart, cashbackPeriodEnd } = computeCashbackPeriod(
        transaction.date,
      );

      const formattedStart = format(cashbackPeriodStart, "MMM d");
      const formattedEnd = format(cashbackPeriodEnd, "MMM d");

      return `Cashback for ${formattedStart} - ${formattedEnd}`;
    }

    return format(transaction.date, "MMM dd, HH:mm");
  }, [title, transaction.date]);

  return (
    <>
      <a
        className=" flex justify-between p-4 hover:bg-tertiary items-center cursor-pointer"
        onClick={() => setIsDetailsOpen(true)}
      >
        <div className="space-x-2 flex">
          <div>
            <div className="rounded-full bg-warning-yellow text-warning p-2 text-2xl">
              <Icon />
            </div>
          </div>
          <div className="flex flex-col">
            <h5 className="text-primary">{title}</h5>
            <p className="text-sm text-secondary">{transactionDateLabel}</p>
          </div>
        </div>

        <div className="text-primary">
          +{Number(formatEther(transaction.value as bigint)).toFixed(2)}{" "}
          {currency}
        </div>
      </a>
      <Dialog
        isOpen={isDetailsOpen}
        handleClose={() => setIsDetailsOpen(false)}
        containerClassName="p-0 rounded-lg overflow-hidden"
      >
        <div className="bg-bg-secondary items-center justify-center py-16">
          <div className="flex flex-col space-y-3 justify-between items-center">
            <h5 className="text-primary">{title}</h5>

            <p className="text-primary text-3xl">
              +{Number(formatEther(transaction.value as bigint)).toFixed(2)}{" "}
              {currency}
            </p>
            <p className="text-sm text-secondary">{transactionDateLabel}</p>
          </div>
        </div>
        <div className="bg-white p-4 space-y-4 flex flex-col">
          <div className="justify-between items-center flex">
            <p>Status</p>
            <p className="text-success">Complete</p>
          </div>
          <div className="justify-between items-center flex">
            <p>TxHash</p>
            <a
              className="text-green hover:underline"
              target="_blank"
              href={`https://gnosisscan.io/tx/${transaction.hash}`}
            >
              {shortenAddress(transaction.hash)}
            </a>
          </div>
          <div className="justify-between items-center flex">
            <p>Category</p>
            <p className="text-green">Rewards</p>
          </div>
        </div>
      </Dialog>
    </>
  );
};
