"use client";

import { Eye, EyeSlash } from "@phosphor-icons/react/dist/ssr";
import { useEffect, useState } from "react";
import { twMerge } from "tailwind-merge";
import api from "@/lib/api";
import {
  decryptSecret,
  encryptSessionKey,
  generateSessionKey,
} from "@/lib/cryptography";
import { getCardPublicKey } from "@/lib/api";
import Button from "@/components/buttons/buttonv2";
import CardBack from "../../../../components/card-details/card-back";
import CardFront from "../../../../components/card-details/card-front";

/**
 * Interface for the response of card details
 *
 * @typedef {Object} CardDetailsResponse
 * @property {string} exp_date - The expiry date of the card in the format YYDD
 * @property {string} cvv - The encrypted CVV of the card
 * @property {string} iv - The initialization vector for the encryption
 * @property {string} secret - The PAN of the card
 */
export interface CardDetailsResponse {
  exp_date: string;
  cvv: string;
  iv: string;
  secret: string;
}
export interface CardInfo {
  pan: string;
  cvv: string;
  expiry: string;
}

const CardViewer = ({ cardId, name }: { cardId?: string; name?: string }) => {
  const [show, setShow] = useState(false);
  const [cardInfo, setCardInfo] = useState<CardInfo>();

  const toggleShow = async () => {
    try {
      if (!cardId) throw new Error("Card ID not set");

      setShow(!show);
      if (show) {
        return;
      }

      const key = generateSessionKey();
      const cardPublicKey = await getCardPublicKey(cardId);
      const encryptedKey = await encryptSessionKey(key, cardPublicKey);
      const res = await api().get(
        `/cards/${cardId}/details?encryptedKey=${encodeURIComponent(
          encryptedKey,
        )}`,
      );

      if (!res.ok) {
        throw new Error("Failed to fetch card info");
      }
      const cardInfo: CardDetailsResponse = await res.json();
      const decryptedCvv = await decryptSecret(cardInfo.cvv, key, cardInfo.iv);
      const decryptedPan = await decryptSecret(
        cardInfo.secret,
        key,
        cardInfo.iv,
      );

      const formattedDate =
        cardInfo.exp_date.slice(2) + "/" + cardInfo.exp_date.slice(0, 2);
      setCardInfo({
        pan: decryptedPan,
        cvv: decryptedCvv,
        expiry: formattedDate,
      });
    } catch (error) {
      //TODO: show error with toast
      console.log(error);
    }
  };

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    if (show) {
      timeout = setTimeout(() => setShow(false), 1000 * 60); // 1 minute
    }
    return () => clearTimeout(timeout);
  }, [show]);

  return (
    <div className="flex-grow relative flex-col flex items-center gap-8 pt-10">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="436"
        height="459"
        viewBox="0 0 436 459"
        fill="none"
        className="absolute top-0 right-0 h-full w-full z-0"
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M380.644 18.8873C430.079 52.9373 435.105 123.11 435.546 183.07C435.887 229.511 404.397 265.133 382.754 306.202C358.309 352.591 349.613 410.844 302.919 434.748C247.127 463.309 178.281 467.416 121.993 439.69C61.3555 409.821 11.4442 353.102 1.54168 286.297C-7.84672 222.959 34.9198 167.08 74.0833 116.474C107.996 72.6534 151.722 40.7853 204.556 23.9669C262.699 5.45815 330.349 -15.7553 380.644 18.8873Z"
          fill="#EEF6D6"
        />
      </svg>
      <div className="group [perspective:1000px]">
        <div
          className={twMerge(
            "aspect-[160/253] h-[450px] m-auto z-10 relative transition-all duration-1000 [transform-style:preserve-3d] ease-in-out",
            show && "[transform:rotateY(180deg)]",
          )}
        >
          <CardFront className="absolute top-0 left-0 w-full h-auto rounded-xl shadow-gp-card [backface-visibility:hidden] ph-no-capture" />
          <CardBack
            cardInfo={cardInfo}
            cardholderName={name}
            className="absolute top-0 left-0 w-full h-auto rounded-xl shadow-gp-card [transform:rotateY(180deg)] [backface-visibility:hidden] ph-no-capture"
          />
        </div>
      </div>
      <Button className="z-10 relative w-fit" onClick={toggleShow}>
        {show ? <EyeSlash className="h-6 w-6" /> : <Eye className="h-6 w-6" />}
        {show ? "Hide" : "See"} card details
      </Button>
    </div>
  );
};

export default CardViewer;
