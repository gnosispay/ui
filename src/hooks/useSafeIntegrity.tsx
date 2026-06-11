import { useState, useEffect, useCallback } from "react";
import type { Address } from "viem";
import { getStorageAt } from "wagmi/actions";
import { wagmiAdapter } from "@/wagmi";

// Known legitimate Gnosis Safe singleton implementations across all versions and deployment types.
// Source: https://github.com/safe-global/safe-deployments (gnosis_safe, gnosis_safe_l2, safe, safe_l2 contracts)
// Any address not in this set indicates the singleton was replaced — a known attack vector.
const KNOWN_SAFE_SINGLETONS = new Set([
  // v1.0.0
  "0xb6029ea3b2c51d09a50b53ca8012feeb05bda35a", // gnosis_safe/canonical
  // v1.1.1 (there is no v1.1.0 in the official deployments)
  "0x34cfac646f301356faa8b21e94227e3583fe3f5f", // gnosis_safe/canonical
  // v1.2.0
  "0x6851d6fdfafd08c0295c392436245e5bc78b0185", // gnosis_safe/canonical
  // v1.3.0
  "0xd9db270c1b5e3bd161e8c8503c55ceabee709552", // gnosis_safe/canonical
  "0x69f4d1788e39c87893c980c06edf4b7f686e2938", // gnosis_safe/eip155
  "0xb00ce5cccdef57e539ddced01df43a13855d9910", // gnosis_safe/zksync
  "0x3e5c63644e683549055b9be8653de26e0b4cd36e", // gnosis_safe_l2/canonical
  "0xfb1bffc9d739b8d520daf37df666da4c687191ea", // gnosis_safe_l2/eip155
  "0x1727c2c531cf966f902e5927b98490fdfb3b2b70", // gnosis_safe_l2/zksync
  // v1.4.1
  "0x41675c099f32341bf84bfc5382af534df5c7461a", // safe/canonical
  "0xc35f063962328ac65ced5d4c3fc5def8dec68dfa", // safe/zksync
  "0x29fcb43b46531bca003ddc8fcb67ffe91900c762", // safe_l2/canonical
  "0x610fca2e0279fa1f8c00c8c2f71df522ad469380", // safe_l2/zksync
  // v1.5.0
  "0xff51a5898e281db6dfc7855790607438df2ca44b", // safe/canonical
  "0xedd160febbd92e350d4d398fb636302fccd67c7e", // safe_l2/canonical
]);

export interface SafeIntegrityResult {
  /** null while loading */
  isCompromised: boolean | null;
  singletonAddress: Address | null;
  isLoading: boolean;
}

/**
 * Detects whether a GnosisSafeProxy's singleton (slot 0) has been replaced
 * with a non-standard implementation — the primary indicator of a Safe takeover attack.
 */
export const useSafeIntegrity = (safeAddress: Address | undefined): SafeIntegrityResult => {
  const [isCompromised, setIsCompromised] = useState<boolean | null>(null);
  const [singletonAddress, setSingletonAddress] = useState<Address | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const check = useCallback(async (address: Address) => {
    setIsLoading(true);

    getStorageAt(wagmiAdapter.wagmiConfig, {
      address,
      slot: "0x0",
    })
      .then((raw) => {
        if (!raw || raw === "0x") {
          setIsCompromised(null);
          setSingletonAddress(null);
          return;
        }
        // Slot 0 stores the singleton as a left-padded 32-byte value; extract the address (last 20 bytes).
        const singleton = `0x${raw.slice(-40)}` as Address;
        setSingletonAddress(singleton);
        setIsCompromised(!KNOWN_SAFE_SINGLETONS.has(singleton.toLowerCase()));
      })
      .catch((err) => {
        console.error("useSafeIntegrity: failed to read Safe singleton slot", err);
        setIsCompromised(null);
        setSingletonAddress(null);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!safeAddress) {
      setIsCompromised(null);
      setSingletonAddress(null);
      return;
    }
    check(safeAddress);
  }, [safeAddress, check]);

  return { isCompromised, singletonAddress, isLoading };
};
