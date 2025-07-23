import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { TriangleAlert, Clock, AlertCircle } from "lucide-react";
import { useState, useMemo, useCallback } from "react";
import { formatUnits, isAddress } from "viem";
import { useAccount, useSignTypedData } from "wagmi";
import { toast } from "sonner";
import type { CurrencyInfoWithBalance } from "@/hooks/useTokenBalance";
import { TokenAmountInput } from "./token-amount-input";
import { AddressInput } from "./address-input";
import { useUser } from "@/context/UserContext";
import { getApiV1AccountsWithdrawTransactionData, postApiV1AccountsWithdraw } from "@/client";
import { useDelayRelay } from "@/context/DelayRelayContext";

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
  const { signTypedDataAsync } = useSignTypedData();
  const { queue, fetchDelayQueue } = useDelayRelay();
  const isQueueNotEmpty = useMemo(() => queue.length > 0, [queue]);

  const { address: connectedAddress, isConnected } = useAccount();
  const { safeConfig } = useUser();

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

    getApiV1AccountsWithdrawTransactionData({
      query: {
        to: toAddress,
        amount: amount.toString(),
        tokenAddress: selectedToken.address,
      },
    })
      .then(async ({ data, error }) => {
        if (error) {
          console.error("Error fetching transaction data:", error);
          toast.error("Failed to fetch transaction data");
          setIsLoading(false);
          return;
        }
        const typedData = data.data;

        signTypedDataAsync({
          ...typedData,
          domain: {
            ...typedData.domain,
            verifyingContract: typedData.domain.verifyingContract as `0x${string}`,
          },
        })
          .then(async (signature) => {
            if (!signature) {
              toast.error("Failed to sign transaction");
              return;
            }

            if (!selectedToken.address) {
              return;
            }

            postApiV1AccountsWithdraw({
              body: {
                signature,
                to: toAddress,
                amount: amount.toString(),
                tokenAddress: selectedToken.address,
                message: typedData.message,
              },
            })
              .then(({ data, error }) => {
                if (error) {
                  console.error("Error submitting transaction:", error);
                  toast.error("Failed to submit transaction");
                  return;
                }
                clearAndClose();
                fetchDelayQueue();
                console.info("Transaction submitted:", data);
              })
              .catch((error) => {
                console.error("Error submitting transaction:", error);
                toast.error("Failed to submit transaction");
                return;
              });
          })
          .catch((error) => {
            console.error("Error signing transaction:", error);
            toast.error("Failed to sign transaction");
            return;
          })
          .finally(() => {
            setIsLoading(false);
          });
      })
      .catch((error) => {
        console.error("Error fetching transaction data:", error);
        toast.error("Failed to fetch transaction data");
      });
  }, [
    amount,
    toAddress,
    addressError,
    selectedToken?.address,
    safeConfig?.address,
    signTypedDataAsync,
    clearAndClose,
    fetchDelayQueue,
  ]);

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
                  Please ensure you enter a Gnosis Chain address. You are solely responsible for the accuracy of the
                  address and the safety of your funds.
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
