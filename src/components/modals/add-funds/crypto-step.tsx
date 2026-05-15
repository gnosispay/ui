import { Button } from "@/components/ui/button";
import { ADD_FUNDS_CONSTANTS, currencies } from "@/constants";
import { useUser } from "@/context/UserContext";
import { useJumperUrl } from "@/hooks/useJumperUrl";
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

  const jumperUrl = useJumperUrl();

  const handleJumperClick = () => {
    if (!jumperUrl) return;
    window.open(jumperUrl, "_blank");
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
      <SafeAccountDetails />
    </div>
  );
};
