import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ADD_FUNDS_CONSTANTS } from "@/constants";
import { useUser } from "@/context/UserContext";
import { useUserFullName } from "@/hooks/useUserFullName";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
import { ArrowLeft, Info, Copy } from "lucide-react";
import { useMemo } from "react";

interface BankTransferStepProps {
  onBack: () => void;
}

export const BankTransferStep = ({ onBack }: BankTransferStepProps) => {
  const { user } = useUser();
  const fullName = useUserFullName();
  const { copyToClipboard } = useCopyToClipboard();
  const beneficiaryName = useMemo(() => {
    return fullName.toUpperCase();
  }, [fullName]);

  const handleCopyBeneficiary = () => {
    copyToClipboard(beneficiaryName, {
      successMessage: "Beneficiary name copied to clipboard",
      errorMessage: "Failed to copy beneficiary name",
    });
  };

  const handleCopyIban = () => {
    const iban = user?.bankingDetails?.moneriumIban || "";
    copyToClipboard(iban, {
      successMessage: "IBAN copied to clipboard",
      errorMessage: "Failed to copy IBAN",
    });
  };

  const handleCopyBic = () => {
    const bic = user?.bankingDetails?.moneriumBic || "";
    copyToClipboard(bic, {
      successMessage: "BIC copied to clipboard",
      errorMessage: "Failed to copy BIC",
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-6">
        <Button variant="outline" size="sm" onClick={onBack} className="p-2">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-3">
          <p className="text-sm text-muted-foreground">
            Use these account details to send Euros to your Gnosis Pay Card account
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <div className="text-sm font-medium text-muted-foreground">Beneficiary</div>
          <div className="mt-1 flex items-center gap-2">
            <div className="flex-1 p-3 bg-muted/50 rounded-lg font-medium text-foreground">{beneficiaryName}</div>
            {beneficiaryName && (
              <Button variant="outline" size="sm" onClick={handleCopyBeneficiary} className="p-2 flex-shrink-0">
                <Copy className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        <div>
          <div className="text-sm font-medium text-muted-foreground">IBAN</div>
          <div className="mt-1 flex items-center gap-2">
            <div className="flex-1 p-3 bg-muted/50 rounded-lg font-mono text-foreground">
              {user?.bankingDetails?.moneriumIban || "N/A"}
            </div>
            {user?.bankingDetails?.moneriumIban && (
              <Button variant="outline" size="sm" onClick={handleCopyIban} className="p-2 flex-shrink-0">
                <Copy className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        <div>
          <div className="text-sm font-medium text-muted-foreground">BIC</div>
          <div className="mt-1 flex items-center gap-2">
            <div className="flex-1 p-3 bg-muted/50 rounded-lg font-mono text-foreground">
              {user?.bankingDetails?.moneriumBic || "N/A"}
            </div>
            {user?.bankingDetails?.moneriumBic && (
              <Button variant="outline" size="sm" onClick={handleCopyBic} className="p-2 flex-shrink-0">
                <Copy className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-3 pt-4 border-t border-border">
        <Alert variant="warning">
          <Info className="h-4 w-4" />
          <AlertDescription>Counterpart bank may charge for international payments.</AlertDescription>
        </Alert>

        <Alert variant="info">
          <Info className="h-4 w-4" />
          <AlertDescription>
            All transfers go through SEPA Instant. SEPA Standard is used when the counterpart bank does not support SEPA
            Instant, or the amount exceeds 100,000 EUR.
          </AlertDescription>
        </Alert>

        <Alert variant="info">
          <Info className="h-4 w-4" />
          <AlertDescription>
            Instant payments are available 24/7, 365 days a year. SEPA Standard may take up to one business day.
          </AlertDescription>
        </Alert>

        <Alert variant="info">
          <Info className="h-4 w-4" />
          <AlertDescription>
            The IBAN and related services are provided by Monerium EMI ehf., a third party electronic money institution
            <a
              href={ADD_FUNDS_CONSTANTS.MONERIUM_AUTHORISED_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2"
            >
              authorised by the Financial Supervisory Authority of the Central Bank of Iceland.
            </a>
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
};
