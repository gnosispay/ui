import { useEffect, useState } from "react";

import { Gift } from "@phosphor-icons/react";
import Dialog from "@/components/dialog";
import { fetchApi } from "@/lib/api";
import { GNOSIS_REFERRAL_FAQ_URL } from "@/lib/constants";
import { modalNonOgTokenHolderText } from "@/lib/rewards-constants";
import { modalOgTokenHolderText } from "@/lib/rewards-constants";
import CopyableInput from "./inputs/copyable-input";

export const ReferralModal = ({
  isOpen,
  onClose,
  isOgTokenHolder,
}: {
  isOpen: boolean;
  onClose: () => void;
  isOgTokenHolder: boolean;
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [referralLink, setReferralLink] = useState("");

  useEffect(() => {
    if (isOpen) {
      fetchApi("/user/referrer-code", {
        method: "POST",
      })
        .then(({ data }) => {
          if (isOgTokenHolder) {
            setReferralLink(
              `https://gnosispay.com/oginvite?rcc=${data.referrerCode}&utm_source=referral&utm_campaign=${data.userId}`,
            );
          } else {
            setReferralLink(
              `https://gnosispay.com/nonoginvite?rcc=${data.referrerCode}&utm_source=referral&utm_campaign=${data.userId}`,
            );
          }
        })
        .catch(() => {
          console.error("Error fetching referral code");
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [isOpen]);

  if (isLoading) {
    return;
  }

  return (
    <Dialog
      isOpen={isOpen}
      handleClose={onClose}
      containerClassName="p-0 max-w-xl"
      backgroundColor="gp-bg-subtle"
      zIndex={100}
      absolutelyCentered
    >
      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <>
          <div className="px-6 pb-6 pt-16 text-center space-y-8">
            <Gift size={64} color="#84ab4e" className="w-full" />
            <h1 className="text-3xl mt-4 font-brand">Refer and Earn</h1>

            <p className="mt-4 text-gray-900">
              {isOgTokenHolder
                ? modalOgTokenHolderText
                : modalNonOgTokenHolderText}
            </p>
            <p className="mt-4 text-gray-900">
              For more details read our{" "}
              <a
                href={GNOSIS_REFERRAL_FAQ_URL}
                className="font-semibold underline"
              >
                Referral Program FAQ
              </a>
            </p>
            <CopyableInput label="Your referral link" text={referralLink} />
          </div>
        </>
      )}
    </Dialog>
  );
};
