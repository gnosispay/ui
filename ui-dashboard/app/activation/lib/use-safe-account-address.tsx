"use client";
import { useEffect, useState } from "react";
import { fetchApi } from "@/lib/api";
import type { Address } from "viem";

export const useSafeAccountAddress = (chainId: string) => {
  const [safeAccountAddress, setSafeAccountAddress] = useState<Address | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const retrieveSafeAccountAddress = async () => {
      // Check for environment variable
      const envSafeAccountAddress = process.env
        .NEXT_PUBLIC_SAFE_ACCOUNT_ADDRESS as `0x${string}`;
      if (envSafeAccountAddress) {
        console.warn(
          "Using NEXT_PUBLIC_SAFE_ACCOUNT_ADDRESS for testing purposes",
          envSafeAccountAddress,
        );
        setSafeAccountAddress(envSafeAccountAddress);
      } else {
        try {
          const { data } = await fetchApi("/account/", {
            method: "POST",
            body: { chainId },
          });
          setSafeAccountAddress(data?.address);
        } catch (e) {
          const errorMessage = `Error retrieving safe account address: ${e}`;
          console.error(errorMessage);
          setError(errorMessage);
        }
      }
    };

    retrieveSafeAccountAddress();
  }, [chainId]);

  return { safeAccountAddress, error };
};
