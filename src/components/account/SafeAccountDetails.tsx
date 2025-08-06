import { Button } from "@/components/ui/button";
import { currencies } from "@/constants";
import { useUser } from "@/context/UserContext";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
import { shortenAddress } from "@/utils/shortenAddress";
import { Copy } from "lucide-react";
import { useMemo } from "react";
import { StandardAlert } from "@/components/ui/standard-alert";

interface SafeAccountDetailsProps {
  showTokenAndNetwork?: boolean;
  addressLabel?: string;
}

export const SafeAccountDetails = ({ addressLabel = "Wallet address" }: SafeAccountDetailsProps) => {
  const { safeConfig } = useUser();
  const { copyToClipboard } = useCopyToClipboard();

  const currency = useMemo(() => {
    if (!safeConfig?.fiatSymbol) return null;
    return currencies[safeConfig.fiatSymbol];
  }, [safeConfig]);

  const handleCopyAddress = () => {
    const address = safeConfig?.address || "";
    copyToClipboard(address, {
      successMessage: "Wallet address copied to clipboard",
      errorMessage: "Failed to copy wallet address",
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <div className="text-sm text-muted-foreground mb-2">Token</div>
        <div className="text-foreground">{currency?.tokenSymbol}</div>
      </div>

      <div>
        <div className="text-sm text-muted-foreground mb-2">Network</div>
        <div className="text-foreground">Gnosis Chain</div>
      </div>

      <div>
        <div className="text-sm font-medium text-muted-foreground">{addressLabel}</div>
        <div className="mt-1 flex items-center gap-2">
          <div className="flex-1 p-3 bg-muted/50 rounded-lg font-mono text-sm text-foreground break-all">
            {safeConfig?.address || "N/A"}
          </div>
          {safeConfig?.address && (
            <Button variant="outline" size="sm" onClick={handleCopyAddress} className="p-2 flex-shrink-0">
              <Copy className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      <StandardAlert
        variant="warning"
        description={`Please only deposit ${currency?.tokenSymbol} on Gnosis Chain${
          currency?.address ? ` (contract ${shortenAddress(currency.address)})` : ""
        }, this is solely your responsibility. If you deposit on another network, your assets may be lost.`}
      />
    </div>
  );
};
