"use client";

import { Check } from "@phosphor-icons/react/dist/ssr";
import { useEffect, useRef } from "react";
import { TitleSubtitle } from "@/components/layout/title-subtitle";
import Button from "@/components/buttons/buttonv2";
import { resetMoneriumData } from "./actions";
import type { ReactNode } from "react";

const MoneriumOauth = () => {
  const redirectToApp = () => {
    window.location.href = "/dashboard";
  };

  const hasError = new URLSearchParams(window.location.search).get("error");
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current || !hasError) {
      return;
    }
    hasRun.current = true;
    resetMoneriumData();
  }, [hasError]);

  if (hasError) {
    return (
      <Wrapper>
        <TitleSubtitle title="Error" />
        <p className="text-center text-red-600 mt-4">
          Something went wrong. Please contact support.
        </p>

        <Button className="w-full" onClick={redirectToApp}>
          Back to app
        </Button>
      </Wrapper>
    );
  }

  return (
    <Wrapper>
      <TitleSubtitle title="Success" />
      <div className="bg-green-brand rounded-full w-16 h-16 flex items-center justify-center m-auto">
        <Check size={38} />
      </div>

      <p className="text-center mt-4">Your IBAN is now ready to use!</p>

      <Button className="w-full" onClick={redirectToApp}>
        Back to app
      </Button>
    </Wrapper>
  );
};

const Wrapper = ({ children }: { children: ReactNode }) => (
  <div className="w-full flex-col justify-center items-center bg-white rounded-md shadow-lg m-auto p-8 max-w-lg space-y-4">
    {children}
  </div>
);

export default MoneriumOauth;
