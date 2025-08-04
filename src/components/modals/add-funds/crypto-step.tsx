import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ADD_FUNDS_CONSTANTS, currencies } from "@/constants";
import { useUser } from "@/context/UserContext";
import { useDebridgeUrl } from "@/hooks/useDebridgeUrl";
import { ExternalLink, ArrowLeft } from "lucide-react";
import { useMemo } from "react";
import { SafeAccountDetails } from "@/components/account/SafeAccountDetails";

interface CryptoStepProps {
  onBack: () => void;
}

export const CryptoStep = ({ onBack }: CryptoStepProps) => {
  const { safeConfig } = useUser();
  const currency = useMemo(() => {
    if (!safeConfig?.fiatSymbol) return null;
    return currencies[safeConfig.fiatSymbol];
  }, [safeConfig]);

  const debridgeUrl = useDebridgeUrl();

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
        <SafeAccountDetails />

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
