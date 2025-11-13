"use client";
import { Gift } from "@phosphor-icons/react/dist/ssr/Gift";
import { useState } from "react";
import { EmptyTile } from "@/app/dashboard/rewards/components/empty-tile";
import Button from "@/components/buttons/buttonv2";
import { DISCORD_LINK, TWITTER_LINK } from "@/lib/constants";
import { ReferralModal } from "@/components/referral-modal";

export const Rewards = () => {
  const [referralModalOpen, setReferralModalOpen] = useState(false);

  return (
    <>
      <EmptyTile
        title="Rewards"
        icon={<Gift />}
        text={
          <>
            Refer 2 friends to get the OG NFT.
            <br />
            {`What is the OG NFT and what are it's benefits?`}
            <br />
            {
              <a
                className="underline"
                href="https://gnosischain.notion.site/Gnosis-Pay-OG-NFT-FAQs-and-Description-a294fc381b7a41c6a80d7af5314ab312"
                target="_blank"
              >
                Read here
              </a>
            }
          </>
        }
        subtext=""
        cta={
          <div className="space-y-4 flex flex-col">
            <Button
              className="flex-1"
              onClick={() => setReferralModalOpen(true)}
            >
              Refer now
            </Button>
            <div className="flex space-y-2 flex-col">
              <span>Join our community</span>
              <div className="flex space-x-4 justify-center items-center">
                <a
                  href={TWITTER_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M9.31264 6.77143L15.1379 0H13.7575L8.69942 5.87954L4.65953 0H0L6.10911 8.8909L0 15.9918H1.38049L6.72197 9.78279L10.9884 15.9918H15.6479L9.3123 6.77143H9.31264ZM7.42187 8.96923L6.8029 8.0839L1.87789 1.03921H3.99824L7.97277 6.7245L8.59175 7.60983L13.7582 14.9998H11.6378L7.42187 8.96957V8.96923Z"
                      fill="black"
                    />
                  </svg>
                </a>
                <a
                  href={DISCORD_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <svg
                    width="24"
                    height="19"
                    viewBox="0 0 24 19"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M20.3303 1.52336C18.7535 0.80145 17.0889 0.289302 15.3789 0C15.1449 0.418288 14.9332 0.848651 14.7447 1.28929C12.9233 1.01482 11.071 1.01482 9.24963 1.28929C9.06097 0.848696 8.84926 0.418339 8.61537 0C6.90435 0.291745 5.23861 0.805108 3.6602 1.52714C0.526645 6.16328 -0.322812 10.6843 0.101917 15.1411C1.937 16.4969 3.99099 17.5281 6.17459 18.1897C6.66628 17.5284 7.10135 16.8269 7.47521 16.0925C6.76512 15.8273 6.07977 15.5001 5.42707 15.1147C5.59885 14.9901 5.76685 14.8617 5.92919 14.7371C7.82839 15.6303 9.90126 16.0934 12 16.0934C14.0987 16.0934 16.1716 15.6303 18.0708 14.7371C18.235 14.8712 18.403 14.9995 18.5729 15.1147C17.9189 15.5007 17.2323 15.8285 16.521 16.0944C16.8944 16.8284 17.3295 17.5294 17.8216 18.1897C20.0071 17.5307 22.0626 16.5001 23.898 15.143C24.3964 9.97452 23.0467 5.49504 20.3303 1.52336ZM8.0132 12.4002C6.82962 12.4002 5.8518 11.3261 5.8518 10.0047C5.8518 8.68334 6.79564 7.59981 8.00942 7.59981C9.2232 7.59981 10.1935 8.68334 10.1727 10.0047C10.1519 11.3261 9.21943 12.4002 8.0132 12.4002ZM15.9868 12.4002C14.8013 12.4002 13.8273 11.3261 13.8273 10.0047C13.8273 8.68334 14.7711 7.59981 15.9868 7.59981C17.2024 7.59981 18.1652 8.68334 18.1444 10.0047C18.1236 11.3261 17.193 12.4002 15.9868 12.4002Z"
                      fill="black"
                    />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        }
      />
      <ReferralModal
        isOpen={referralModalOpen}
        isOgTokenHolder={false}
        onClose={() => setReferralModalOpen(false)}
      />
    </>
  );
};
