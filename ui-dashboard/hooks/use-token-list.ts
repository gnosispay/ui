import { useQuery } from "@tanstack/react-query";
import getLifi from "@/lib/get-lifi";
import type { Token } from "@lifi/sdk";

export type Tokens<T extends string> = {
  [key in T]: Token;
};

const lifi = getLifi();

const useTokenList = (chainId: number | undefined) => {
  return useQuery({
    queryKey: ["tokenList", chainId],
    queryFn: async () => {
      if (!chainId) {throw new Error("No chainId");}
      const tokensResponse = await lifi.getTokens({ chains: [chainId] });
      const allTokens = tokensResponse.tokens?.[chainId] || [];

      const availableTokens = allTokens?.reduce((tokens, token) => {
        return {
          [token.address]: { ...token, chainId: chainId },
          ...tokens,
        };
      }, {} as Tokens<string>);
      return availableTokens;
    },
    enabled: !!chainId,
    initialData: {},
  });
};

export default useTokenList;
