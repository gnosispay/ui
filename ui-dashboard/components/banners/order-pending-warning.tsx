import Link from "next/link";
import Button from "@/components/buttons/buttonv2";
import { BannerWrap } from "./_wrap";

export const OrderPendingWarning = ({
  pendingOrderId,
}: {
  pendingOrderId: string;
}) => {
  return (
    <BannerWrap>
      <div className="bg-gray-100 relative p-4 rounded-md flex gap-3 ">
        <div>
          <h2 className="flex items-center justify-center lg:justify-start text-stone-800 font-semibold">
            Order being processed
          </h2>
          <div className="text-stone-600 mt-2 text-sm">
            {
              "Your order is currently being processed. Please check back later."
            }
          </div>
          <Link href={`/order/status/${pendingOrderId}`}>
            <Button className="mt-3">Check Order Status</Button>
          </Link>
        </div>
      </div>
    </BannerWrap>
  );
};
