import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
import type { EoaAccount } from "@/client";
import { Button } from "@/components/ui/button";
import { Copy, InboxIcon } from "lucide-react";

interface SignInWalletsViewProps {
  eoaAccounts: EoaAccount[];
  isLoading: boolean;
  onEditClick: () => void;
}

export const SignInWalletsView = ({ eoaAccounts, isLoading, onEditClick }: SignInWalletsViewProps) => {
  const { copyToClipboard } = useCopyToClipboard();

  const handleCopyAddress = (address: string | undefined) => {
    if (!address) return;

    copyToClipboard(address, {
      successMessage: "Address copied to clipboard",
      errorMessage: "Failed to copy address",
    });
  };

  return (
    <div className="space-y-4">
      {isLoading && (
        <div className="space-y-3">
          <div className="space-y-2">
            <div className="h-4 bg-muted/50 rounded animate-pulse" />
            <div className="flex items-center gap-2">
              <div className="flex-1 h-12 bg-muted/50 rounded-lg animate-pulse" />
              <div className="h-9 w-9 bg-muted/50 rounded animate-pulse" />
            </div>
          </div>
          <div className="space-y-2">
            <div className="h-4 bg-muted/50 rounded animate-pulse" />
            <div className="flex items-center gap-2">
              <div className="flex-1 h-12 bg-muted/50 rounded-lg animate-pulse" />
              <div className="h-9 w-9 bg-muted/50 rounded animate-pulse" />
            </div>
          </div>
        </div>
      )}

      {!isLoading && eoaAccounts.length === 0 && (
        <div className="flex flex-col items-center justify-center py-8">
          <InboxIcon className="w-10 h-10 mb-2 text-muted-foreground" />
          <div className="text-center text-muted-foreground">No sign-in wallets found</div>
        </div>
      )}

      {!isLoading && eoaAccounts.length > 0 && (
        <div className="space-y-4">
          {eoaAccounts.map((account) => (
            <div key={account.id || account.address || Math.random()} className="space-y-2">
              <div className="text-sm text-muted-foreground">Address</div>
              <div className="flex items-center gap-2">
                <div className="flex-1 p-3 bg-muted/50 rounded-lg font-mono text-sm text-foreground break-all">
                  {account.address || "N/A"}
                </div>
                {account.address && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopyAddress(account.address)}
                    className="p-2 flex-shrink-0"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {!isLoading && (
        <Button className="w-full bg-brand hover:bg-brand/90 text-button-black font-medium" onClick={onEditClick}>
          Add wallet
        </Button>
      )}
    </div>
  );
};
