import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
import { Button } from "@/components/ui/button";
import { Copy, InboxIcon, Trash2 } from "lucide-react";
import { useCallback } from "react";

interface SafeOwnersViewProps {
  owners: string[];
  isLoading: boolean;
  onEditClick: () => void;
  onDeleteClick: (ownerAddress: string) => void;
}

export const SafeOwnersView = ({ owners, isLoading, onEditClick, onDeleteClick }: SafeOwnersViewProps) => {
  const { copyToClipboard } = useCopyToClipboard();

  const handleCopyAddress = useCallback(
    (address: string) => {
      copyToClipboard(address, {
        successMessage: "Address copied to clipboard",
        errorMessage: "Failed to copy address",
      });
    },
    [copyToClipboard],
  );

  const handleDeleteClick = useCallback(
    (ownerAddress: string) => {
      onDeleteClick(ownerAddress);
    },
    [onDeleteClick],
  );

  return (
    <div className="space-y-4">
      {isLoading && (
        <div className="space-y-3">
          <div className="space-y-2">
            <div className="h-4 bg-muted/50 rounded animate-pulse" />
            <div className="flex items-center gap-2">
              <div className="flex-1 h-12 bg-muted/50 rounded-lg animate-pulse" />
              <div className="h-9 w-9 bg-muted/50 rounded animate-pulse" />
              <div className="h-9 w-9 bg-muted/50 rounded animate-pulse" />
            </div>
          </div>
          <div className="space-y-2">
            <div className="h-4 bg-muted/50 rounded animate-pulse" />
            <div className="flex items-center gap-2">
              <div className="flex-1 h-12 bg-muted/50 rounded-lg animate-pulse" />
              <div className="h-9 w-9 bg-muted/50 rounded animate-pulse" />
              <div className="h-9 w-9 bg-muted/50 rounded animate-pulse" />
            </div>
          </div>
        </div>
      )}

      {!isLoading && owners.length === 0 && (
        <div className="flex flex-col items-center justify-center py-8">
          <InboxIcon className="w-10 h-10 mb-2 text-muted-foreground" />
          <div className="text-center text-muted-foreground">No safe owners found</div>
        </div>
      )}

      {!isLoading && owners.length > 0 && (
        <div className="space-y-4">
          {owners.map((ownerAddress, index) => (
            <div key={ownerAddress || index} className="space-y-2">
              <div className="text-sm text-muted-foreground">Owner Address</div>
              <div className="flex items-center gap-2">
                <div className="flex-1 p-3 bg-muted/50 rounded-lg font-mono text-xs text-foreground break-all">
                  {ownerAddress}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopyAddress(ownerAddress)}
                  className="p-2 flex-shrink-0"
                >
                  <Copy className="h-4 w-4" />
                </Button>
                {owners.length > 1 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteClick(ownerAddress)}
                    className="p-2 flex-shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {!isLoading && (
        <Button className="w-full bg-brand hover:bg-brand/90 text-button-black font-medium" onClick={onEditClick}>
          Add owner
        </Button>
      )}
    </div>
  );
};
