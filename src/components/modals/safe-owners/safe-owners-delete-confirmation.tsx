import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { StandardAlert } from "@/components/ui/standard-alert";
import { Checkbox } from "@/components/ui/checkbox";
import {
  getApiV1OwnersRemoveTransactionData,
  deleteApiV1Owners,
  getApiV1EoaAccounts,
  type EoaAccount,
  deleteApiV1EoaAccountsById,
} from "@/client";
import { useUser } from "@/context/UserContext";
import { useSignTypedData } from "wagmi";
import { extractErrorMessage } from "@/utils/errorHelpers";
import { toast } from "sonner";
import { AlertTriangle } from "lucide-react";
import type { Address } from "viem";
import { useSmartWallet } from "@/hooks/useSmartWallet";
import { useDelayRelay } from "@/context/DelayRelayContext";
import { useSafeSignerVerification } from "@/hooks/useSafeSignerVerification";

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
  const [removeSignInAccess, setRemoveSignInAccess] = useState(true);
  const { signTypedDataAsync } = useSignTypedData();
  const { smartWalletAddress, isLoading: isSmartWalletLoading } = useSmartWallet();
  const { fetchDelayQueue } = useDelayRelay();
  const { isSignerConnected, signerError, isDataLoading } = useSafeSignerVerification();

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

      // Conditionally delete as a Sign-in Wallet if checkbox is checked
      if (removeSignInAccess) {
        // first we need to get the current sign-in accounts
        getApiV1EoaAccounts()
          .then((response) => {
            let signInWallets: EoaAccount[] = [];

            if (response.data?.data?.eoaAccounts) {
              signInWallets = response.data.data.eoaAccounts;
            }

            // find the sign-in wallet to delete
            const signInWalletToDelete = signInWallets.find((account) => account.address === ownerAddress);

            if (!signInWalletToDelete?.id) {
              return;
            }

            deleteApiV1EoaAccountsById({
              path: { id: signInWalletToDelete.id },
            })
              .then((response) => {
                if (response.error) {
                  setError(extractErrorMessage(response.error, "Failed to delete wallet address"));
                  return;
                }

                toast.success("Sign-in address deleted successfully");
              })
              .catch((err) => {
                console.error("Error deleting EOA account:", err);
                setError("Failed to delete wallet address");
              });
          })
          .catch((error) => {
            console.error("Failed to fetch sign-in wallets:", error);
            setError("Failed to load sign-in wallets");
          });
      }

      toast.success("Owner removal queued successfully");
      fetchDelayQueue();
      onSuccess();
    } catch (err) {
      console.error("Error removing owner:", err);
      setError("Failed to remove owner");
    } finally {
      setIsDeleting(false);
    }
  }, [
    ownerAddress,
    safeConfig?.address,
    signTypedDataAsync,
    onSuccess,
    smartWalletAddress,
    isSmartWalletLoading,
    removeSignInAccess,
    fetchDelayQueue,
  ]);

  return (
    <div className="space-y-6">
      {!isSignerConnected && !isDataLoading && (
        <StandardAlert
          variant="destructive"
          description="You must be connected with an account that is a signer of the Gnosis Pay account"
        />
      )}

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

      <div className="flex items-start space-x-3">
        <Checkbox
          id="remove-signin-access"
          checked={removeSignInAccess}
          onCheckedChange={(checked: boolean) => setRemoveSignInAccess(checked === true)}
          disabled={isDeleting}
        />
        <label
          htmlFor="remove-signin-access"
          className="text-sm text-foreground leading-none cursor-pointer select-none"
        >
          Remove this address from being able to sign-in
        </label>
      </div>

      <StandardAlert
        variant="warning"
        title="Important"
        description="Removing this owner will revoke their access to sign transactions and manage the Safe. Make sure this is intended before proceeding."
      />

      {error && <StandardAlert variant="destructive" title="Error" description={error} />}
      {signerError && <StandardAlert variant="destructive" description={signerError.message} />}

      <div className="flex gap-3">
        <Button variant="outline" className="flex-1" onClick={onCancel} disabled={isDeleting}>
          Cancel
        </Button>
        <Button
          variant="destructive"
          className="flex-1"
          onClick={handleDelete}
          disabled={isDeleting || !isSignerConnected || !!signerError}
          loading={isDeleting}
        >
          {isDeleting ? "Removing..." : "Remove owner"}
        </Button>
      </div>
    </div>
  );
};
