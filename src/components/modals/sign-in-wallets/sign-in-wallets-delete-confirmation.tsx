import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { StandardAlert } from "@/components/ui/standard-alert";
import { deleteApiV1EoaAccountsById, type EoaAccount } from "@/client";
import { toast } from "sonner";
import { extractErrorMessage } from "@/utils/errorHelpers";
import { AlertTriangle } from "lucide-react";

interface SignInWalletsDeleteConfirmationProps {
  account: EoaAccount;
  onCancel: () => void;
  onSuccess: () => void;
}

export const SignInWalletsDeleteConfirmation = ({
  account,
  onCancel,
  onSuccess,
}: SignInWalletsDeleteConfirmationProps) => {
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = useCallback(() => {
    if (!account.id) {
      setError("Account ID is missing");
      return;
    }

    setIsDeleting(true);
    setError(null);

    deleteApiV1EoaAccountsById({
      path: { id: account.id },
    })
      .then((response) => {
        if (response.error) {
          setError(extractErrorMessage(response.error, "Failed to delete wallet address"));
          return;
        }

        toast.success("Sign-in address deleted successfully");
        onSuccess();
      })
      .catch((err) => {
        console.error("Error deleting EOA account:", err);
        setError("Failed to delete wallet address");
      })
      .finally(() => {
        setIsDeleting(false);
      });
  }, [account.id, onSuccess]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center text-center space-y-4">
        <div className="p-3 bg-destructive/10 rounded-full">
          <AlertTriangle className="w-8 h-8 text-destructive" />
        </div>

        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-foreground">Delete wallet address</h3>
          <p className="text-sm text-muted-foreground max-w-sm">
            Are you sure you want to delete this wallet address? This action cannot be undone.
          </p>
        </div>

        <div className="w-full p-3 bg-muted/50 rounded-lg">
          <div className="text-xs text-muted-foreground mb-1">Address</div>
          <div className="font-mono text-sm text-foreground break-all">{account.address || "N/A"}</div>
        </div>
      </div>

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
          {isDeleting ? "Deleting..." : "Delete wallet"}
        </Button>
      </div>
    </div>
  );
};
