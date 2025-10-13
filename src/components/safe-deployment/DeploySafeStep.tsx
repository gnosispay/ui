import { getApiV1SafeDeploy, postApiV1SafeDeploy } from "@/client";
import { useEffect, useState, useCallback, useRef } from "react";
import { extractErrorMessage } from "@/utils/errorHelpers";
import { Button } from "../ui/button";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, LoaderCircle } from "lucide-react";
import { useUser } from "@/context/UserContext";

enum DeploymentStep {
  Initializing = "initializing",
  Deploying = "deploying",
  Done = "done",
}

interface DeploySafeStepProps {
  setError: (err: string) => void;
}

const DeploySafeStep = ({ setError }: DeploySafeStepProps) => {
  const [step, setStep] = useState<DeploymentStep>(DeploymentStep.Initializing);
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const { refreshUser } = useUser();

  const stopPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  }, []);

  const checkDeploymentStatus = useCallback(() => {
    getApiV1SafeDeploy()
      .then(({ data, error }) => {
        if (error) {
          setError(extractErrorMessage(error, "An error occurred"));
          return;
        }

        if (data.status === "failed") {
          setError("An error occurred while deploying your Safe");
          setIsProcessing(false);
          stopPolling();
          return;
        }

        if (data.status === "ok") {
          setStep(DeploymentStep.Done);
          setIsProcessing(false);
          stopPolling();
          refreshUser();
          return;
        }

        if (data.status === "processing") {
          setIsProcessing(true);
          setStep(DeploymentStep.Deploying);
        }

        if (data.status === "not_deployed") {
          setStep(DeploymentStep.Deploying);
        }
      })
      .catch((err) => {
        setError(extractErrorMessage(err, "An error occurred"));
        setIsProcessing(false);
        stopPolling();
      });
  }, [setError, stopPolling, refreshUser]);

  const startPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }

    pollingIntervalRef.current = setInterval(checkDeploymentStatus, 5000); // Poll every 5 seconds
  }, [checkDeploymentStatus]);

  // Initial status check
  useEffect(() => {
    if (step === DeploymentStep.Initializing) {
      checkDeploymentStatus();
    }
  }, [step, checkDeploymentStatus]);

  // Handle safe deployment when in deploying step and not processing
  useEffect(() => {
    if (step === DeploymentStep.Deploying && !isProcessing) {
      setIsProcessing(true);
      postApiV1SafeDeploy()
        .then(({ error }) => {
          if (error) {
            setError(extractErrorMessage(error, "An error occurred"));
            return;
          }
        })
        .catch((err) => {
          setError(extractErrorMessage(err, "An error occurred"));
        });
    }
  }, [step, isProcessing, setError]);

  // Poll when processing
  useEffect(() => {
    if (isProcessing) {
      startPolling();
    } else {
      stopPolling();
    }
  }, [isProcessing, startPolling, stopPolling]);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      stopPolling();
    };
  }, [stopPolling]);

  return (
    <div className="col-span-6 lg:col-start-2 lg:col-span-4 mx-4 lg:mx-0">
      <h2 className="text-lg font-semibold mb-4 mt-4">Configuring your Safe</h2>
      <div className="flex flex-col items-center justify-center h-full space-y-4">
        {step === DeploymentStep.Done && (
          <>
            <CheckCircle2 className="w-16 h-16 text-success" />
            <p className="text-center text-muted-foreground">Your Safe account has been successfully created!</p>
            <Button className="mt-4" onClick={() => navigate("/")}>
              Visit Home
            </Button>
          </>
        )}
        {step !== DeploymentStep.Done && (
          <>
            <LoaderCircle className="w-16 h-16 animate-spin text-primary" />
            <p className="text-center text-muted-foreground">
              {step === DeploymentStep.Initializing
                ? "Initializing your account..."
                : "Creating your Safe account (this may take a few minutes)..."}
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default DeploySafeStep;
