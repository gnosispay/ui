import { useState, useCallback, useMemo } from "react";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StandardAlert } from "@/components/ui/standard-alert";
import { getApiV1IbansSigningMessage, postApiV1IntegrationsMonerium } from "@/client";
import { extractErrorMessage } from "@/utils/errorHelpers";
import { useConnection, useSignMessage } from "wagmi";
import { useUser } from "@/context/UserContext";
import { shortenAddress } from "@/utils/shortenAddress";
import { currencies } from "@/constants";

interface IbanIntegrationFlowProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  showCancelButton?: boolean;
}

export function IbanIntegrationFlow({ onSuccess, onCancel, showCancelButton = true }: IbanIntegrationFlowProps) {
  const { signMessageAsync } = useSignMessage();
  const { refreshUser, safeConfig, user } = useUser();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState(false);
  const { address } = useConnection();

  const currency = useMemo(() => {
    if (!safeConfig?.fiatSymbol) return null;
    return currencies[safeConfig.fiatSymbol];
  }, [safeConfig]);

  const handleIntegrationMoneriumButtonClick = useCallback(async () => {
    setIsProcessing(true);
    setError("");

    try {
      const { data: messageToSign, error: messageToSignError } = await getApiV1IbansSigningMessage();

      if (messageToSignError) {
        console.error("Error getting message to sign", messageToSignError);
        setError(extractErrorMessage(messageToSignError, "Failed to get signing message"));
        return;
      }

      if (!messageToSign?.data?.message) {
        console.error("No message to sign", messageToSign);
        setError("No message to sign received from server");
        return;
      }

      const signature = await signMessageAsync({
        message: messageToSign.data.message,
      });

      const { error: postMoneriumProfileError } = await postApiV1IntegrationsMonerium({
        body: {
          signature,
        },
      });

      if (postMoneriumProfileError) {
        console.error("Error posting monerium profile", postMoneriumProfileError);
        const message = (postMoneriumProfileError as { data?: { responseData?: { message?: string } } }).data
          ?.responseData?.message;
        setError(message ?? "Failed to create Monerium integration");
        return;
      }

      setSuccess(true);
      refreshUser();
      onSuccess?.();
    } catch (error) {
      console.error("Error posting monerium profile", error);
      setError(extractErrorMessage(error, "Failed to complete IBAN integration"));
    } finally {
      setIsProcessing(false);
    }
  }, [signMessageAsync, refreshUser, onSuccess]);

  if (success && user?.bankingDetails?.moneriumIban && user?.bankingDetails?.moneriumBic) {
    // Success State
    return (
      <div className="space-y-6 text-center">
        <div className="flex justify-center">
          <CheckCircle2 className="w-16 h-16 text-success" />
        </div>

        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-foreground">IBAN Created Successfully!</h3>
          <p className="text-sm text-muted-foreground">
            Your IBAN has been created and is ready to use for receiving bank transfers.
          </p>
        </div>

        {/* IBAN and BIC Information */}
        <div className="space-y-4">
          <div className="rounded-lg bg-muted p-4 space-y-3">
            <div className="space-y-2">
              <div className="text-left">
                <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">IBAN</div>
                <p className="text-sm font-mono text-foreground mt-1 break-all">{user?.bankingDetails?.moneriumIban}</p>
              </div>
              <div className="text-left">
                <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">BIC</div>
                <p className="text-sm font-mono text-foreground mt-1">{user?.bankingDetails?.moneriumBic}</p>
              </div>
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            You can find this information anytime in <strong>Account → Account Details</strong>
          </p>
        </div>
      </div>
    );
  }

  // Initial State
  return (
    <div className="space-y-4">
      {/* Information Section */}
      <div className="space-y-3">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-info mt-0.5 shrink-0" />
          <div className="space-y-2 text-sm">
            <p className="font-medium text-foreground">What happens next:</p>
            <ul className="space-y-1 text-muted-foreground">
              <li>• You'll authorize Monerium to access your KYC information</li>
              <li>• Your IBAN will be tied to your current account ({shortenAddress(address)})</li>
              <li>
                • Send {currency?.fiatSymbol} to your IBAN and receive {currency?.tokenSymbol} to your account
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && <StandardAlert variant="destructive" description={error} />}

      {/* Action Buttons */}
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        {showCancelButton && (
          <Button variant="outline" onClick={onCancel} disabled={isProcessing}>
            Cancel
          </Button>
        )}
        <Button
          onClick={handleIntegrationMoneriumButtonClick}
          disabled={isProcessing}
          loading={isProcessing}
          className="bg-button-bg hover:bg-button-bg-hover text-button-black"
        >
          {isProcessing ? "Creating IBAN..." : "Authorize & Create IBAN"}
        </Button>
      </div>
    </div>
  );
}
