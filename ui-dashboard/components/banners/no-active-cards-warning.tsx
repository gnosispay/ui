import Link from "next/link";
import Button from "@/components/buttons/buttonv2";
import { BannerWrap } from "./_wrap";

export const NoActiveCardsWarning = () => {
  return (
    <BannerWrap>
      <div className="bg-gray-100 relative p-4 rounded-md flex gap-3 border-gp-border border">
        <div className="">
          <h2 className="flex items-center justify-center lg:justify-start text-stone-800 font-semibold ">
            No active cards
          </h2>
          <div className="text-stone-600 mt-2 text-sm">
            {"Your Gnosis Pay Card is not activated yet."}
          </div>
          <Link href="/activation/start">
            <Button className="mt-3">Activate your card now</Button>
          </Link>
        </div>
      </div>
    </BannerWrap>
  );
};
