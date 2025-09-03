"use client";

import spindl from "@spindl-xyz/attribution";
import { useEffect, useRef } from "react";
import { useAccount } from "wagmi";

const Spindl = () => {
  const spindlInitialized = useRef(false);
  const eventTriggered = useRef(false);
  const { address } = useAccount();

  useEffect(() => {
    /**
     * Spindl was not initialized yet
     */
    if (!spindlInitialized.current) {
      spindl.configure({
        host: `${window.location.origin}/spindl-ingest`,
        sdkKey: process.env.NEXT_PUBLIC_SPINDL_SDK_KEY as string,
        debugMode: false,
      });
      spindlInitialized.current = true;
    }
  }, []);

  useEffect(() => {
    /**
     * Wallet tracking event wasn't triggered, and the Spindl SDK is initialized.
     *
     * We have a connected account, so we notify Spindl about it.
     */
    if (!eventTriggered.current && spindlInitialized.current && !!address) {
      spindl.attribute(address);
      eventTriggered.current = true;
    }
  }, [address, spindlInitialized]);

  return null;
};

export default Spindl;
