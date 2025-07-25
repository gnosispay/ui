import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { TriangleAlert, Coins } from "lucide-react";
import { useState, useCallback, useMemo } from "react";
import { isAddress } from "viem";
import type { CurrencyInfoWithBalance } from "@/hooks/useTokenBalance";
import { TokenAmountInput } from "./token-amount-input";
import { AddressInput } from "./address-input";
import { useAccount } from "wagmi";
import { useDelayRelay } from "@/context/DelayRelayContext";
import { QueueNotEmptyAlert } from "@/components/QueueNotEmptyAlert";
import { useSafeSignerVerification } from "@/hooks/useSafeSignerVerification";

interface ValidatedFormData {
  toAddress: string;
  selectedToken: CurrencyInfoWithBalance;
  amount: bigint;
}

interface SendFundsFormProps {
  onNext: (data: ValidatedFormData) => void;
}

export const SendFundsForm = ({ onNext }: SendFundsFormProps) => {
  const { address: connectedAddress } = useAccount();
  const { queue } = useDelayRelay();
  const isQueueNotEmpty = useMemo(() => queue.length > 0, [queue]);
  const [toAddress, setToAddress] = useState("");
  const [addressError, setAddressError] = useState("");
  const [selectedToken, setSelectedToken] = useState<CurrencyInfoWithBalance | undefined>();
  const [amount, setAmount] = useState<bigint>(0n);
  const [amountError, setAmountError] = useState("");
  const { isSignerConnected, signerError, isDataLoading } = useSafeSignerVerification();

  const handleAddressChange = useCallback((value: string) => {
    setAddressError("");
    setToAddress(value);

    if (value && !isAddress(value)) {
      setAddressError("Invalid address");
    }
  }, []);

  const isFormValid = useMemo(() => {
    return !!(toAddress && amount && amount > 0n && selectedToken && !amountError && !addressError && !signerError);
  }, [toAddress, addressError, amount, selectedToken, amountError, signerError]);

  const handleNext = useCallback(() => {
    if (!isFormValid || !selectedToken || !isSignerConnected) return;

    onNext({
      toAddress,
      selectedToken,
      amount,
    });
  }, [isFormValid, selectedToken, toAddress, amount, onNext, isSignerConnected]);

  return (
    <div className="space-y-6">
      {isQueueNotEmpty && <QueueNotEmptyAlert />}

      {!isQueueNotEmpty && (
        <Alert variant="warning">
          <TriangleAlert className="h-4 w-4" />
          <AlertDescription>
            Please ensure you enter a Gnosis Chain address. You are solely responsible for the accuracy of the address
            and the safety of your funds.
          </AlertDescription>
        </Alert>
      )}

      {signerError && (
        <Alert variant="destructive">
          <TriangleAlert className="h-4 w-4" />
          <AlertDescription>{signerError.message}</AlertDescription>
        </Alert>
      )}

      {!isSignerConnected && !isDataLoading && (
        <Alert variant="destructive">
          <TriangleAlert className="h-4 w-4" />
          <AlertDescription>
            Please make sure to be connected with an account that is a signer of the Gnosis Pay account
          </AlertDescription>
        </Alert>
      )}

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
        <Label htmlFor="amount">Amount</Label>
        <TokenAmountInput onTokenChange={setSelectedToken} onAmountChange={setAmount} setError={setAmountError} />
        {amountError && (
          <Alert variant="destructive">
            <Coins className="h-4 w-4" />
            <AlertDescription>{amountError}</AlertDescription>
          </Alert>
        )}
      </div>

      <Button onClick={handleNext} disabled={!isFormValid || isQueueNotEmpty || !isSignerConnected} className="w-full">
        Next
      </Button>
    </div>
  );
};
