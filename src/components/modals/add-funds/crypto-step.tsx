import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ADD_FUNDS_CONSTANTS, currencies } from "@/constants";
import { useUser } from "@/context/UserContext";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
import { useDebridgeUrl } from "@/hooks/useDebridgeUrl";
import { shortenAddress } from "@/utils/shortenAddress";
import { ArrowLeft, Copy, AlertTriangle, ExternalLink } from "lucide-react";
import { useMemo } from "react";

interface CryptoStepProps {
  onBack: () => void;
}

export const CryptoStep = ({ onBack }: CryptoStepProps) => {
  const { safeConfig } = useUser();
  const { copyToClipboard } = useCopyToClipboard();
  const currency = useMemo(() => {
    if (!safeConfig?.fiatSymbol) return null;
    return currencies[safeConfig.fiatSymbol];
  }, [safeConfig]);

  const debridgeUrl = useDebridgeUrl();

  const handleCopyAddress = () => {
    const address = safeConfig?.address || "";
    copyToClipboard(address, {
      successMessage: "Wallet address copied to clipboard",
      errorMessage: "Failed to copy address",
    });
  };

  const handleDeBridgeClick = () => {
    if (!debridgeUrl) return;
    window.open(debridgeUrl, "_blank");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-6">
        <Button variant="outline" size="sm" onClick={onBack} className="p-2">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-3">
          <p className="text-sm text-muted-foreground">
            Send {currency?.tokenSymbol} directly to your Gnosis Pay Safe Account
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <div className="text-sm font-medium text-muted-foreground">Wallet address</div>
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

        <Alert variant="warning">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Please only deposit {currency?.tokenSymbol} on Gnosis Chain (contract{" "}
            {shortenAddress(currency?.address || "")}), this is solely your responsibility. If you deposit on another
            network, your assets may be lost.
          </AlertDescription>
        </Alert>

        <div className="pt-4 border-t border-border">
          <div className="text-center space-y-4">
            <div className="text-sm font-medium text-muted-foreground">OR</div>

            <div>
              <p className="text-sm text-muted-foreground mb-4">
                Get {currency?.tokenSymbol} on Gnosis Chain through deBridge below
              </p>
              <a
                href={ADD_FUNDS_CONSTANTS.GNOSIS_PAY_HELP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-foreground underline hover:no-underline"
              >
                See more options
              </a>
            </div>

            <Button onClick={handleDeBridgeClick} className="w-full flex items-center gap-2">
              <ExternalLink className="h-4 w-4" />
              Get {currency?.tokenSymbol} with deBridge
            </Button>

            <div className="text-xs text-muted-foreground">
              By proceeding, you acknowledge that the service is provided by third parties and that you are entering
              into the{" "}
              <a
                href={ADD_FUNDS_CONSTANTS.DEBRIDGE_LICENSE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground underline hover:no-underline"
              >
                deBridge SDK and API License Agreement
              </a>{" "}
              and applicable third-party terms. Please conduct your own research and use at your own risk.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
