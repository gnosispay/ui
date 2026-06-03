import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect, useMemo, useCallback } from "react";
import { formatUnits, parseUnits } from "viem";
import { useTokenBalance, type TokenInfoWithBalance, type TokenWithBalance } from "@/hooks/useTokenBalance";
import { useUser } from "@/context/UserContext";
import { Skeleton } from "@/components/ui/skeleton";

interface TokenAmountInputProps {
  onTokenChange: (token: TokenInfoWithBalance) => void;
  onAmountChange: (amount: bigint) => void;
  setError: (error: string) => void;
  /**
   * Balances to display. When omitted, balances for the current safe are fetched
   * via {@link useTokenBalance}. Pass explicit balances (e.g. for the legacy safe)
   * so the displayed balance and Max button reflect the correct safe.
   */
  currenciesWithBalance?: TokenWithBalance;
  isLoadingBalances?: boolean;
}

export const TokenAmountInput = ({
  onTokenChange,
  onAmountChange,
  setError,
  currenciesWithBalance,
  isLoadingBalances: isLoadingBalancesProp,
}: TokenAmountInputProps) => {
  const { currenciesWithBalance: fetchedTokens, isLoading: fetchedLoading } = useTokenBalance();
  const tokens = currenciesWithBalance ?? fetchedTokens;
  const isLoadingBalances = currenciesWithBalance ? (isLoadingBalancesProp ?? false) : fetchedLoading;
  const [displayAmount, setDisplayAmount] = useState<string>("");
  const [selectedSymbol, setSelectedSymbol] = useState<string | undefined>();
  const { safeConfig } = useUser();

  // Derive the selected token from the live balances map so its balance (and the
  // Max button) always reflect the latest fetched value rather than a snapshot
  // captured at selection time.
  const selectedToken = useMemo(() => (selectedSymbol ? tokens[selectedSymbol] : undefined), [selectedSymbol, tokens]);

  // Keep the parent in sync with the freshest selected token.
  useEffect(() => {
    if (selectedToken) {
      onTokenChange(selectedToken);
    }
  }, [selectedToken, onTokenChange]);

  const amount = useMemo(() => {
    if (!selectedToken?.decimals || !displayAmount || displayAmount === "0") {
      return 0n;
    }
    let newAmount = 0n;
    try {
      newAmount = parseUnits(displayAmount, selectedToken.decimals);
    } catch {
      newAmount = 0n;
    }

    return newAmount;
  }, [selectedToken, displayAmount]);

  useEffect(() => {
    onAmountChange(amount);
  }, [amount, onAmountChange]);

  // Check for insufficient balance and update error state
  useEffect(() => {
    if (!selectedToken?.decimals || amount === 0n) {
      setError("");
      return;
    }

    if (amount > selectedToken.balance) {
      setError("Insufficient balance");
    } else {
      setError("");
    }
  }, [amount, selectedToken, setError]);

  const handleTokenSelect = useCallback(
    (tokenSymbol: string) => {
      setSelectedSymbol(tokenSymbol);
      setDisplayAmount("");
      setError("");
    },
    [setError],
  );

  useEffect(() => {
    if (!selectedSymbol && !isLoadingBalances && safeConfig?.fiatSymbol && tokens[safeConfig.fiatSymbol]) {
      handleTokenSelect(safeConfig.fiatSymbol);
    }
  }, [selectedSymbol, tokens, handleTokenSelect, safeConfig?.fiatSymbol, isLoadingBalances]);

  const handleAmountChange = (newAmount: string) => {
    setDisplayAmount(newAmount);
  };

  const handleMaxClick = () => {
    if (!selectedToken?.decimals) {
      return;
    }

    const maxDisplayAmount = formatUnits(selectedToken.balance, selectedToken.decimals);
    handleAmountChange(maxDisplayAmount);
  };

  if (!selectedToken?.decimals) {
    return <Skeleton className="h-20 w-full" />;
  }

  return (
    <div className="space-y-2">
      <Label htmlFor="amount">Amount</Label>
      <div className="relative">
        <Input
          id="amount"
          placeholder="0.00"
          className="h-20 pr-32 text-2xl [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          type="number"
          value={displayAmount}
          onChange={(e) => handleAmountChange(e.target.value)}
          data-testid="standard-token-amount-input"
        />
        <div className="absolute right-3 top-2 flex flex-col items-end gap-1">
          <Select value={selectedSymbol} onValueChange={handleTokenSelect}>
            <SelectTrigger
              className="w-auto border-0 bg-transparent p-0 h-auto shadow-none"
              data-testid="token-selector"
            >
              <SelectValue>
                <div className="flex items-center gap-2">
                  {selectedToken?.logo && <img src={selectedToken.logo} className="h-5 w-5 rounded-full" alt="Token" />}
                  <span className="font-medium" data-testid="selected-token-symbol">
                    {selectedToken?.tokenSymbol}
                  </span>
                </div>
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {Object.entries(tokens).map(([address, token]) => (
                <SelectItem key={address} value={address}>
                  <div className="flex items-center gap-2">
                    {token.logo && <img src={token.logo} className="h-4 w-4 rounded-full" alt="Token" />}
                    <span>{token.tokenSymbol}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <span data-testid="token-balance">{formatUnits(selectedToken.balance, selectedToken.decimals)}</span>
            <Button
              variant="ghost"
              size="sm"
              className="h-auto p-0 text-xs font-semibold text-foreground hover:bg-transparent"
              onClick={handleMaxClick}
              data-testid="standard-token-max-button"
            >
              Max
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
