"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import Button from "@/components/buttons/buttonv2";
import { BannerWrap } from "./_wrap";

export const MissingInfoKYcWarning = () => {
  /**
   * We want to show the Redo KYC warning on
   * all pages except on the KYC pages.
   */
  const pathname = usePathname();
  if (pathname.includes("/kyc")) {
    return null;
  }

  return (
    <BannerWrap>
      <div className="bg-orange-100 relative p-4 rounded-md flex gap-3">
        <div>
          <h2 className="flex items-center justify-center lg:justify-start text-stone-800 font-semibold">
            Please update your KYC verification
          </h2>
          <div className="text-stone-600 mt-2 text-sm">
            {`We regularly revise our KYC policies to be compliant with applicable regulations in our active jurisdictions. Please update your KYC verification as it has one or more missing items.`}
          </div>
          <Link href="/dashboard/kyc">
            <Button className="mt-3">Update information</Button>
          </Link>
        </div>
      </div>
    </BannerWrap>
  );
};
