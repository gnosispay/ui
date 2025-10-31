import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StandardAlert } from "@/components/ui/standard-alert";
import { Checkbox } from "@/components/ui/checkbox";
import { getApiV1OwnersAddTransactionData, postApiV1EoaAccounts, postApiV1Owners } from "@/client";
import { useUser } from "@/context/UserContext";
import { useSignTypedData } from "wagmi";
import { type Address, isAddress } from "viem";
import { extractErrorMessage } from "@/utils/errorHelpers";
import { toast } from "sonner";
import { useSmartWallet } from "@/hooks/useSmartWallet";
import { useDelayRelay } from "@/context/DelayRelayContext";
import { useSafeSignerVerification } from "@/hooks/useSafeSignerVerification";

interface SafeOwnersAddProps {
  onCancel: () => void;
  onSuccess: () => void;
  currentOwners: string[];
}

export const SafeOwnersAdd = ({ onCancel, onSuccess, currentOwners }: SafeOwnersAddProps) => {
  const { safeConfig } = useUser();
  const [newOwnerAddress, setNewOwnerAddress] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [addAsSignInWallet, setAddAsSignInWallet] = useState(true);
  const { signTypedDataAsync } = useSignTypedData();
  const { smartWalletAddress, isLoading: isSmartWalletLoading } = useSmartWallet();
  const { fetchDelayQueue } = useDelayRelay();
  const { isSignerConnected, signerError, isDataLoading } = useSafeSignerVerification();
  const handleAddressChange = useCallback((value: string) => {
    setError(null);
    setNewOwnerAddress(value);
  }, []);

  const handleSave = useCallback(async () => {
    if (currentOwners.includes(newOwnerAddress)) {
      setError("Owner already exists");
      return;
    }

    if (!safeConfig?.address) {
      setError("Safe configuration not found");
      return;
    }

    if (isSmartWalletLoading) {
      setError("Smart wallet loading");
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
          verifyingContract: transactionData.data.domain.verifyingContract as Address,
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
          smartWalletAddress,
        },
      });

      if (postError) {
        setError(extractErrorMessage(postError, "Failed to add owner"));
        return;
      }

      // Conditionally add as a Sign-in Wallet if checkbox is checked
      if (addAsSignInWallet) {
        postApiV1EoaAccounts({
          body: {
            address: trimmedAddress,
          },
        })
          .then((response) => {
            if (response.error) {
              setError(extractErrorMessage(response.error, "Failed to add wallet address"));
              return;
            }

            toast.success("Sign-in Wallet added successfully");
          })
          .catch((err) => {
            console.error("Error adding Sign In Wallet account:", err);
            setError("Failed to add wallet address");
          });
      }

      toast.success("Owner addition queued successfully");
      fetchDelayQueue();
      onSuccess();
    } catch (err) {
      console.error("Error adding owner:", err);
      setError("Failed to add owner");
    } finally {
      setIsSubmitting(false);
    }
  }, [
    newOwnerAddress,
    safeConfig?.address,
    signTypedDataAsync,
    onSuccess,
    currentOwners,
    smartWalletAddress,
    isSmartWalletLoading,
    addAsSignInWallet,
    fetchDelayQueue,
  ]);

  const onChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      handleAddressChange(e.target.value);
    },
    [handleAddressChange],
  );

  return (
    <div className="space-y-6">
      {!isSignerConnected && !isDataLoading && (
        <StandardAlert
          variant="destructive"
          description="You must be connected with an account that is a signer of the Gnosis Pay account"
        />
      )}

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

      <div className="flex items-start space-x-3">
        <Checkbox
          id="add-signin-wallet"
          checked={addAsSignInWallet}
          onCheckedChange={(checked: boolean) => setAddAsSignInWallet(checked === true)}
          disabled={isSubmitting}
        />
        <label htmlFor="add-signin-wallet" className="text-sm text-foreground leading-none cursor-pointer select-none">
          Add this address as a sign-in wallet
        </label>
      </div>

      <StandardAlert
        variant="warning"
        title="Security Warning"
        description="The new owner will have full access to all funds and assets in this Safe. They will be able to sign transactions, manage the Safe, and control all digital assets. Only add trusted addresses as owners."
      />

      {error && <StandardAlert variant="destructive" title="Error" description={error} />}
      {signerError && <StandardAlert variant="destructive" description={signerError.message} />}

      <div className="flex gap-3">
        <Button variant="outline" className="flex-1" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button
          className="flex-1 bg-button-bg hover:bg-button-bg-hover text-button-black font-medium"
          onClick={handleSave}
          disabled={isSubmitting || !newOwnerAddress.trim() || !isSignerConnected || !!signerError}
          loading={isSubmitting}
        >
          {isSubmitting ? "Adding..." : "Add owner"}
        </Button>
      </div>
    </div>
  );
};
