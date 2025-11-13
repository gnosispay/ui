"use client";
import classNames from "classnames";
import Image from "next/image";
import { useState } from "react";
import { format } from "date-fns";
import { ogBannerText } from "@/lib/rewards-constants";
import { OGModal } from "./og-modal";
import type { Token } from "@gnosispay/prisma/client";

export const OGBanner = ({ ogToken }: { ogToken?: Token }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div
        className={classNames(
          "w-full h-28 bg-green-brand-light bg-cover rounded-lg flex items-center px-4 gap-4",
          { "cursor-pointer": !ogToken },
        )}
        style={{
          backgroundImage: "url('/static/rewards-banner-lines.svg')",
        }}
        onClick={() => {
          if (!ogToken) {
            setIsModalOpen(true);
          }
        }}
      >
        <Image src="/static/og-nft.png" alt="OG NFT" width={80} height={80} />
        <div className="flex flex-col gap-1">
          {ogToken ? (
            <>
              <h1 className="text-xl font-brand">
                OG #{Number(ogToken.tokenId)}
              </h1>
              <p className="text-green-brand-dark text-sm">
                Since {format(ogToken.created, "MMMM dd, yyyy")}
              </p>
              <a
                onClick={() => setIsModalOpen(true)}
                className="text-primary text-sm underline cursor-pointer"
              >
                See details
              </a>
            </>
          ) : (
            <>
              <h1 className="text-primary text-lg font-medium">
                🚀 Boost your rewards with the OG NFT!
              </h1>
              <h3 className="text-base font-normal">{ogBannerText}</h3>
            </>
          )}
        </div>
      </div>
      <OGModal
        ogToken={ogToken}
        onClose={() => setIsModalOpen(false)}
        isOpen={isModalOpen}
      />
    </>
  );
};
