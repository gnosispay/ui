import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StandardAlert } from "@/components/ui/standard-alert";
import { getApiV1OwnersAddTransactionData, postApiV1Owners } from "@/client";
import { useUser } from "@/context/UserContext";
import { useSignTypedData } from "wagmi";
import { isAddress } from "viem";
import { extractErrorMessage } from "@/utils/errorHelpers";
import { toast } from "sonner";

interface SafeOwnersEditProps {
  onCancel: () => void;
  onSuccess: () => void;
}

export const SafeOwnersEdit = ({ onCancel, onSuccess }: SafeOwnersEditProps) => {
  const { safeConfig } = useUser();
  const [newOwnerAddress, setNewOwnerAddress] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { signTypedDataAsync } = useSignTypedData();

  const handleAddressChange = useCallback((value: string) => {
    setError(null);
    setNewOwnerAddress(value);
  }, []);

  const handleSave = useCallback(async () => {
    if (!safeConfig?.address) {
      setError("Safe configuration not found");
      return;
    }

    const trimmedAddress = newOwnerAddress.trim();

    if (!trimmedAddress) {
      setError("Please enter an owner address");
      return;
    }

    if (!isAddress(trimmedAddress)) {
      setError("Please enter a valid wallet address");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Step 1: Get transaction data to sign
      const { error: transactionError, data: transactionData } = await getApiV1OwnersAddTransactionData({
        query: {
          newOwner: trimmedAddress,
        },
      });

      if (transactionError) {
        setError(extractErrorMessage(transactionError, "Failed to create transaction"));
        return;
      }

      if (!transactionData?.data) {
        setError("No transaction data received");
        return;
      }

      // Step 2: Sign the typed data
      const signature = await signTypedDataAsync({
        ...transactionData.data,
        domain: {
          ...transactionData.data.domain,
          verifyingContract: transactionData.data.domain.verifyingContract as `0x${string}`,
        },
      });

      if (!signature) {
        setError("Failed to sign transaction");
        return;
      }

      // Step 3: Submit the signed transaction
      const { error: postError } = await postApiV1Owners({
        body: {
          newOwner: trimmedAddress,
          signature,
          message: transactionData.data.message,
        },
      });

      if (postError) {
        setError(extractErrorMessage(postError, "Failed to add owner"));
        return;
      }

      toast.success("Owner added successfully");
      onSuccess();
    } catch (err) {
      console.error("Error adding owner:", err);
      setError("Failed to add owner");
    } finally {
      setIsSubmitting(false);
    }
  }, [newOwnerAddress, safeConfig?.address, signTypedDataAsync, onSuccess]);

  const onChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      handleAddressChange(e.target.value);
    },
    [handleAddressChange],
  );

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <label htmlFor="owner-address" className="text-sm text-muted-foreground">
          Owner address
        </label>
        <Input
          id="owner-address"
          type="text"
          value={newOwnerAddress}
          onChange={onChange}
          placeholder="0x..."
          className="font-mono"
        />
        <div className="text-xs text-muted-foreground">
          Enter a valid wallet address that will become a new owner of your Safe
        </div>
      </div>

      <StandardAlert
        variant="warning"
        title="Security Warning"
        description="The new owner will have full access to all funds and assets in this Safe. They will be able to sign transactions, manage the Safe, and control all digital assets. Only add trusted addresses as owners."
      />

      {error && <StandardAlert variant="destructive" title="Error" description={error} />}

      <div className="flex gap-3">
        <Button variant="outline" className="flex-1" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button
          className="flex-1 bg-button-bg hover:bg-button-bg-hover text-button-black font-medium"
          onClick={handleSave}
          disabled={isSubmitting || !newOwnerAddress.trim()}
          loading={isSubmitting}
        >
          {isSubmitting ? "Adding..." : "Add owner"}
        </Button>
      </div>
    </div>
  );
};
