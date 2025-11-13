import { useQuery } from "@tanstack/react-query";
import { parseUnits } from "viem";
import { SUPPORTED_TOKENS } from "@gnosispay/tokens";
import getLifi from "@/lib/get-lifi";
import type { Address } from "viem";
import type { Token } from "@lifi/sdk";

export type TokenBigIntAmount = {
  amount: bigint;
} & Token;

export type TokenAmounts<T extends string> = {
  [key in T]: TokenBigIntAmount;
};

const lifi = getLifi();

const useAvailableTokens = (
  chainId: number | undefined,
  account: Address | undefined,
) => {
  return useQuery({
    queryKey: ["availableTokens", chainId, account],
    queryFn: async () => {
      if (!chainId || !account) {
        throw new Error("No chainId or account");
      }
      const tokensResponse = await lifi.getTokens({ chains: [chainId] });
      let lifiTokens = tokensResponse.tokens?.[chainId] || [];

      if (chainId === 100) {
        /**
         * We manually set the GBPe logo as it is not yet indexed by Li.Fi data providers.
         *
         * This is safe to remove after Li.Fi starts sending us `logoURI` for GBPe.
         */
        lifiTokens = lifiTokens.map((token) =>
          token.address === SUPPORTED_TOKENS["GBPe"].address
            ? { ...token, logoURI: "https://monerium.app/tokens/gbp/gbp.png" }
            : token,
        );
      }

      const tokenBalances = await lifi.getTokenBalances(
        account as string,
        lifiTokens,
      );

      const availableTokens = tokenBalances?.reduce((tokens, token) => {
        const amount = parseUnits(token.amount, token.decimals);
        if (amount === BigInt(0)) {
          return tokens;
        }
        return {
          [token.address]: { ...token, amount, chainId: chainId },
          ...tokens,
        };
      }, {} as TokenAmounts<string>);
      return availableTokens;
    },
    enabled: !!chainId && !!account,
    initialData: {},
  });
};

export default useAvailableTokens;
