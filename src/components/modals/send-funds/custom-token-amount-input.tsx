import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { StandardAlert } from "@/components/ui/standard-alert";
import { useState, useEffect, useMemo, useCallback } from "react";
import { formatUnits, parseUnits, isAddress, type Address } from "viem";
import { readContracts } from "wagmi/actions";
import { wagmiAdapter } from "@/wagmi";
import type { TokenInfoWithBalance } from "@/hooks/useTokenBalance";
import { useUser } from "@/context/UserContext";
import { Coins } from "lucide-react";
import { ERC20_ABI } from "@/utils/abis/ERC20Abi";

interface CustomTokenAmountInputProps {
  onTokenChange: (token: TokenInfoWithBalance) => void;
  onAmountChange: (amount: bigint) => void;
  setError: (error: string) => void;
}

interface CustomTokenInfo {
  address: string;
  decimals: number;
  symbol: string;
  name: string;
  balance: bigint;
}

export const CustomTokenAmountInput = ({ onTokenChange, onAmountChange, setError }: CustomTokenAmountInputProps) => {
  const { safeConfig } = useUser();
  const [contractAddress, setContractAddress] = useState("");
  const [addressError, setAddressError] = useState("");
  const [displayAmount, setDisplayAmount] = useState("");
  const [tokenInfo, setTokenInfo] = useState<CustomTokenInfo | null>(null);
  const [isLoadingToken, setIsLoadingToken] = useState(false);
  const [tokenError, setTokenError] = useState("");

  const amount = useMemo(() => {
    if (!tokenInfo || !displayAmount || displayAmount === "0") {
      return 0n;
    }
    let newAmount = 0n;
    try {
      newAmount = parseUnits(displayAmount, tokenInfo.decimals);
    } catch {
      newAmount = 0n;
    }
    return newAmount;
  }, [tokenInfo, displayAmount]);

  useEffect(() => {
    onAmountChange(amount);
  }, [amount, onAmountChange]);

  // Check for insufficient balance and update error state
  useEffect(() => {
    if (!tokenInfo || amount === 0n) {
      setError("");
      return;
    }

    if (amount > tokenInfo.balance) {
      setError("Insufficient balance");
    } else {
      setError("");
    }
  }, [amount, tokenInfo, setError]);

  const fetchTokenInfo = useCallback(
    async (address: string) => {
      if (!safeConfig?.address || !isAddress(address)) {
        return;
      }

      setIsLoadingToken(true);
      setTokenError("");

      try {
        // Fetch all token data in a single batched call
        const results = await readContracts(wagmiAdapter.wagmiConfig, {
          contracts: [
            {
              address: address as Address,
              abi: ERC20_ABI,
              functionName: "decimals",
            },
            {
              address: address as Address,
              abi: ERC20_ABI,
              functionName: "symbol",
            },
            {
              address: address as Address,
              abi: ERC20_ABI,
              functionName: "name",
            },
            {
              address: address as Address,
              abi: ERC20_ABI,
              functionName: "balanceOf",
              args: [safeConfig.address as Address],
            },
          ],
        });

        // Check if any calls failed
        const failedCalls = results.filter((result) => result.status === "failure");
        if (failedCalls.length > 0) {
          throw new Error(`Failed to fetch token information: ${failedCalls.length} calls failed`);
        }

        // Extract results
        const [decimalsResult, symbolResult, nameResult, balanceResult] = results;

        // Validate decimals
        if (typeof decimalsResult.result !== "number" && typeof decimalsResult.result !== "bigint") {
          throw new Error("Invalid decimals value returned from contract");
        }
        const decimals = Number(decimalsResult.result);
        if (decimals < 0 || decimals > 255) {
          throw new Error(`Invalid decimals value: ${decimals}. Expected 0-255`);
        }

        // Validate symbol
        if (typeof symbolResult.result !== "string" || symbolResult.result.length === 0) {
          throw new Error("Invalid or empty symbol returned from contract");
        }
        const symbol = symbolResult.result;

        // Validate name
        if (typeof nameResult.result !== "string" || nameResult.result.length === 0) {
          throw new Error("Invalid or empty name returned from contract");
        }
        const name = nameResult.result;

        // Validate balance
        if (typeof balanceResult.result !== "bigint") {
          throw new Error("Invalid balance value returned from contract");
        }
        const balance = balanceResult.result;

        const customToken: CustomTokenInfo = {
          address,
          decimals,
          symbol,
          name,
          balance,
        };

        setTokenInfo(customToken);

        // Convert to TokenInfoWithBalance format for the parent component
        const tokenInfoWithBalance: TokenInfoWithBalance = {
          address,
          decimals,
          tokenSymbol: symbol,
          symbol,
          balance,
          // Use a generic token icon since we don't have logos for custom tokens
          logo: undefined,
        };

        onTokenChange(tokenInfoWithBalance);
      } catch (error) {
        console.error("Error fetching token info:", error);
        setTokenError("Failed to fetch token information. Please verify the contract address.");
        setTokenInfo(null);
      } finally {
        setIsLoadingToken(false);
      }
    },
    [safeConfig?.address, onTokenChange],
  );

  const handleAddressChange = useCallback(
    (value: string) => {
      setContractAddress(value);
      setAddressError("");
      setTokenError("");
      setTokenInfo(null);
      setDisplayAmount("");

      if (value && !isAddress(value)) {
        setAddressError("Invalid contract address");
        return;
      }

      if (value && isAddress(value)) {
        fetchTokenInfo(value);
      }
    },
    [fetchTokenInfo],
  );

  const handleAmountChange = useCallback((newAmount: string) => {
    setDisplayAmount(newAmount);
  }, []);

  const handleMaxClick = useCallback(() => {
    if (!tokenInfo) {
      return;
    }

    const maxDisplayAmount = formatUnits(tokenInfo.balance, tokenInfo.decimals);
    handleAmountChange(maxDisplayAmount);
  }, [tokenInfo, handleAmountChange]);

  return (
    <div className="space-y-4">
      {/* Contract Address Input */}
      <div className="space-y-2">
        <Input
          placeholder="Enter token contract address (0x...)"
          value={contractAddress}
          onChange={(e) => handleAddressChange(e.target.value)}
          className={addressError ? "border-destructive" : ""}
          data-testid="custom-token-address-input"
        />
        {addressError && (
          <StandardAlert variant="destructive" description={addressError} customIcon={<Coins className="h-4 w-4" />} />
        )}
      </div>

      {/* Token Info Display */}
      {isLoadingToken && (
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-20 w-full" />
        </div>
      )}

      {tokenError && (
        <StandardAlert variant="destructive" description={tokenError} customIcon={<Coins className="h-4 w-4" />} />
      )}

      {tokenInfo && !isLoadingToken && (
        <>
          {/* Token Details */}
          <div className="space-y-1 p-3 rounded-lg border border-brand" data-testid="custom-token-info">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                <Coins className="h-3 w-3 text-primary" />
              </div>
              <span className="font-medium">{tokenInfo.symbol}</span>
            </div>
            <p className="text-sm text-muted-foreground">{tokenInfo.name}</p>
            <p className="text-xs text-muted-foreground">
              Balance: {formatUnits(tokenInfo.balance, tokenInfo.decimals)} {tokenInfo.symbol}
            </p>
          </div>

          {/* Amount Input */}
          <div className="space-y-2">
            <Label htmlFor="custom-amount">Amount</Label>
            <div className="relative">
              <Input
                id="custom-amount"
                placeholder="0.00"
                className="h-20 pr-32 text-2xl [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                type="number"
                value={displayAmount}
                onChange={(e) => handleAmountChange(e.target.value)}
                data-testid="custom-token-amount-input"
              />
              <div className="absolute right-3 top-2 flex flex-col items-end gap-1">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
                    <Coins className="h-3 w-3 text-primary" />
                  </div>
                  <span className="font-medium">{tokenInfo.symbol}</span>
                </div>

                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <span data-testid="token-balance">{formatUnits(tokenInfo.balance, tokenInfo.decimals)}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 text-xs font-semibold text-foreground hover:bg-transparent"
                    onClick={handleMaxClick}
                    data-testid="custom-token-max-button"
                  >
                    Max
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
