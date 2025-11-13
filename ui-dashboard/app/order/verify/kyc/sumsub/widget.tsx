"use client";

import React, { useCallback } from "react";
import SumsubWebSdk from "@sumsub/websdk-react";
import { useSession } from "next-auth/react";
import { getSumsubAccessToken } from "./actions";

export const SumsubWidget = ({
  accessToken,
  onSuccess,
  onReject,
}: {
  accessToken: string;
  onSuccess: () => void;
  onReject?: () => void;
}) => {
  const { data: session } = useSession();
  const userId = session?.user?.id;

  const getNewSession = useCallback(async () => {
    if (!userId) {
      return;
    }

    return await getSumsubAccessToken(userId);
  }, [userId]);

  const handleMessage = (type: string, payload: any) => {
    if (type === "idCheck.onApplicantStatusChanged") {
      if (payload?.reviewStatus === "completed") {
        if (payload?.reviewResult?.reviewAnswer === "GREEN") {
          onSuccess();
        } else {
          onReject?.();
        }
      }
    }
  };

  if (!userId) {
    return <></>;
  }

  return (
    <SumsubWebSdk
      accessToken={accessToken}
      expirationHandler={getNewSession}
      style={{ width: "100%", height: "100%" }}
      onMessage={handleMessage}
    />
  );
};
