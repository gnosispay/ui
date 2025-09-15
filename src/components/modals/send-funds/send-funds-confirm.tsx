import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { StandardAlert } from "@/components/ui/standard-alert";
import { Clock } from "lucide-react";
import { formatUnits } from "viem";
import type { Address } from "viem";
import { useSignTypedData } from "wagmi";
import { toast } from "sonner";
import { useState, useCallback } from "react";
import type { TokenInfoWithBalance } from "@/hooks/useTokenBalance";
import { getApiV1AccountsWithdrawTransactionData, postApiV1AccountsWithdraw } from "@/client";
import { useDelayRelay } from "@/context/DelayRelayContext";
import { useUser } from "@/context/UserContext";

interface SendFundsConfirmProps {
  selectedToken: TokenInfoWithBalance;
  amount: bigint;
  toAddress: string;
  onBack: () => void;
  onSuccess: () => void;
}

export const SendFundsConfirm = ({ selectedToken, amount, toAddress, onBack, onSuccess }: SendFundsConfirmProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { signTypedDataAsync } = useSignTypedData();
  const { fetchDelayQueue } = useDelayRelay();
  const { safeConfig } = useUser();

  const handleConfirm = useCallback(async () => {
    if (!selectedToken || !toAddress || !amount || !safeConfig?.address || !selectedToken.address) {
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
            verifyingContract: typedData.domain.verifyingContract as Address,
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
                smartWalletAddress: "0x65aDF87D13c84a53daf57B4d5Cf07C5561BC91f5",
              },
            })
              .then(({ data, error }) => {
                if (error) {
                  console.error("Error submitting transaction:", error);
                  toast.error("Failed to submit transaction");
                  return;
                }
                onSuccess();
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
  }, [selectedToken, toAddress, amount, signTypedDataAsync, onSuccess, fetchDelayQueue, safeConfig?.address]);

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="bg-muted/50 p-4 rounded-lg">
          <Label className="text-muted-foreground text-sm">You're sending</Label>
          <div className="flex items-center gap-2 mt-1">
            {selectedToken.logo && <img src={selectedToken.logo} className="h-6 w-6 rounded-full" alt="Token" />}
            <div className="text-xl font-semibold">{formatUnits(amount, selectedToken.decimals ?? 18)}</div>
            <div className="text-lg text-muted-foreground">{selectedToken.symbol}</div>
          </div>
        </div>

        <div className="bg-muted/50 p-4 rounded-lg">
          <Label className="text-muted-foreground text-sm">To</Label>
          <div className="mt-1 font-mono text-sm break-all">{toAddress}</div>
        </div>
      </div>

      <StandardAlert
        variant="info"
        description="As a security measure, your card will be temporarily frozen for 3 minutes."
        customIcon={<Clock className="h-4 w-4" />}
      />

      <div className="flex gap-3">
        <Button variant="outline" onClick={onBack} disabled={isLoading}>
          Back
        </Button>

        <Button
          onClick={handleConfirm}
          disabled={isLoading || !safeConfig?.address}
          loading={isLoading}
          className="flex-1"
        >
          {isLoading ? "Executing..." : "Confirm and execute"}
        </Button>
      </div>
    </div>
  );
};
