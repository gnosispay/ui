"use client";

import Link from "next/link";
import { useState } from "react";
import toast from "react-hot-toast";

import Button from "@/components/buttons/buttonv2";

import { BannerWrap } from "../_wrap";
import { CancelOrderDialog } from "./cancel-order-dialog";
import { cancelOrder } from "./actions/cancel-order";

export const ContinueOrderWarning = ({ orderId }: { orderId: string }) => {
  const [cancelOrderDialogVisible, setCancelOrderDialogVisible] =
    useState<boolean>(false);
  const [warningVisible, setWarningVisible] = useState<boolean>(true);

  const onOrderCancel = async () => {
    try {
      await cancelOrder({ orderId });

      setCancelOrderDialogVisible(false);
      setWarningVisible(false);

      toast.success("Order canceled successfully");
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong");
    }
  };

  if (!warningVisible) {
    return null;
  }

  return (
    <>
      <CancelOrderDialog
        isOpen={cancelOrderDialogVisible}
        handleClose={() => setCancelOrderDialogVisible(false)}
        onOrderCancel={onOrderCancel}
      />
      <BannerWrap>
        <div className="bg-gray-100 relative p-4 rounded-md flex gap-3 ">
          <div>
            <h2 className="flex items-center justify-center lg:justify-start text-stone-800 font-semibold">
              Continue your order
            </h2>
            <div className="text-stone-600 mt-2 text-sm">
              {
                "It looks like you've already initialized your card order process. Click below to continue and complete it."
              }
            </div>
            <div className="flex mt-4 gap-3">
              <Link href={`/welcome`}>
                <Button className="py-2">Continue with your order</Button>
              </Link>
              <Button
                className="py-2 bg-red-700"
                onClick={() => setCancelOrderDialogVisible(true)}
              >
                Cancel order
              </Button>
            </div>
          </div>
        </div>
      </BannerWrap>
    </>
  );
};
