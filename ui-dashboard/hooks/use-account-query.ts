"use client";

import { accountQuery } from "@gnosispay/account-kit";
import { getAddress } from "viem";
import { usePublicClient } from "wagmi";
import { useQuery } from "@tanstack/react-query";
import { wagmiConfig } from "@/components/providers/wallet-provider";
import { DELAY_COOLDOWN } from "@/lib/constants";
import type { Address } from "viem";

export const accountQueryKey = (account: string) => ["accountQuery", account];

const useAccountQuery = (account?: string) => {
  const client = usePublicClient({
    chainId: 100,
    config: wagmiConfig,
  });

  return useQuery({
    queryKey: accountQueryKey(account || ""),
    enabled: !!account,
    queryFn: async () => {
      if (!account) {
        throw new Error("No account");
      }

      return await accountQuery(
        {
          account: getAddress(account),
          cooldown: DELAY_COOLDOWN,
        },
        async (request) =>
          (
            await client?.call({
              to: request.to as Address,
              data: request.data as Address,
            })
          )?.data as string,
      );
    },
  });
};

export default useAccountQuery;
