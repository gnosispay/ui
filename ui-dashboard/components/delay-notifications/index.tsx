"use client";

import { useEffect } from "react";
import { useToasterStore, toast } from "react-hot-toast/headless";
import useDelayRelay from "@/hooks/use-delay-relay";
import deserializeTransaction from "@/lib/deserialize-transaction";
import DelayNotification from "./delay-notification";
import type { ReactElement } from "react";

const DelayNotifications = ({ account }: { account: `0x${string}` }) => {
  const { toasts } = useToasterStore();
  const { queue } = useDelayRelay(account);

  useEffect(() => {
    if (!Array.isArray(queue)) {return;}
    queue.forEach((tx) => {
      toast(
        <DelayNotification
          status={tx.status}
          transactionData={deserializeTransaction(tx.transactionData)}
          readyDate={tx.readyAt}
          account={account}
        />,
        {
          duration: Infinity,
          id: tx.id,
        },
      );
    });

    queue
      .filter((tx) => tx.status === "EXECUTED")
      .forEach((tx) => {
        toast.dismiss(tx.id);
      });
  }, [queue, account]);

  return (
    <div className="fixed bottom-8 right-8 z-50 flex flex-col gap-4">
      {toasts
        .filter((toast) => toast.visible)
        .map((toast) => {
          return (
            <div
              key={toast.id}
              style={{
                transition: "all 0.5s ease-out",
                opacity: toast.visible ? 1 : 0,
              }}
              {...toast.ariaProps}
            >
              {toast.message as ReactElement}
            </div>
          );
        })}
    </div>
  );
};

export default DelayNotifications;
