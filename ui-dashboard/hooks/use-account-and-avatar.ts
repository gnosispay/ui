import { useEffect, useMemo, useState } from "react";
import { useEnsAvatar } from "wagmi";
import { createPublicClient, http as viemHttp } from "viem";
import makeBlockie from "ethereum-blockies-base64";
import { mainnet } from "viem/chains";

import { useSession } from "next-auth/react";
import { createWeb3Name } from "@web3-name-sdk/core";
import { shortenAddress } from "@/lib/utils";
import { wagmiConfig } from "@/components/providers/wallet-provider";
import getApiUrl from "@/lib/get-url";
import type { Address } from "viem";

async function getENSWithViemDefaultRpc(address: string) {
  const client = createPublicClient({
    chain: mainnet,
    transport: viemHttp(),
  });
  const ensName = await client.getEnsName({
    address: address as `0x${string}`,
  });

  return ensName;
}

function retryGetDomainName(
  provider: ReturnType<typeof createWeb3Name>,
  params: { address: string; queryTldList: string[]; rpcUrl?: string },
  options: { maxRetries?: number; delayMs?: number } = {},
): Promise<string | null> {
  const { maxRetries = 4, delayMs = 3000 } = options;
  let retries = 0;

  const attempt = async (): Promise<string | null> => {
    try {
      const result = await provider.getDomainName(params);

      if (result !== null || retries >= maxRetries) {
        return result;
      }

      retries++;
      console.log(
        `Retry ${retries}/${maxRetries} for ${params.queryTldList[0]} name...`,
      );

      return new Promise((resolve) => {
        setTimeout(async () => {
          resolve(await attempt());
        }, delayMs);
      });
    } catch (error) {
      console.error(`Error getting ${params.queryTldList[0]} domain:`, error);
      return null;
    }
  };

  return attempt();
}

export default function useAccountAndAvatar() {
  const session = useSession();
  const [ensName, setEnsName] = useState<string | null>(null);
  const [gnoName, setGnoName] = useState<string | null>(null);

  const email = session?.data?.user?.email;
  const siweAddress = session?.data?.user?.siweAddress?.split(":")?.[2];
  const web3NameProvider = useMemo(() => {
    try {
      const web3NameProvider = createWeb3Name({
        rpcUrl: `${getApiUrl()}api/v1/rpc/mainnet`,
      });
      return web3NameProvider;
    } catch (error) {
      return null;
    }
  }, []);

  const { data: ensAvatar } = useEnsAvatar({
    name: ensName ?? undefined,
    chainId: mainnet.id,
    config: wagmiConfig,
  });

  useEffect(() => {
    const loadNames = async () => {
      if (!siweAddress || !web3NameProvider) {
        console.warn(
          "No address or web3NameProvider, not fetching account and avatar.",
        );
        return;
      }

      try {
        const [ensName, gnoName] = await Promise.all([
          getENSWithViemDefaultRpc(siweAddress),
          retryGetDomainName(web3NameProvider, {
            address: siweAddress,
            queryTldList: ["gno"],
            rpcUrl: `${getApiUrl()}api/v1/rpc/gnosis`,
          }),
        ]);

        setEnsName(ensName);
        setGnoName(gnoName);
      } catch (error) {
        console.error("Error loading domain names:", error);
        setEnsName(null);
        setGnoName(null);
      }
    };
    loadNames();
  }, [siweAddress, web3NameProvider, setEnsName]);

  const displayName = useMemo(() => {
    if (gnoName) {
      return gnoName;
    }
    if (ensName) {
      return ensName;
    }
    if (siweAddress) {
      return shortenAddress(siweAddress as Address);
    }
    if (email) {
      return email;
    }

    return "You";
  }, [gnoName, ensName, siweAddress, email]);

  const avatar = useMemo(() => {
    if (ensAvatar) {
      return ensAvatar;
    }
    if (siweAddress) {
      return makeBlockie(siweAddress);
    }
    if (email) {
      return makeBlockie(email);
    }
    return makeBlockie("You");
  }, [email, ensAvatar, siweAddress]);

  return {
    address: siweAddress as Address,
    isLoading: session.status === "loading",
    displayName: displayName,
    name: ensName, // .gno or .eth name
    avatar,
  };
}
