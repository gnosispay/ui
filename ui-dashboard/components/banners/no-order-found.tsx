import Link from "next/link";
import Button from "@/components/buttons/buttonv2";
import { BannerWrap } from "./_wrap";

export const NoOrdersWarning = () => {
  return (
    <BannerWrap>
      <div className="bg-gray-100 relative p-4 rounded-md flex gap-3 ">
        <div>
          <h2 className="flex items-center justify-center lg:justify-start text-stone-800 font-semibold">
            We could not find any card associated with this account.
          </h2>
          <div className="text-stone-600 mt-2 text-sm">
            {"We could not find any orders associated with this account."}
          </div>
          <Link href="/welcome">
            <Button className="mt-3">Order a Gnosis Pay Card</Button>
          </Link>
        </div>
      </div>
    </BannerWrap>
  );
};
