"use client";
import { Key, FloppyDisk, Eye, EyeSlash } from "@phosphor-icons/react/dist/ssr";
import { useEffect, useRef, useState } from "react";
import { twMerge } from "tailwind-merge";
import { useSearchParams } from "next/navigation";
import api from "@/lib/api";
import {
  decryptSecret,
  encryptSessionKey,
  generateSessionKey,
} from "@/lib/cryptography";
import { generateEncryptedPinData, serializeFromPinBlock2 } from "@/lib/pin";
import { getCardPublicKey } from "@/lib/api";
import Button from "../../../../components/buttons/button";
import Input from "../../../../components/inputs/input-base";
import Spinner from "../../../../components/spinner";

const PingSettings = ({ cardId }: { cardId?: string }) => {
  const [pin, setPin] = useState("****");
  const [allowChange, setAllowChange] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  // <remove me>
  // we have some issues with changing pin atm but we still want an easy way to test
  // so exposing the functionality through changePin query param
  const params = useSearchParams();
  const changePin = params.get("changePin");
  // const isFrozen = defaultIsFrozen;
  const showChangePin = changePin === "true";

  // </remove me>

  const toggleShow = async () => {
    try {
      if (!show) {
        await getPin();
      }
      setShow(!show);
    } catch (error) {
      //TODO: show error with toast
      console.log(error);
      setLoading(false);
    }
  };

  const getPin = async () => {
    setLoading(true);
    const key = generateSessionKey();
    if (!cardId) throw new Error("Card ID not set");

    const cardPublicKey = await getCardPublicKey(cardId);
    const encryptedKey = await encryptSessionKey(key, cardPublicKey);
    const res = await api().get(
      `/cards/${cardId}/pin?encryptedKey=${encodeURIComponent(encryptedKey)}`,
    );
    if (!res.ok) {
      throw new Error("Failed to fetch card pin");
    }
    const { encryptedPin, iv } = await res.json();
    const pinBlock = await decryptSecret(encryptedPin, key, iv);
    const pin = serializeFromPinBlock2(pinBlock);
    setPin(pin);
    setLoading(false);
  };

  const Icon = show ? Eye : EyeSlash;

  const toggleAllowChange = async () => {
    if (!allowChange) {
      setPin("");
      setShow(true);
      setTimeout(() => {
        input.current?.select();
      }, 100);
      setAllowChange(true);
    } else {
      setPin("****");
      setShow(false);
      setAllowChange(false);
    }
  };

  const handleSavePin = async () => {
    setLoading(true);

    if (!cardId) throw new Error("Card ID not set");
    const cardPublicKey = await getCardPublicKey(cardId);
    const { encryptedPin, encryptedKey, iv } = await generateEncryptedPinData(
      pin,
      cardPublicKey,
    );

    const res = await api().post(`/cards/${cardId}/pin`, {
      encryptedPin,
      encryptedKey,
      iv,
    });
    //TODO: show error with toast
    if (!res.ok) {
      throw new Error("Failed to set card pin");
    }
    setLoading(false);
    setPin("****");
    setShow(false);
    setAllowChange(false);
  };

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    if (show && !allowChange) {
      timeout = setTimeout(() => setShow(false), 1000 * 60); // 1 minute
    }
    return () => clearTimeout(timeout);
  }, [show, allowChange]);

  return (
    <div className="flex flex-col gap-4 pl-16 pr-8 pb-8 relative">
      <Key className="h-6 w-6 text-gray-400 absolute top-0 left-6" />
      <div className="relative">
        <div>
          <h2 className="text-lg ">Your PIN</h2>
          <p className="text-gp-text-lc mb-4">
            You can change the PIN by visiting an ATM.
          </p>

          <div className="flex items-center gap-4 relative">
            <div className="relative">
              <Input
                type={show ? "text" : "password"}
                value={pin}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                  setPin(event.target.value)
                }
                className={twMerge(
                  "pr-8 max-w-[120px]",
                  !allowChange && "border-transparent",
                )}
                disabled={!allowChange}
                ref={input}
              />
              <Icon
                className="absolute right-3 top-3 text-gray-400 h-4 w-4 cursor-pointer"
                onClick={toggleShow}
              />
            </div>
            {loading && <Spinner className="absolute -left-6 w-3" />}

            <Button
              disabled={!allowChange}
              onClick={() => handleSavePin()}
              className={twMerge(
                "border-0 text-blue-600 bg-transparent py-0 px-2 h-fit text-sm whitespace-nowrap",
                !allowChange && "opacity-0 disabled:opacity-0",
              )}
            >
              <FloppyDisk className="h-4 w-4" />
              Update PIN
            </Button>
          </div>
        </div>
        {showChangePin && (
          <Button
            className="absolute top-0 right-0 border-0 text-gray-500 bg-transparent py-0 px-2 h-fit text-sm whitespace-nowrap"
            onClick={toggleAllowChange}
          >
            {allowChange ? "Cancel" : "Change PIN"}
          </Button>
        )}
      </div>
    </div>
  );
};

export default PingSettings;
