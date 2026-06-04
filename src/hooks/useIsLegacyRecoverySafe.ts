import { useEffect, useState } from "react";
import type { Address } from "viem";
import { loadLegacyRecoverySafes } from "@/utils/legacyRecoverySafes";

interface UseIsLegacyRecoverySafeResult {
  isEligible: boolean;
  isLoading: boolean;
}

/**
 * Checks whether the given Safe address is part of the legacy recovery list.
 * The underlying asset is only fetched when an address is provided, so users
 * without an old Safe never download the list.
 */
export const useIsLegacyRecoverySafe = (address: Address | undefined): UseIsLegacyRecoverySafeResult => {
  const [isEligible, setIsEligible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!address) {
      setIsEligible(false);
      setIsLoading(false);
      return;
    }

    let active = true;
    setIsLoading(true);

    loadLegacyRecoverySafes()
      .then((safes) => {
        if (active) {
          setIsEligible(safes.has(address.toLowerCase()));
        }
      })
      .catch((error) => {
        console.error("Error loading legacy recovery safes:", error);
        if (active) {
          setIsEligible(false);
        }
      })
      .finally(() => {
        if (active) {
          setIsLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [address]);

  return { isEligible, isLoading };
};
