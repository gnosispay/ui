"use client";

import React from "react";

import { redirect } from "next/navigation";
import { SumsubWidget } from "@/app/order/verify/kyc/sumsub/widget";

export const KycForm = ({
  sumsubAccessToken,
}: {
  sumsubAccessToken: string;
}) => {
  return (
    <SumsubWidget
      accessToken={sumsubAccessToken}
      onSuccess={() => {
        redirect("/dashboard");
      }}
    />
  );
};
