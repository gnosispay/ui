import { useEffect, useState } from "react";
import type { Address } from "viem";
import { loadSafeRecoveryData } from "@/utils/safeRecoveryData";

interface UseSafeRecoveryDataResult {
  affected: boolean | undefined;
  hasPreHackBalance: boolean | undefined;
  isLoading: boolean;
}

export const useSafeRecoveryData = (address: Address | undefined): UseSafeRecoveryDataResult => {
  const [affected, setAffected] = useState<boolean | undefined>(undefined);
  const [hasPreHackBalance, setHasPreHackBalance] = useState<boolean | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!address) {
      setAffected(undefined);
      setHasPreHackBalance(undefined);
      setIsLoading(false);
      return;
    }

    let active = true;
    setIsLoading(true);

    loadSafeRecoveryData()
      .then((data) => {
        if (!active) return;
        const entry = data[address.toLowerCase()];
        if (entry) {
          setAffected(entry.affected);
          setHasPreHackBalance(parseFloat(entry.balance) > 0);
        } else {
          setAffected(undefined);
          setHasPreHackBalance(undefined);
        }
      })
      .catch((error) => {
        console.error("Error loading safe recovery data:", error);
        if (active) {
          setAffected(undefined);
          setHasPreHackBalance(undefined);
        }
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [address]);

  return { affected, hasPreHackBalance, isLoading };
};
