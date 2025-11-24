import type { TokenWithBalance } from "@/hooks/useTokenBalance";
import { Skeleton } from "./ui/skeleton";
import { StandardAlert } from "./ui/standard-alert";
import { formatUnits } from "viem";
import { useMemo } from "react";

interface OnchainBalanceProps {
  currenciesWithBalance: TokenWithBalance;
  isLoading: boolean;
  isError: boolean;
}
export const OnchainBalance = ({ currenciesWithBalance, isLoading, isError }: OnchainBalanceProps) => {
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
    <div className="flex flex-col gap-4 " data-testid="onchain-balance-component">
      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-4 md:grid-cols-2 gap-2">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={`skeleton-${i}`}
              className="flex flex-col lg:items-center lg:justify-center p-2 border border-border rounded-lg"
            >
              <div className="flex items-center gap-2 lg:flex-col lg:gap-1">
                <Skeleton className="w-6 h-6 rounded-full" />
                <Skeleton className="w-20 h-4 lg:w-16" />
              </div>
              <Skeleton className="w-24 h-4 lg:mt-1 lg:w-20" />
            </div>
          ))}
        </div>
      ) : tokensWithNonZeroBalance.length === 0 ? (
        <div className="text-center text-secondary py-4">No tokens available</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 md:grid-cols-2 gap-2">
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
                className="bg-card flex items-center justify-between lg:flex-col lg:items-center lg:justify-center p-2 rounded-lg"
                data-testid={`token-balance-${symbol}`}
              >
                <div className="flex items-center gap-2 min-w-0 flex-1 lg:flex-col lg:flex-1 lg:min-w-0 lg:gap-1">
                  {token.logo && (
                    <img src={token.logo} alt={`${symbol} logo`} className="w-6 h-6 rounded-full shrink-0" />
                  )}
                </div>
                <div className="text-right shrink-0 ml-2 lg:ml-0 lg:text-center lg:mt-1">
                  <div className="font-medium text-foreground text-sm">{displayBalance}</div>
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
