import { deleteApiV1SafeReset } from "@/client";
import { StandardAlert } from "@/components/ui/standard-alert";
import { Button } from "@/components/ui/button";
import { extractErrorMessage } from "@/utils/errorHelpers";
import { useCallback, useState } from "react";
import { CheckCircle2, AlertTriangle } from "lucide-react";
import { useUser } from "@/context/UserContext";
import { useNavigate } from "react-router-dom";

enum ResetStep {
  Init = "init",
  Success = "success",
}

export const ResetRoute = () => {
  const [step, setStep] = useState<ResetStep>(ResetStep.Init);
  const [error, setError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const { refreshUser } = useUser();
  const navigate = useNavigate();

  const handleReset = useCallback(() => {
    setError("");
    setIsProcessing(true);

    deleteApiV1SafeReset()
      .then(({ error: resetError }) => {
        if (resetError) {
          setError(extractErrorMessage(resetError, "Failed to reset Safe account"));
          setIsProcessing(false);
          return;
        }

        setStep(ResetStep.Success);
        setIsProcessing(false);
        refreshUser();
      })
      .catch((err) => {
        setError(extractErrorMessage(err, "Failed to reset Safe account"));
        setIsProcessing(false);
      });
  }, [refreshUser]);

  return (
    <div className="grid grid-cols-6 gap-4 h-full" data-testid="reset-page">
      {error && (
        <div className="col-span-6 lg:col-start-2 lg:col-span-4 mx-4 lg:mx-0">
          <StandardAlert
            variant="destructive"
            title="Error"
            description={error}
            className="mt-4"
            data-testid="reset-error-alert"
          />
        </div>
      )}
      {step === ResetStep.Init && (
        <div className="col-span-6 lg:col-start-2 lg:col-span-4 mx-4 lg:mx-0" data-testid="reset-warning-step">
          <div className="space-y-6 mt-4">
            <div className="flex justify-center">
              <AlertTriangle className="w-16 h-16 text-warning" data-testid="reset-warning-icon" />
            </div>
            <div className="space-y-4 text-center">
              <h2 className="text-lg font-semibold text-foreground">Reset Safe Account</h2>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  This action will permanently delete your Safe account. This operation is <strong>irreversible</strong>
                  .
                </p>
                <p className="text-sm text-muted-foreground">
                  Please make sure you are certain about this action before proceeding.
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                variant="destructive"
                onClick={handleReset}
                loading={isProcessing}
                disabled={isProcessing || !!error}
                data-testid="reset-confirm-button"
              >
                Reset Safe Account
              </Button>
            </div>
          </div>
        </div>
      )}
      {step === ResetStep.Success && (
        <div className="col-span-6 lg:col-start-2 lg:col-span-4 mx-4 lg:mx-0" data-testid="reset-success-step">
          <div className="flex flex-col items-center justify-center h-full space-y-4 mt-4">
            <CheckCircle2 className="w-16 h-16 text-success" data-testid="reset-success-icon" />
            <div className="space-y-2 text-center">
              <h3 className="text-lg font-semibold text-foreground">Safe Account Reset Successfully</h3>
              <p className="text-sm text-muted-foreground" data-testid="reset-success-message">
                Your Safe account has been permanently deleted. You can now create a new Safe account if needed.
              </p>
              <Button onClick={() => navigate("/")}>Go to Home</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
