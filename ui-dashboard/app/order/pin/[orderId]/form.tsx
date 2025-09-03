"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import { CaretLeft } from "@phosphor-icons/react/dist/ssr";
import { twMerge } from "tailwind-merge";
import Button from "@/components/buttons/buttonv2";
import { generateEncryptedPinData } from "@/lib/pin";
import { TitleSubtitle } from "../../../../components/layout/title-subtitle";
import { fetchApi, getFutureCardPublicKey } from "../../../../lib/api";
import { SuccessModal } from "../../deposit/[orderId]/components/success-modal";
import PinInput from "./components/pin-input";
import type { Me } from "../../../../lib/get-user";
import type { CardOrder } from "../../types";

const REQUIRED_PIN_LENGTH = 4;

const FORM_STEPS = {
  SET_PIN: {
    id: "set_pin",
    title: "Set Pin",
    subtitle: "Set a new 4-digit PIN for your card",
    buttonText: "Continue",
  },
  CONFIRM_PIN: {
    id: "confirm_pin",
    title: "Confirm Pin",
    subtitle: "Please re-enter your new 4-digit PIN",
    buttonText: "Confirm",
  },
};

const SetPinForm = ({
  orderId,
  user,
}: {
  orderId: string;
  user: Me | null;
}) => {
  const { push } = useRouter();
  const [pin, setPin] = useState<string>("");
  const [confirmedPin, setConfirmedPin] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [formStep, setFormStep] = useState(FORM_STEPS.SET_PIN);
  const [isCardCreated, setIsCardCreated] = useState<boolean>(false);

  const { data: order } = useQuery<CardOrder>({
    queryKey: ["order", orderId],
    queryFn: async () => {
      const { data } = await fetchApi(`/order/${orderId}`);
      return data;
    },
  });

  if (!order) {
    return (
      <div className="flex h-full w-full my-24 justify-center">Loading...</div>
    );
  }

  const createCardAndSetPin = async () => {
    setIsSubmitting(true);

    try {
      if (pin !== confirmedPin) {
        return toast.error(
          "Please enter matching values for the PIN and PIN confirmation",
        );
      }

      const publicKey = await getFutureCardPublicKey();
      const { encryptedPin, encryptedKey, iv } = await generateEncryptedPinData(
        pin,
        publicKey,
      );

      await fetchApi(`/order/${orderId}/card`, {
        method: "POST",
        body: { encryptedPin, encryptedKey, iv },
      });

      setIsCardCreated(true);
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitForm = async () => {
    if (formStep.id === FORM_STEPS.SET_PIN.id) {
      return setFormStep(FORM_STEPS.CONFIRM_PIN);
    }

    await createCardAndSetPin();
  };

  const isSubmitDisabled = () => {
    if (isSubmitting || isCardCreated) {
      return true;
    }

    return formStep.id === FORM_STEPS.SET_PIN.id
      ? pin.length !== REQUIRED_PIN_LENGTH
      : confirmedPin.length !== REQUIRED_PIN_LENGTH;
  };

  return (
    <>
      <div
        className={twMerge(
          "flex h-full w-full flex-col justify-between gap-8 my-24 mx-12 md:mx-48",
          isCardCreated && "pointer-events-none",
        )}
      >
        {formStep.id === FORM_STEPS.CONFIRM_PIN.id && (
          <span
            className="gap-1 flex cursor-pointer"
            onClick={() => {
              setFormStep(FORM_STEPS.SET_PIN);
              setConfirmedPin("");
            }}
          >
            <CaretLeft className="w-6 h-6" /> Back
          </span>
        )}

        <TitleSubtitle title={formStep.title} subtitle={formStep.subtitle} />

        <div className="flex items-center flex-col gap-10">
          <div className="flex items-center justify-center">
            {formStep.id === FORM_STEPS.SET_PIN.id ? (
              <PinInput value={pin} onChange={(pin) => setPin(pin)} />
            ) : (
              <PinInput
                value={confirmedPin}
                onChange={(pinConfirmation) => setConfirmedPin(pinConfirmation)}
              />
            )}
          </div>

          <Button
            className="w-full"
            onClick={submitForm}
            disabled={isSubmitDisabled()}
          >
            {isSubmitting ? "Setting card PIN..." : formStep.buttonText}
          </Button>
        </div>
      </div>

      <SuccessModal
        orderId={orderId}
        isOpen={isCardCreated}
        onClose={() => push(`/order/status/${orderId}`)}
        userEmail={user?.email}
      />
    </>
  );
};

export default SetPinForm;
