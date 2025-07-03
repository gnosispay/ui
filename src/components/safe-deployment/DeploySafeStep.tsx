import {
  postApiV1Account,
  postApiV1SafeSetCurrency,
  getApiV1AccountSignaturePayload,
  patchApiV1AccountDeploySafeModules,
} from "@/client";
import { useEffect, useState } from "react";
import { useSignTypedData } from "wagmi";
import { useUser } from "@/context/UserContext";
import { extractErrorMessage } from "@/utils/errorHelpers";
import { Button } from "../ui/button";
import { useNavigate } from "react-router";
import StepList from "./StepList";
import { DeploySteps } from "./deploySteps";

interface DeploySafeStepProps {
  setError: (err: string) => void;
}
interface PayloadSate {
  domain: Record<string, unknown>;
  types: Record<string, unknown>;
  primaryType: string;
  message: Record<string, unknown>;
}

const DeploySafeStep = ({ setError }: DeploySafeStepProps) => {
  const { user, refreshUser: refetchUser, safeConfig, refreshSafeConfig } = useUser();
  const [step, setStep] = useState<DeploySteps>(DeploySteps.SafeCreation);
  const [signatureState, setSignatureState] = useState<string | null>(null);
  const [payloadState, setPayloadState] = useState<PayloadSate | null>(null);

  const { signTypedDataAsync } = useSignTypedData();
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;
    async function runStepMachine() {
      try {
        if (!user) return;

        // Step 1: Safe Creation
        if (step === DeploySteps.SafeCreation) {
          if (user.safeWallets && user.safeWallets.length > 0) {
            setStep(DeploySteps.SetCurrency);
            return;
          }
          const safeRes = await postApiV1Account({ body: { chainId: "100" } });
          if (!safeRes.data) throw new Error(extractErrorMessage(safeRes as unknown, "Failed to create Safe account"));
          refetchUser();
          setStep(DeploySteps.SetCurrency);
          return;
        }

        // Step 2: Set Currency
        if (step === DeploySteps.SetCurrency) {
          if (safeConfig?.fiatSymbol || safeConfig?.tokenSymbol) {
            setStep(DeploySteps.GetSignaturePayload);
            return;
          }
          const currencyRes = await postApiV1SafeSetCurrency({});
          if (!currencyRes.data)
            throw new Error(extractErrorMessage(currencyRes as unknown, "Failed to set Safe currency"));
          refreshSafeConfig();
          setStep(DeploySteps.GetSignaturePayload);
          return;
        }

        // Step 3: Get Signature Payload
        if (step === DeploySteps.GetSignaturePayload) {
          if (safeConfig?.accountStatus === 0) {
            setStep(DeploySteps.Done);
            return;
          }
          const sigRes = await getApiV1AccountSignaturePayload({});
          const { domain, types, primaryType, message } = sigRes.data || {};
          if (!domain || !types || !primaryType || !message) {
            throw new Error(extractErrorMessage(sigRes as unknown, "Invalid signature payload"));
          }
          setPayloadState({ domain, types, primaryType, message });
          setStep(DeploySteps.Signing);
          return;
        }

        // Step 4: Signing
        if (step === DeploySteps.Signing && payloadState) {
          if (safeConfig?.accountStatus === 0) {
            setStep(DeploySteps.Done);
            return;
          }
          const signature = await signTypedDataAsync({
            domain: payloadState.domain,
            types: payloadState.types,
            primaryType: payloadState.primaryType,
            message: payloadState.message,
          });
          setSignatureState(signature);
          setStep(DeploySteps.DeployModules);
          return;
        }

        // Step 5: Deploy Modules
        if (step === DeploySteps.DeployModules && signatureState) {
          if (safeConfig?.accountStatus === 0) {
            setStep(DeploySteps.Done);
            return;
          }
          const deployRes = await patchApiV1AccountDeploySafeModules({ body: { signature: signatureState } });
          if (!deployRes.data)
            throw new Error(extractErrorMessage(deployRes as unknown, "Failed to deploy Safe modules"));
          refreshSafeConfig();
          setStep(DeploySteps.Done);
          return;
        }
      } catch (e) {
        if (!cancelled) setError(extractErrorMessage(e, "An error occurred"));
      }
    }
    runStepMachine();
    return () => {
      cancelled = true;
    };
  }, [
    step,
    user,
    safeConfig,
    payloadState,
    signatureState,
    setError,
    refetchUser,
    refreshSafeConfig,
    signTypedDataAsync,
  ]);

  return (
    <div className="col-span-6 lg:col-start-2 lg:col-span-4 mx-4 lg:mx-0">
      <h2 className="text-lg font-semibold mb-4 mt-4">Configuring your account</h2>
      <div className="flex flex-col justify-center h-full">
        <StepList step={step} />
      </div>
      {step === DeploySteps.Done && (
        <Button className="mt-4" onClick={() => navigate("/")}>
          Visit Home
        </Button>
      )}
    </div>
  );
};

export default DeploySafeStep;
