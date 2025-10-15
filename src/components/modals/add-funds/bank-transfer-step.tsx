import { Button } from "@/components/ui/button";
import { useUser } from "@/context/UserContext";
import { ArrowLeft } from "lucide-react";
import { IbanAccountDetails } from "@/components/account";

interface BankTransferStepProps {
  onBack: () => void;
}

export const BankTransferStep = ({ onBack }: BankTransferStepProps) => {
  const { safeConfig } = useUser();

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-6">
        <Button variant="outline" size="sm" onClick={onBack} className="p-2">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-3">
          <p className="text-sm text-muted-foreground">
            Use these account details to send {safeConfig?.fiatSymbol} to your linked account
          </p>
        </div>
      </div>

      <IbanAccountDetails />
    </div>
  );
};
