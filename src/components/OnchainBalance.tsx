import { useTokenBalance } from "@/hooks/useTokenBalance";
import { Skeleton } from "./ui/skeleton";
import { StandardAlert } from "./ui/standard-alert";
import { formatUnits } from "viem";
import { useMemo } from "react";

export const OnchainBalance = () => {
  const { currenciesWithBalance, isLoading, isError } = useTokenBalance();

  const tokensWithNonZeroBalance = useMemo(() => {
    return Object.entries(currenciesWithBalance).filter(([, token]) => token.balance > 0n);
  }, [currenciesWithBalance]);

  const allTokens = useMemo(() => {
    return Object.entries(currenciesWithBalance);
  }, [currenciesWithBalance]);

  if (isError) {
    return <StandardAlert variant="destructive" description="Failed to fetch token balances. Please try again." />;
  }

  return (
    <div className="flex flex-col gap-4 bg-card p-4 rounded-lg" data-testid="onchain-balance-component">
      <h2 className="font-bold text-secondary text-lg">Token Balances</h2>

      {isLoading ? (
        <div className="flex flex-col gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={`skeleton-${i}`} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Skeleton className="w-8 h-8 rounded-full" />
                <Skeleton className="w-20 h-5" />
              </div>
              <Skeleton className="w-24 h-5" />
            </div>
          ))}
        </div>
      ) : tokensWithNonZeroBalance.length === 0 ? (
        <div className="text-center text-secondary py-4">No tokens available</div>
      ) : (
        <div className="flex flex-col gap-3">
          {allTokens.map(([symbol, token]) => {
            const formattedBalance = formatUnits(token.balance, token.decimals || 18);
            const displayBalance = Number.parseFloat(formattedBalance).toFixed(4);

            // Only show tokens with non-zero balance
            if (token.balance === 0n) {
              return null;
            }

            return (
              <div
                key={symbol}
                className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                data-testid={`token-balance-${symbol}`}
              >
                <div className="flex items-center gap-3">
                  {token.logo && <img src={token.logo} alt={`${symbol} logo`} className="w-8 h-8 rounded-full" />}
                  <div className="flex flex-col">
                    <span className="font-medium text-foreground">{symbol}</span>
                    {token.tokenSymbol && token.tokenSymbol !== symbol && (
                      <span className="text-xs text-muted-foreground">{token.tokenSymbol}</span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-foreground">{displayBalance}</div>
                  <div className="text-xs text-muted-foreground">{symbol}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
