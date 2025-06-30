import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/context/AuthContext";
import { useUser } from "@/context/UserContext";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import SourceOfFundsStep from "@/components/safe-deployment/SourceOfFundsStep";
import PhoneVerificationStep from "@/components/safe-deployment/PhoneVerificationStep";
import DeploySafeStep from "@/components/safe-deployment/DeploySafeStep";

enum ScreenStep {
  AnswerSourceOfFunds = "answer-source-of-funds",
  VerifyPhoneNumber = "verify-phone-number",
  DeploySafe = "deploy-safe",
}
export const SafeDeploymentRoute = () => {
  const [step, setStep] = useState<ScreenStep>(ScreenStep.AnswerSourceOfFunds);
  const { isAuthenticated } = useAuth();
  const { isUserSignedUp, user, safeConfig, refetchUser } = useUser();
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || !safeConfig) return;

    if (user.isSourceOfFundsAnswered === true && step === ScreenStep.AnswerSourceOfFunds) {
      setStep(ScreenStep.VerifyPhoneNumber);
    }

    if (user.isPhoneValidated === true && step === ScreenStep.VerifyPhoneNumber) {
      setStep(ScreenStep.DeploySafe);
    }

    if (safeConfig.isDeployed) {
      // if the safe is already deployed, we can redirect to the home page
      navigate("/");
      return;
    }
  }, [user, safeConfig, step, navigate]);

  // todo make this better
  if (!isAuthenticated || !isUserSignedUp) {
    return <div>Error, not authenticated...</div>;
  }

  return (
    <div className="grid grid-cols-6 gap-4 h-full">
      {error && (
        <div className="col-span-6 lg:col-start-2 lg:col-span-4 mx-4 lg:mx-0">
          <Alert variant="destructive" className="mt-4">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      )}
      {step === ScreenStep.AnswerSourceOfFunds && (
        <SourceOfFundsStep
          onComplete={() => {
            refetchUser();
            setStep(ScreenStep.VerifyPhoneNumber);
          }}
          setError={setError}
        />
      )}
      {step === ScreenStep.VerifyPhoneNumber && (
        <PhoneVerificationStep
          onComplete={() => {
            refetchUser();
            setStep(ScreenStep.DeploySafe);
          }}
          setError={setError}
        />
      )}
      {step === ScreenStep.DeploySafe && <DeploySafeStep setError={setError} />}
    </div>
  );
};
