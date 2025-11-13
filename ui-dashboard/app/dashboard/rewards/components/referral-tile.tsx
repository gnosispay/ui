"use client";
import { Gift } from "@phosphor-icons/react/dist/ssr";
import { useState } from "react";
import Button from "@/components/buttons/buttonv2";
import { ReferralModal } from "@/components/referral-modal";
import { GNOSIS_REFERRAL_FAQ_URL } from "@/lib/constants";
import {
  rewardSeasonEndDate,
  tileNonOgTokenHolderText,
  tileOgTokenHolderText,
} from "@/lib/rewards-constants";
import { EmptyTile } from "./empty-tile";

export const ReferralTile = ({
  isOgTokenHolder,
}: {
  isOgTokenHolder: boolean;
}) => {
  const [referralModalOpen, setReferralModalOpen] = useState(false);

  return (
    <>
      <EmptyTile
        title="Referral"
        icon={<Gift />}
        text={
          <>
            {isOgTokenHolder ? tileOgTokenHolderText : tileNonOgTokenHolderText}
            {` `}
            {
              <a
                className="underline"
                href={GNOSIS_REFERRAL_FAQ_URL}
                target="_blank"
              >
                Learn more
              </a>
            }
          </>
        }
        subtext={`This offer ended on ${rewardSeasonEndDate}. There is currently no active referral season.`}
        cta={
          <Button className="flex-1" onClick={() => setReferralModalOpen(true)}>
            Refer now
          </Button>
        }
      />
      <ReferralModal
        isOpen={referralModalOpen}
        isOgTokenHolder={isOgTokenHolder}
        onClose={() => setReferralModalOpen(false)}
      />
    </>
  );
};
