import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { TriangleAlert, Clock, AlertCircle } from "lucide-react";
import { useState, useMemo, useCallback, useEffect } from "react";
import { formatUnits, isAddress } from "viem";
import { useAccount } from "wagmi";
import { toast } from "sonner";
import type { CurrencyInfoWithBalance } from "@/hooks/useTokenBalance";
import { TokenAmountInput } from "./token-amount-input";
import { AddressInput } from "./address-input";
import { encodeErc20Transfer } from "@/lib/fetchErc20Transfers";
import { useUser } from "@/context/UserContext";
import { useDelayRelay } from "@/hooks/useDelayRelay";

interface AddFundsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

enum Step {
  Form = "form",
  Confirm = "confirm",
}

export const SendFundsModal = ({ open, onOpenChange }: AddFundsModalProps) => {
  const [step, setStep] = useState<Step>(Step.Form);
  const [toAddress, setToAddress] = useState("");
  const [addressError, setAddressError] = useState("");
  const [selectedToken, setSelectedToken] = useState<CurrencyInfoWithBalance | undefined>();
  const [amount, setAmount] = useState<bigint>(0n);
  const [isLoading, setIsLoading] = useState(false);

  const { address: connectedAddress, isConnected } = useAccount();
  const { safeConfig } = useUser();
  const {
    delayRelay,
    isLoading: isDelayRelayPending,
    queue,
    error: delayRelayError,
  } = useDelayRelay(safeConfig?.address || "");

  const isQueueNotEmpty = useMemo(() => {
    return queue.length > 0;
  }, [queue]);

  const clearAndClose = useCallback(() => {
    onOpenChange(false);
    setStep(Step.Form);
    setToAddress("");
    setAddressError("");
    setSelectedToken(undefined);
    setAmount(0n);
  }, [onOpenChange]);

  const handleAddressChange = useCallback((value: string) => {
    setAddressError("");
    setToAddress(value);

    if (value && !isAddress(value)) {
      setAddressError("Invalid address");
    }
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!amount || !toAddress || addressError || !selectedToken?.address || !safeConfig?.address) {
      return;
    }

    setIsLoading(true);

    try {
      // Encode the ERC20 transfer function call
      const data = encodeErc20Transfer(toAddress, amount);

      // Submit the transaction via delay relay
      await delayRelay({
        to: selectedToken.address,
        data,
        value: 0, // ERC20 transfers don't send ETH
      });

      // toast.success("Transaction submitted successfully and will be processed after the delay period");
      // clearAndClose();
    } catch (error) {
      console.error("Error submitting transaction:", error);
      // Error handling is done in the hook
    } finally {
      setIsLoading(false);
    }
  }, [amount, toAddress, addressError, selectedToken?.address, safeConfig?.address, delayRelay]);

  // Update loading state based on delay relay status
  useEffect(() => {
    setIsLoading(isDelayRelayPending);
  }, [isDelayRelayPending]);

  const isFormValid = useMemo(() => {
    return toAddress && !addressError && amount && amount > 0n && selectedToken;
  }, [toAddress, addressError, amount, selectedToken]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" aria-describedby={undefined}>
        <DialogTitle>Send funds</DialogTitle>

        {step === Step.Form && (
          <div className="space-y-6">
            {isQueueNotEmpty && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Another transaction is already in the queue. Please wait for it to complete before submitting another
                  one.
                </AlertDescription>
              </Alert>
            )}

            {!isQueueNotEmpty && (
              <Alert variant="warning">
                <TriangleAlert className="h-4 w-4" />
                <AlertDescription>
                  Please ensure you enter a Gnosis Chain address. You are solely responsible for accuracy of the address
                  and safety of your funds.
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
              <TokenAmountInput onTokenChange={setSelectedToken} onAmountChange={setAmount} />
            </div>

            <Button onClick={() => setStep(Step.Confirm)} disabled={!isFormValid || isQueueNotEmpty} className="w-full">
              Next
            </Button>
          </div>
        )}

        {step === Step.Confirm && selectedToken?.decimals && (
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="bg-muted/50 p-4 rounded-lg">
                <Label className="text-muted-foreground text-sm">You're sending</Label>
                <div className="flex items-center gap-2 mt-1">
                  {selectedToken.logo && <img src={selectedToken.logo} className="h-6 w-6 rounded-full" alt="Token" />}
                  <div className="text-xl font-semibold">{formatUnits(amount, selectedToken.decimals)}</div>
                  <div className="text-lg text-muted-foreground">{selectedToken.symbol}</div>
                </div>
              </div>

              <div className="bg-muted/50 p-4 rounded-lg">
                <Label className="text-muted-foreground text-sm">To</Label>
                <div className="mt-1 font-mono text-sm break-all">{toAddress}</div>
              </div>
            </div>

            <Alert variant="info">
              <Clock className="h-4 w-4" />
              <AlertDescription>
                As a security measure, your card will be temporarily frozen for 3 minutes.
              </AlertDescription>
            </Alert>

            {delayRelayError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>Error submitting transaction. {delayRelayError}</AlertDescription>
              </Alert>
            )}

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep(Step.Form)} disabled={isLoading}>
                Back
              </Button>

              <Button
                onClick={handleSubmit}
                disabled={!isConnected || isLoading || !safeConfig?.address}
                loading={isLoading}
                className="flex-1"
              >
                {isLoading ? "Executing..." : "Confirm and execute"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
