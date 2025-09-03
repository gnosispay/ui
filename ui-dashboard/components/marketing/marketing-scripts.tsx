"use client";

import { useEffect } from "react";

import { GTM_EVENTS, triggerEvent as triggerGTMEvent } from "@/lib/gtm";
import getUser from "@/lib/get-user";

import Spindl from "./spindl";
import GTM from "./gtm";

const MarketingScripts = () => {
  useEffect(() => {
    const initializeUserData = async () => {
      const user = await getUser();

      triggerGTMEvent(GTM_EVENTS.ACTIONS.USER_INITIALIZED, {
        email: user?.email,
        firstName: user?.firstName,
        lastName: user?.lastName,
        phone: user?.phone,
        city: user?.city?.toLowerCase(),
        state: user?.state?.toLowerCase()?.replace(/\s/g, ""),
        postalCode: user?.postalCode,
        country: user?.country?.toLowerCase(),
      });
    };

    initializeUserData();
  }, []);

  if (process.env.NEXT_PUBLIC_ENABLE_MARKETING_SCRIPTS === "true") {
    return (
      <>
        <GTM />
        <Spindl />
      </>
    );
  }

  return null;
};

export default MarketingScripts;
