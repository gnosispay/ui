// PinInput.tsx
import { Eye, EyeSlash } from "@phosphor-icons/react/dist/ssr";
import { useRef, useState } from "react";
import { twMerge } from "tailwind-merge";
import { captureException } from "@sentry/nextjs";
import {
  decryptSecret,
  encryptSessionKey,
  generateSessionKey,
} from "@/lib/cryptography";
import { serializeFromPinBlock2 } from "@/lib/pin";
import { fetchApi, getCardPublicKey } from "@/lib/api";
import Input from "./inputs/input-base";
import Spinner from "./spinner";

interface PinToggle {
  cardId: string;
}

const PinToggle = ({ cardId }: PinToggle) => {
  const [pin, setPin] = useState("****");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  const Icon = show ? Eye : EyeSlash;

  const toggleShow = async () => {
    try {
      if (!show) {
        await getPin();
      }
      setShow(!show);
    } catch (error) {
      //TODO: show error with toast
      console.error(error);
      setLoading(false);
    }
  };

  const getPin = async () => {
    setLoading(true);
    try {
      const key = generateSessionKey();
      const publicKey = await getCardPublicKey(cardId);
      const encryptedKey = await encryptSessionKey(key, publicKey);
      const { data } = await fetchApi(
        `/cards/${cardId}/pin?encryptedKey=${encodeURIComponent(encryptedKey)}`,
      );

      const { encryptedPin, iv } = data;

      const pinBlock = await decryptSecret(encryptedPin, key, iv);
      const pin = serializeFromPinBlock2(pinBlock);
      setPin(pin);
    } catch (error) {
      captureException(error);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex relative items-center">
        <Input
          type={show ? "text" : "password"}
          value={pin}
          className={twMerge("pr-8 max-w-[120px]", "border-transparent")}
          disabled={true}
          ref={input}
        />
        <Icon
          className="absolute right-3 top-3 text-gray-400 h-4 w-4 cursor-pointer"
          onClick={toggleShow}
        />
        {loading && <Spinner className="absolute -left-6 w-3 h-3" />}
      </div>
    </>
  );
};

export default PinToggle;
