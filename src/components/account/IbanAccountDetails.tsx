import { StandardAlert } from "@/components/ui/standard-alert";
import { Button } from "@/components/ui/button";
import { ADD_FUNDS_CONSTANTS } from "@/constants";
import { useUser } from "@/context/UserContext";
import { useIBAN } from "@/context/IBANContext";
import { useUserFullName } from "@/hooks/useUserFullName";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
import { Copy, InboxIcon } from "lucide-react";
import { IbanIntegrationFlow } from "@/components/iban/iban-integration-flow";
import { useState } from "react";

export const IbanAccountDetails = () => {
  const { user, safeConfig } = useUser();
  const { hasIbanSet, isEligibleForIban } = useIBAN();
  const fullName = useUserFullName();
  const { copyToClipboard } = useCopyToClipboard();
  const [isSuccessIbanIntegration, setIsSuccessIbanIntegration] = useState(false);

  const handleCopyBeneficiary = () => {
    copyToClipboard(fullName, {
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

  const handleCopyAddress = () => {
    const address = user?.bankingDetails?.address || "";
    copyToClipboard(address, {
      successMessage: "Address copied to clipboard",
      errorMessage: "Failed to copy address",
    });
  };

  // If user is eligible for IBAN but doesn't have one yet, show integration flow
  if (isEligibleForIban && !hasIbanSet) {
    return (
      <div className="space-y-4">
        {!isSuccessIbanIntegration && (
          <div className="text-center text-muted-foreground mb-4">
            You're eligible for an IBAN. Create one to receive bank transfers directly to your account.
          </div>
        )}
        <IbanIntegrationFlow showCancelButton={false} onSuccess={() => setIsSuccessIbanIntegration(true)} />
      </div>
    );
  }

  // If user is not eligible for IBAN
  if (!isEligibleForIban) {
    return (
      <div className="flex flex-col items-center justify-center mt-4">
        <InboxIcon className="w-10 h-10 mb-2 text-secondary" />
        <div className="text-center text-secondary">No IBAN available for this account</div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        <div>
          <div className="text-sm font-medium text-muted-foreground mb-2">Linked address</div>
          <div className="flex items-center gap-2">
            <div className="flex-1 p-3 bg-muted/50 rounded-lg font-medium text-foreground text-sm">
              {user?.bankingDetails?.address || "N/A"}
            </div>
            {user?.bankingDetails?.address && (
              <Button variant="outline" size="sm" onClick={handleCopyAddress} className="p-2 flex-shrink-0">
                <Copy className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
        <div>
          <div className="text-sm font-medium text-muted-foreground mb-2">Beneficiary</div>
          <div className="flex items-center gap-2">
            <div className="flex-1 p-3 bg-muted/50 rounded-lg font-medium text-foreground">{fullName}</div>
            {fullName && (
              <Button variant="outline" size="sm" onClick={handleCopyBeneficiary} className="p-2 flex-shrink-0">
                <Copy className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        <div>
          <div className="text-sm font-medium text-muted-foreground mb-2">IBAN</div>
          <div className="flex items-center gap-2">
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
          <div className="text-sm font-medium text-muted-foreground mb-2">BIC</div>
          <div className="flex items-center gap-2">
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
        <StandardAlert variant="warning" description="Counterpart bank may charge for international payments." />

        <StandardAlert
          variant="info"
          description={`All transfers go through SEPA Instant. SEPA Standard is used when the counterpart bank does not support SEPA Instant, or the amount exceeds 100,000 ${safeConfig?.fiatSymbol}.`}
        />

        <StandardAlert variant="info" description="SEPA transfers may take up to one business day." />

        <StandardAlert
          variant="info"
          description={
            <>
              The IBAN and related services are provided by Monerium EMI ehf., a third party electronic money
              institution{" "}
              <a
                href={ADD_FUNDS_CONSTANTS.MONERIUM_AUTHORISED_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2"
              >
                authorised by the Financial Supervisory Authority of the Central Bank of Iceland.
              </a>
            </>
          }
        />
      </div>
    </>
  );
};
