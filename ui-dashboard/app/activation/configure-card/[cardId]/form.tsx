"use client";
import React, { useState } from "react";
import { useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { captureException } from "@sentry/nextjs";
import toast from "react-hot-toast";
import { useAccount } from "wagmi";
import PinToggle from "@/components/pin-toggle";

import { fetchApi } from "@/lib/api";
import SiweButton from "@/components/buttons/siwe-button";
import Button from "@/components/buttons/buttonv2";
import Spinner from "@/components/spinner";
import { Label } from "../../lib/text-field";
import FirstTransactionModal from "./first-transaction-modal";
import { revalidateDashboard } from "./actions";

export const CardActivationWithoutPin: React.FC<{
  userCountry?: string;
}> = ({ userCountry }) => {
  const {
    handleSubmit,
    formState: { isLoading, isValid, isSubmitting },
  } = useForm();
  const { isConnected } = useAccount();
  const params = useParams();
  const [cardActivationModalVisible, setCardActivationModalVisible] =
    useState<boolean>(false);

  const updateCardStatus = async (cardId: string) => {
    const { data } = await fetchApi(`/cards/${cardId}/activate`, {
      method: "POST",
    });

    return data;
  };

  const handleActivate = async () => {
    const cardId = params?.cardId;
    try {
      await updateCardStatus(cardId as string);
      await revalidateDashboard();
      setCardActivationModalVisible(true);
    } catch (error: any) {
      console.error(error);
      captureException(error);
      if (error) {
        toast.error(`Failed to activate card: ${error.message}`);
      }
    }
  };

  const showLoading = isLoading || isSubmitting;
  const disableSubmit = !isValid || showLoading;

  return (
    <>
      <form onSubmit={handleSubmit(handleActivate)}>
        <div className="relative flex flex-col gap-4">
          <Label htmlFor="cardPin">View your PIN</Label>

          <div className="text-sm text-gray-500">
            You can always check or change your PIN in card details section.
          </div>

          <div className=" max-w-max">
            <PinToggle cardId={params?.cardId as string} />
          </div>
          {!isConnected && <SiweButton className="w-full" />}
          {isConnected && (
            <Button type="submit" disabled={disableSubmit}>
              {showLoading && <Spinner monochromatic className="w-3 h-3" />}
              Activate Card
            </Button>
          )}
        </div>
      </form>

      <FirstTransactionModal
        isOpen={cardActivationModalVisible}
        userCountry={userCountry}
        handleClose={() => {
          setCardActivationModalVisible(false);
        }}
      />
    </>
  );
};

export default CardActivationWithoutPin;
