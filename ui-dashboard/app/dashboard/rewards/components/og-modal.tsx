import Image from "next/image";
import { CheckCircle, X } from "@phosphor-icons/react";
import { Lock } from "@phosphor-icons/react/dist/ssr";
import Dialog from "@/components/dialog";
import { shortenAddress } from "@/lib/utils";
import { rewardSeasonEndDate } from "@/lib/rewards-constants";
import type { Token } from "@gnosispay/prisma/client";

export const OGModal = ({
  ogToken,
  isOpen,
  onClose,
}: {
  ogToken?: Token;
  isOpen: boolean;
  onClose: () => void;
}) => {
  return (
    <Dialog
      isOpen={isOpen}
      handleClose={onClose}
      containerClassName="p-0 max-w-xl bg-bg-secondary"
      absolutelyCentered
    >
      <div className="bg-black rounded-lg">
        <X
          className="text-white text-2xl absolute top-4 right-4 cursor-pointer"
          onClick={onClose}
        />
        {ogToken ? (
          <>
            <div className="flex justify-center text-white p-4 ">
              <div className="w-40 h-40 my-4">
                <Image
                  src="/static/og-nft.png"
                  alt="Placeholder Image"
                  className="rounded-full w-full h-full object-cover"
                  width={160}
                  height={160}
                />
              </div>
            </div>

            <div className="text-center my-2 text-white">
              <h1 className="text-3xl font-brand">
                OG NFT #{Number(ogToken.tokenId)}
              </h1>
            </div>

            <div className="bg-white rounded-lg p-4 mt-4 divide-y flex flex-col">
              <div className="mb-4">
                <h2 className="text-primary font-medium mb-2">My benefits</h2>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="text-success text-2xl" />
                    1% extra cashback
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="text-success text-2xl" />
                    Early access to new features
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="text-success text-2xl" />
                    IRL experiences
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="text-success text-2xl" />
                    Perks with our partners
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="text-success text-2xl" />
                    <span className="text-wrap flex-1">
                      Private Discord Channel for alpha, networking &
                      conversations with the GP team directly
                    </span>
                  </li>
                </ul>
              </div>

              <div className="pt-4">
                <h2 className="text-primary font-medium mb-2">NFT details</h2>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Contract</span>
                    <a href="#">
                      {shortenAddress(
                        ogToken.contractAddress as `0x${string}`,
                        10,
                        10,
                      )}
                    </a>
                  </div>
                  <div className="flex justify-between">
                    <span>Token ID</span>
                    <a href="#">ERC-721: {ogToken.tokenId}</a>
                  </div>
                  <div className="flex justify-between">
                    <span>Created by</span>
                    <a href="#">
                      {shortenAddress(
                        ogToken.safeAddress as `0x${string}`,
                        10,
                        10,
                      )}
                    </a>
                  </div>
                  <div className="flex justify-between">
                    <span>Collection</span>
                    <a href="#">Gnosis Pay</a>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="flex justify-center text-white p-4">
              <div className="w-40 h-40 my-12">
                <Image
                  src="/static/og-nft-locked.png"
                  alt="Placeholder Image"
                  className="rounded-full w-full h-full object-cover"
                  width={160}
                  height={160}
                />
              </div>
            </div>

            <div className="text-center my-2 text-white">
              <h1 className="text-3xl font-brand">OG NFT</h1>
            </div>

            <div className="bg-white rounded-lg p-4 mt-4 flex flex-col">
              <div className="mb-4">
                <h2 className="text-primary font-medium mb-2">
                  OG NFT holders can unlock the following benefits
                </h2>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <Lock className="text-2xl" />
                    1% extra cashback
                  </li>
                  <li className="flex items-center gap-2">
                    <Lock className="text-2xl" />
                    Early access to new features
                  </li>
                  <li className="flex items-center gap-2">
                    <Lock className="text-2xl" />
                    IRL experiences
                  </li>
                  <li className="flex items-center gap-2">
                    <Lock className="text-2xl" />
                    Perks with our partners
                  </li>
                  <li className="flex items-center gap-2">
                    <Lock className="text-2xl" />
                    EURe/GBPe rewards for referring friends
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="text-success text-2xl" />
                    <span className="text-wrap flex-1">
                      Private Discord Channel for alpha, networking &
                      conversations with the GP team directly
                    </span>
                  </li>
                </ul>
              </div>
              <div className="gap-2 flex flex-col">
                <h3 className="text-primary font-medium">
                  How to get the OG NFT?
                </h3>
                <p className="text-primary">
                  You can refer 2 friends to earn the OG NFT. This offer ended
                  on {rewardSeasonEndDate}. There is currently no active
                  referral season.
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </Dialog>
  );
};
