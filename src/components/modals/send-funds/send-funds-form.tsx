import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { TriangleAlert, AlertCircle, Coins } from "lucide-react";
import { useState, useCallback, useMemo } from "react";
import { isAddress } from "viem";
import type { CurrencyInfoWithBalance } from "@/hooks/useTokenBalance";
import { TokenAmountInput } from "./token-amount-input";
import { AddressInput } from "./address-input";
import { useAccount } from "wagmi";
import { useDelayRelay } from "@/context/DelayRelayContext";

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

  const handleAddressChange = useCallback((value: string) => {
    setAddressError("");
    setToAddress(value);

    if (value && !isAddress(value)) {
      setAddressError("Invalid address");
    }
  }, []);

  const isFormValid = useMemo(() => {
    return !!(toAddress && amount && amount > 0n && selectedToken && !amountError && !addressError);
  }, [toAddress, addressError, amount, selectedToken, amountError]);

  const handleNext = useCallback(() => {
    if (!isFormValid || !selectedToken) return;

    onNext({
      toAddress,
      selectedToken,
      amount,
    });
  }, [isFormValid, selectedToken, toAddress, amount, onNext]);

  return (
    <div className="space-y-6">
      {isQueueNotEmpty && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Another transaction is already in the queue. Please wait for it to complete before submitting another one.
          </AlertDescription>
        </Alert>
      )}

      {!isQueueNotEmpty && (
        <Alert variant="warning">
          <TriangleAlert className="h-4 w-4" />
          <AlertDescription>
            Please ensure you enter a Gnosis Chain address. You are solely responsible for the accuracy of the address
            and the safety of your funds.
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

      <Button onClick={handleNext} disabled={!isFormValid || isQueueNotEmpty} className="w-full">
        Next
      </Button>
    </div>
  );
};
