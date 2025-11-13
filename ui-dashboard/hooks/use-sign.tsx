"use client";

import { useCallback } from "react";
import { useAccount, useWalletClient } from "wagmi";
import { switchChain } from "@wagmi/core";
import toast from "react-hot-toast";
import { wagmiConfig } from "@/components/providers/wallet-provider";
import { ImportantNotification } from "@/components/important-notification/important-notification";
import { parseSignature, serializeSignature } from "viem";

type DataString = `0x${string}`;

const adjustVInSignature = (signature: DataString): DataString => {
  const ETHEREUM_V_VALUES = [0, 1, 27, 28];
  const MIN_VALID_V_VALUE_FOR_SAFE_ECDSA = 27;
  let signatureV = parseInt(signature.toString().slice(-2), 16);

  if (!ETHEREUM_V_VALUES.includes(signatureV)) {
    throw new Error("Invalid signature");
  }

  // Metamask with ledger returns V=0/1 here too, we need to adjust it to be ethereum's valid value (27 or 28)
  if (signatureV < MIN_VALID_V_VALUE_FOR_SAFE_ECDSA) {
    signatureV += MIN_VALID_V_VALUE_FOR_SAFE_ECDSA;
  }

  return `${signature.slice(0, -2)}${signatureV.toString(16)}` as DataString;
};

/** Returns the signTypedData function making sure the wallet is set to the right account and chain */
const useSign = () => {
  const { data: client } = useWalletClient();
  const { address, isConnected } = useAccount();

  const sign = useCallback(
    async (params: {
      domain: any;
      primaryType: any;
      types: any;
      message: any;
    }) => {
      if (!address) {
        throw new Error("No SIWE address found");
      }
      if (!client) {
        throw new Error("No client found");
      }
      if (!isConnected) {
        throw new Error("Wallet not connected to SIWE address");
      }

      if (client.chain.id !== 100) {
        try {
          await switchChain(wagmiConfig, { chainId: 100 });
        } catch (e) {
          toast.custom(
            (t) => (
              <ImportantNotification
                title="Network change failed"
                text="You might be using a wallet that does not support the Gnosis network. Please try with another wallet."
                onClose={() => toast.dismiss(t.id)}
              />
            ),
            {
              position: "bottom-right",
              duration: 5000,
            },
          );
        }
      }

      // important to pass `account` here, because while we know that the `address` wallet is connected it's not necessarily the wallet's **current default** connected address
      const signature = await client.signTypedData({
        // types:
        account: address,
        ...params,
      });
      if (process.env.NEXT_PUBLIC_FC_ENV === "staging") {
        console.debug("Using new signature logic");
        return signature;
      } else {
        console.debug("Using old signature logic");
        return adjustVInSignature(signature);
      }
    },
    [client, address, isConnected],
  );

  return sign;
};

export default useSign;
