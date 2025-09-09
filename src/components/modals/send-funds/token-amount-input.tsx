import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect, useMemo, useCallback } from "react";
import { formatUnits, parseUnits } from "viem";
import { useTokenBalance, type TokenInfoWithBalance } from "@/hooks/useTokenBalance";
import { useUser } from "@/context/UserContext";
import { Skeleton } from "@/components/ui/skeleton";

interface TokenAmountInputProps {
  onTokenChange: (token: TokenInfoWithBalance) => void;
  onAmountChange: (amount: bigint) => void;
  setError: (error: string) => void;
}

export const TokenAmountInput = ({ onTokenChange, onAmountChange, setError }: TokenAmountInputProps) => {
  const { currenciesWithBalance: tokens } = useTokenBalance();
  const [displayAmount, setDisplayAmount] = useState<string>("");
  const [selectedToken, setSelectedToken] = useState<TokenInfoWithBalance | undefined>();
  const { safeConfig } = useUser();
  const amount = useMemo(() => {
    if (!selectedToken || !selectedToken.decimals || !displayAmount || displayAmount === "0") {
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
    if (!selectedToken || !selectedToken.decimals || amount === 0n) {
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
      const newToken = tokens[tokenSymbol];
      setSelectedToken(newToken);
      onTokenChange(newToken);
      setDisplayAmount("");
      setError(""); // Clear error when token changes
    },
    [tokens, onTokenChange, setError],
  );

  useEffect(() => {
    if (!selectedToken && safeConfig?.fiatSymbol && tokens[safeConfig.fiatSymbol]) {
      handleTokenSelect(safeConfig.fiatSymbol);
    }
  }, [selectedToken, tokens, handleTokenSelect, safeConfig?.fiatSymbol]);

  const handleAmountChange = (newAmount: string) => {
    setDisplayAmount(newAmount);
  };

  const handleMaxClick = () => {
    if (!selectedToken || !selectedToken.decimals) {
      return;
    }

    const maxDisplayAmount = formatUnits(selectedToken.balance, selectedToken.decimals);
    handleAmountChange(maxDisplayAmount);
  };

  if (!selectedToken?.decimals) {
    return <Skeleton className="h-20 w-full" />;
  }

  return (
    <div className="relative">
      <Input
        placeholder="0.00"
        className="h-20 pr-32 text-2xl [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        type="number"
        value={displayAmount}
        onChange={(e) => handleAmountChange(e.target.value)}
      />
      <div className="absolute right-3 top-2 flex flex-col items-end gap-1">
        <Select value={selectedToken.address} onValueChange={handleTokenSelect}>
          <SelectTrigger className="w-auto border-0 bg-transparent p-0 h-auto shadow-none">
            <SelectValue>
              <div className="flex items-center gap-2">
                {selectedToken?.logo && <img src={selectedToken.logo} className="h-5 w-5 rounded-full" alt="Token" />}
                <span className="font-medium">{selectedToken?.tokenSymbol}</span>
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
          <span>{formatUnits(selectedToken.balance, selectedToken.decimals)}</span>
          <Button
            variant="ghost"
            size="sm"
            className="h-auto p-0 text-xs font-semibold text-foreground hover:bg-transparent"
            onClick={handleMaxClick}
          >
            Max
          </Button>
        </div>
      </div>
    </div>
  );
};
