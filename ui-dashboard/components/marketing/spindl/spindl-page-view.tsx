"use client";

import spindl from "@spindl-xyz/attribution";
import { useSession } from "next-auth/react";
import { useEffect, useRef } from "react";

const SpindlPageView = () => {
  const eventTriggered = useRef(false);
  const { data: session } = useSession();
  const userId = session?.user?.id;

  useEffect(() => {
    if (!eventTriggered.current && userId) {
      spindl.pageView();
      spindl.track("client_sign", {}, { customerUserId: userId });
      eventTriggered.current = true;
    }
  }, [userId]);

  return null;
};

export default SpindlPageView;
