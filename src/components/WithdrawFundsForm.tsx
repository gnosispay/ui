import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { StandardAlert } from "@/components/ui/standard-alert";
import { Switch } from "@/components/ui/switch";
import { Coins } from "lucide-react";
import { useState, useCallback, useMemo, useEffect } from "react";
import { isAddress, encodeFunctionData, type Address } from "viem";
import type { TokenInfoWithBalance } from "@/hooks/useTokenBalance";
import { TokenAmountInput } from "./modals/send-funds/token-amount-input";
import { CustomTokenAmountInput } from "./modals/send-funds/custom-token-amount-input";
import { AddressInput } from "./modals/send-funds/address-input";
import { useAccount, useSignTypedData } from "wagmi";
import { useUser } from "@/context/UserContext";
import { ERC20_ABI } from "@/utils/abis/ERC20Abi";
import { populateExecuteEnqueue, predictAddresses } from "@gnosispay/account-kit";
import { sendTransaction, readContract, waitForTransactionReceipt, getBalance } from "wagmi/actions";
import { wagmiAdapter } from "@/wagmi";
import { toast } from "sonner";
import { extractErrorMessage } from "@/utils/errorHelpers";
import { gnosis } from "wagmi/chains";
import { storeTransaction } from "@/utils/localTransactionStorage";
import { DELAY_MOD_ABI } from "@/utils/abis/delayAbi";
import { useSafeSignerVerification } from "@/hooks/useSafeSignerVerification";

interface WithdrawFundsFormProps {
  onSuccess?: () => void;
}

export const WithdrawFundsForm = ({ onSuccess }: WithdrawFundsFormProps = {}) => {
  const { address: connectedAddress } = useAccount();
  const { safeConfig } = useUser();
  const { signTypedDataAsync } = useSignTypedData();
  const { isSignerConnected, signerError, isDataLoading: isSignerVerificationLoading } = useSafeSignerVerification();
  const [toAddress, setToAddress] = useState("");
  const [addressError, setAddressError] = useState("");
  const [selectedToken, setSelectedToken] = useState<TokenInfoWithBalance | undefined>();
  const [amount, setAmount] = useState<bigint>(0n);
  const [amountError, setAmountError] = useState("");
  const [isCustomToken, setIsCustomToken] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [nativeBalance, setNativeBalance] = useState<bigint>(0n);
  const [isBalanceLoading, setIsBalanceLoading] = useState(false);

  const handleAddressChange = useCallback((value: string) => {
    setAddressError("");
    setToAddress(value);

    if (value && !isAddress(value)) {
      setAddressError("Invalid address");
    }
  }, []);

  // Reset form state when switching between token modes
  const handleCustomTokenChange = useCallback((checked: boolean) => {
    setIsCustomToken(checked);
    setSelectedToken(undefined);
    setAmount(0n);
    setAmountError("");
  }, []);

  // Fetch native balance for gas payments
  useEffect(() => {
    if (!connectedAddress) {
      setNativeBalance(0n);
      return;
    }

    setIsBalanceLoading(true);
    getBalance(wagmiAdapter.wagmiConfig, {
      address: connectedAddress as Address,
    })
      .then((balance) => {
        setNativeBalance(balance.value);
      })
      .catch((error) => {
        console.error("Error fetching native balance:", error);
        setNativeBalance(0n);
      })
      .finally(() => {
        setIsBalanceLoading(false);
      });
  }, [connectedAddress]);

  const hasSufficientGasBalance = useMemo(() => {
    return nativeBalance > 0n;
  }, [nativeBalance]);

  const validationError = useMemo(() => {
    if (!connectedAddress) {
      return null;
    }

    if (isSignerVerificationLoading || isBalanceLoading) {
      return null; // Still loading, don't show error yet
    }

    if (!isSignerConnected) {
      return signerError
        ? `You are not an owner of this Safe. ${signerError.message}`
        : "You are not an owner of this Safe. Please connect an owner account.";
    }

    if (!hasSufficientGasBalance) {
      return "Your connected account has insufficient xDAI balance to pay for gas. Please ensure you have xDAI in your wallet.";
    }

    return null;
  }, [
    connectedAddress,
    isSignerConnected,
    signerError,
    isSignerVerificationLoading,
    hasSufficientGasBalance,
    isBalanceLoading,
  ]);

  const isFormValid = useMemo(() => {
    return !!(
      toAddress &&
      amount &&
      amount > 0n &&
      selectedToken &&
      !amountError &&
      !addressError &&
      connectedAddress &&
      safeConfig?.address &&
      isSignerConnected &&
      hasSufficientGasBalance &&
      !validationError
    );
  }, [
    toAddress,
    addressError,
    amount,
    selectedToken,
    amountError,
    connectedAddress,
    safeConfig?.address,
    isSignerConnected,
    hasSufficientGasBalance,
    validationError,
  ]);

  const handleWithdraw = useCallback(async () => {
    if (!isFormValid || !selectedToken || !connectedAddress || !safeConfig?.address) {
      return;
    }

    setIsLoading(true);

    try {
      // Encode the ERC20 transfer call
      const transferData = encodeFunctionData({
        abi: ERC20_ABI,
        functionName: "transfer",
        args: [toAddress as Address, amount],
      });

      // Create the transaction to be executed
      const transaction = {
        to: selectedToken.address as Address,
        value: 0n,
        data: transferData,
      };

      // Use account-kit to populate the execute enqueue transaction
      const txRequest = await populateExecuteEnqueue(
        {
          account: safeConfig.address,
          chainId: gnosis.id,
        },
        transaction,
        async ({ domain, primaryType, types, message }) => {
          // Sign the typed data
          const signature = await signTypedDataAsync({
            domain: {
              ...domain,
              verifyingContract: domain.verifyingContract as Address,
            },
            primaryType,
            types,
            message,
          });
          return signature;
        },
      );

      // Send the transaction
      const sendTxHash = await sendTransaction(wagmiAdapter.wagmiConfig, {
        to: txRequest.to as Address,
        data: txRequest.data as `0x${string}`,
        value: BigInt(txRequest.value),
      });

      // Wait for transaction confirmation
      await waitForTransactionReceipt(wagmiAdapter.wagmiConfig, {
        hash: sendTxHash,
      });

      // Get the delay module address
      const { delay: delayModAddress } = predictAddresses(safeConfig.address);

      // Get the updated queueNonce to determine the nonce of the transaction we just queued
      const queueNonce = (await readContract(wagmiAdapter.wagmiConfig, {
        address: delayModAddress as Address,
        abi: DELAY_MOD_ABI,
        functionName: "queueNonce",
      })) as bigint;

      // The transaction we just queued has nonce = queueNonce - 1
      const txNonce = queueNonce - 1n;

      // Get the transaction hash from the delay module
      const delayTxHash = (await readContract(wagmiAdapter.wagmiConfig, {
        address: delayModAddress as Address,
        abi: DELAY_MOD_ABI,
        functionName: "getTxHash",
        args: [txNonce],
      })) as `0x${string}`;

      // Store transaction details locally for later execution
      storeTransaction(safeConfig.address, {
        to: transaction.to,
        value: transaction.value.toString(),
        data: transaction.data,
        tokenAddress: selectedToken.address,
        tokenSymbol: selectedToken.symbol || selectedToken.tokenSymbol,
        amount: amount.toString(),
        tokenDecimals: selectedToken.decimals,
        recipient: toAddress,
        timestamp: Date.now(),
        txHash: delayTxHash,
        nonce: Number(txNonce),
      });

      toast.success(
        "Withdrawal transaction queued successfully! It will be ready to execute after the cooldown period.",
      );

      // Reset form
      setToAddress("");
      setSelectedToken(undefined);
      setAmount(0n);
      setAmountError("");

      // Call onSuccess callback if provided
      onSuccess?.();
    } catch (error) {
      console.error("Error withdrawing funds:", error);
      toast.error(extractErrorMessage(error, "Error withdrawing funds"));
    } finally {
      setIsLoading(false);
    }
  }, [
    isFormValid,
    selectedToken,
    connectedAddress,
    safeConfig?.address,
    toAddress,
    amount,
    signTypedDataAsync,
    onSuccess,
  ]);

  return (
    <div className="flex flex-col gap-4 bg-card p-4 rounded-lg" data-testid="withdraw-funds-form">
      <h2 className="font-bold text-secondary text-lg">Withdraw Funds</h2>

      {!connectedAddress && (
        <StandardAlert variant="destructive" description="You must connect your wallet to withdraw funds" />
      )}

      {connectedAddress && validationError && <StandardAlert variant="destructive" description={validationError} />}

      <StandardAlert
        variant="warning"
        description="Please ensure you enter a Gnosis Chain address. You are solely responsible for the accuracy of the address and the safety of your funds."
      />

      <div className="space-y-2">
        <Label htmlFor="to-address">To</Label>
        <AddressInput
          toAddress={toAddress}
          onChange={handleAddressChange}
          error={addressError}
          connectedAddress={connectedAddress}
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-end">
          <div className="flex items-center gap-2">
            <Label htmlFor="custom-token-switch" className="text-sm text-muted-foreground">
              Custom token
            </Label>
            <Switch id="custom-token-switch" checked={isCustomToken} onCheckedChange={handleCustomTokenChange} />
          </div>
        </div>

        {isCustomToken ? (
          <CustomTokenAmountInput
            onTokenChange={setSelectedToken}
            onAmountChange={setAmount}
            setError={setAmountError}
          />
        ) : (
          <TokenAmountInput onTokenChange={setSelectedToken} onAmountChange={setAmount} setError={setAmountError} />
        )}

        {amountError && (
          <StandardAlert variant="destructive" description={amountError} customIcon={<Coins className="h-4 w-4" />} />
        )}
      </div>

      <Button onClick={handleWithdraw} disabled={!isFormValid || isLoading} loading={isLoading} className="w-full">
        Withdraw
      </Button>
    </div>
  );
};
