import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { StandardAlert } from "@/components/ui/standard-alert";
import { getApiV1OwnersRemoveTransactionData, deleteApiV1Owners } from "@/client";
import { useUser } from "@/context/UserContext";
import { useSignTypedData } from "wagmi";
import { extractErrorMessage } from "@/utils/errorHelpers";
import { toast } from "sonner";
import { AlertTriangle } from "lucide-react";
import type { Address } from "viem";
import { useSmartWallet } from "@/hooks/useSmartWallet";

interface SafeOwnersDeleteConfirmationProps {
  ownerAddress: string;
  onCancel: () => void;
  onSuccess: () => void;
}

export const SafeOwnersDeleteConfirmation = ({
  ownerAddress,
  onCancel,
  onSuccess,
}: SafeOwnersDeleteConfirmationProps) => {
  const { safeConfig } = useUser();
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { signTypedDataAsync } = useSignTypedData();
  const { smartWalletAddress, isLoading: isSmartWalletLoading } = useSmartWallet();

  const handleDelete = useCallback(async () => {
    if (!safeConfig?.address) {
      setError("Safe configuration not found");
      return;
    }

    if (isSmartWalletLoading) {
      return;
    }

    setIsDeleting(true);
    setError(null);

    try {
      // Step 1: Get transaction data to sign
      const { error: transactionError, data: transactionData } = await getApiV1OwnersRemoveTransactionData({
        query: {
          ownerToRemove: ownerAddress,
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
          verifyingContract: transactionData.data.domain.verifyingContract as Address,
        },
      });

      if (!signature) {
        setError("Failed to sign transaction");
        return;
      }

      // Step 3: Submit the signed transaction
      const { error: deleteError } = await deleteApiV1Owners({
        body: {
          ownerToRemove: ownerAddress,
          signature,
          message: transactionData.data.message,
          smartWalletAddress,
        },
      });

      if (deleteError) {
        setError(extractErrorMessage(deleteError, "Failed to remove owner"));
        return;
      }

      toast.success("Owner removal queued successfully");
      onSuccess();
    } catch (err) {
      console.error("Error removing owner:", err);
      setError("Failed to remove owner");
    } finally {
      setIsDeleting(false);
    }
  }, [ownerAddress, safeConfig?.address, signTypedDataAsync, onSuccess, smartWalletAddress, isSmartWalletLoading]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center text-center space-y-4">
        <div className="p-3 bg-destructive/10 rounded-full">
          <AlertTriangle className="w-8 h-8 text-destructive" />
        </div>

        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-foreground">Remove Safe owner</h3>
          <p className="text-sm text-muted-foreground max-w-sm">
            Are you sure you want to remove this owner from your Safe? This action cannot be undone and will be
            processed in 3 minutes.
          </p>
        </div>

        <div className="w-full p-3 bg-muted/50 rounded-lg">
          <div className="text-xs text-muted-foreground mb-1">Owner Address</div>
          <div className="font-mono text-sm text-foreground break-all">{ownerAddress}</div>
        </div>
      </div>

      <StandardAlert
        variant="warning"
        title="Important"
        description="Removing this owner will revoke their access to sign transactions and manage the Safe. Make sure this is intended before proceeding."
      />

      {error && <StandardAlert variant="destructive" title="Error" description={error} />}

      <div className="flex gap-3">
        <Button variant="outline" className="flex-1" onClick={onCancel} disabled={isDeleting}>
          Cancel
        </Button>
        <Button
          variant="destructive"
          className="flex-1"
          onClick={handleDelete}
          disabled={isDeleting}
          loading={isDeleting}
        >
          {isDeleting ? "Removing..." : "Remove owner"}
        </Button>
      </div>
    </div>
  );
};
