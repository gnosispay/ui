import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StandardAlert } from "@/components/ui/standard-alert";
import { postApiV1EoaAccounts } from "@/client";
import { toast } from "sonner";
import { extractErrorMessage } from "@/utils/errorHelpers";

interface SignInWalletsEditProps {
  onCancel: () => void;
  onSuccess: () => void;
}

export const SignInWalletsEdit = ({ onCancel, onSuccess }: SignInWalletsEditProps) => {
  const [address, setAddress] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateAddress = useCallback((addr: string) => {
    // Basic Ethereum address validation
    const ethereumAddressRegex = /^0x[a-fA-F0-9]{40}$/;
    return ethereumAddressRegex.test(addr);
  }, []);

  const handleAddressChange = useCallback((value: string) => {
    setError(null);
    setAddress(value);
  }, []);

  const handleSave = useCallback(async () => {
    const trimmedAddress = address.trim();

    if (!trimmedAddress) {
      setError("Please enter a wallet address");
      return;
    }

    if (!validateAddress(trimmedAddress)) {
      setError("Please enter a valid Ethereum address");
      return;
    }

    setIsSubmitting(true);
    setError(null);

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

        toast.success("Wallet address added successfully");
        onSuccess();
      })
      .catch((err) => {
        console.error("Error adding EOA account:", err);
        setError("Failed to add wallet address");
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  }, [address, onSuccess, validateAddress]);

  const onChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      handleAddressChange(e.target.value);
    },
    [handleAddressChange],
  );

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <label htmlFor="wallet-address" className="text-sm text-muted-foreground">
          Wallet address
        </label>
        <Input
          id="wallet-address"
          type="text"
          value={address}
          onChange={onChange}
          placeholder="0x..."
          className="font-mono"
        />
        <div className="text-xs text-muted-foreground">
          Enter a valid Ethereum wallet address that you want to use for signing in
        </div>
      </div>

      {error && <StandardAlert variant="destructive" title="Error" description={error} />}

      <div className="flex gap-3">
        <Button variant="outline" className="flex-1" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button
          className="flex-1 bg-button-bg hover:bg-button-bg-hover text-button-black font-medium"
          onClick={handleSave}
          disabled={isSubmitting || !address.trim()}
          loading={isSubmitting}
        >
          {isSubmitting ? "Adding..." : "Add wallet"}
        </Button>
      </div>
    </div>
  );
};
