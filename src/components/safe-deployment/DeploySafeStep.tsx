import {
  postApiV1Account,
  postApiV1SafeSetCurrency,
  getApiV1AccountSignaturePayload,
  patchApiV1AccountDeploySafeModules,
} from "@/client";
import { CheckCircle2, LoaderCircle, CircleIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useSignTypedData } from "wagmi";
import { useUser } from "@/context/UserContext";
import { extractErrorMessage } from "@/utils/errorHelpers";
import { Button } from "../ui/button";
import { useNavigate } from "react-router";

export type DeploySafeStepProps = {
  setError: (err: string) => void;
};

export enum DeploySteps {
  SafeCreation = "safe-creation",
  SetCurrency = "set-currency",
  GetSignaturePayload = "get-signature-payload",
  Signing = "signing",
  DeployModules = "deploy-modules",
  DONE = "done",
}

const stepOrder = [
  DeploySteps.SafeCreation,
  DeploySteps.SetCurrency,
  DeploySteps.GetSignaturePayload,
  DeploySteps.Signing,
  DeploySteps.DeployModules,
  DeploySteps.DONE,
];

const stepLabels: Record<DeploySteps, string> = {
  [DeploySteps.SafeCreation]: "Create Safe account",
  [DeploySteps.SetCurrency]: "Set Safe currency",
  [DeploySteps.GetSignaturePayload]: "Prepare signature data",
  [DeploySteps.Signing]: "Sign setup message",
  [DeploySteps.DeployModules]: "Deploy Safe modules",
  [DeploySteps.DONE]: "Done",
};

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
    if (!user) return;
    if (step !== DeploySteps.SafeCreation) return;

    const nextStep = DeploySteps.SetCurrency;
    if (user.safeWallets && user.safeWallets.length > 0) {
      setStep(nextStep);
      return;
    }

    let cancelled = false;
    postApiV1Account({ body: { chainId: "100" } })
      .then((safeRes) => {
        if (cancelled) return;
        if (!safeRes.data) {
          const errMsg = extractErrorMessage(safeRes as unknown, "Failed to create Safe account");
          console.error("Api response", safeRes);
          throw new Error(errMsg);
        }
        refetchUser();
        setStep(nextStep);
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        const errMsg = extractErrorMessage(e, "Failed to create Safe account");
        setError(errMsg);
      });
    return () => {
      cancelled = true;
    };
  }, [step, setError, refetchUser, user]);

  useEffect(() => {
    if (step !== DeploySteps.SetCurrency) return;

    const nextStep = DeploySteps.GetSignaturePayload;

    if (safeConfig?.fiatSymbol || safeConfig?.tokenSymbol) {
      setStep(nextStep);
      return;
    }

    let cancelled = false;
    postApiV1SafeSetCurrency({})
      .then((currencyRes) => {
        if (cancelled) return;
        if (!currencyRes.data) {
          const errMsg = extractErrorMessage(currencyRes as unknown, "Failed to set Safe currency");
          throw new Error(errMsg);
        }
        refreshSafeConfig();
        setStep(nextStep);
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        const errMsg = extractErrorMessage(e, "Failed to set Safe currency");
        setError(errMsg);
      });
    return () => {
      cancelled = true;
    };
  }, [step, setError, safeConfig, refreshSafeConfig]);

  useEffect(() => {
    if (step !== DeploySteps.GetSignaturePayload) return;
    if (safeConfig?.accountStatus === 0) setStep(DeploySteps.DONE);

    let cancelled = false;
    getApiV1AccountSignaturePayload({})
      .then((sigRes) => {
        if (cancelled) return;
        if (
          !sigRes.data ||
          !sigRes.data.domain ||
          !sigRes.data.types ||
          !sigRes.data.primaryType ||
          !sigRes.data.message
        ) {
          const errMsg = extractErrorMessage(sigRes as unknown, "Invalid signature payload");
          throw new Error(errMsg);
        }
        const payload = {
          domain: sigRes.data.domain,
          types: sigRes.data.types,
          primaryType: sigRes.data.primaryType,
          message: sigRes.data.message,
        };
        setPayloadState(payload);
        setStep(DeploySteps.Signing);
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        const errMsg = extractErrorMessage(e, "Failed to get signature payload");
        setError(errMsg);
      });
    return () => {
      cancelled = true;
    };
  }, [step, setError, safeConfig]);

  useEffect(() => {
    if (step !== DeploySteps.Signing || !payloadState) return;

    if (safeConfig?.accountStatus === 0) setStep(DeploySteps.DONE);

    let cancelled = false;
    signTypedDataAsync({
      domain: payloadState.domain,
      types: payloadState.types,
      primaryType: payloadState.primaryType,
      message: payloadState.message,
    })
      .then((signature) => {
        if (cancelled) return;
        setSignatureState(signature);
        setStep(DeploySteps.DeployModules);
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        const errMsg = extractErrorMessage(e, "Signature rejected or failed");
        setError(errMsg);
      });
    return () => {
      cancelled = true;
    };
  }, [step, payloadState, setError, signTypedDataAsync, safeConfig]);

  useEffect(() => {
    if (step !== DeploySteps.DeployModules || !signatureState) return;
    if (safeConfig?.accountStatus === 0) setStep(DeploySteps.DONE);

    let cancelled = false;
    patchApiV1AccountDeploySafeModules({ body: { signature: signatureState } })
      .then((deployRes) => {
        if (cancelled) return;
        if (!deployRes.data) {
          const errMsg = extractErrorMessage(deployRes as unknown, "Failed to deploy Safe modules");
          throw new Error(errMsg);
        }
        refreshSafeConfig();
        setStep(DeploySteps.DONE);
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        const errMsg = extractErrorMessage(e, "Failed to deploy Safe modules");
        setError(errMsg);
      });
    return () => {
      cancelled = true;
    };
  }, [step, signatureState, setError, refreshSafeConfig, safeConfig]);

  const renderStepList = () => {
    // Find the index of the current step
    const currentIdx = step ? stepOrder.indexOf(step) : 0;
    return (
      <ol className="mb-4 mt-2 flex flex-col gap-2">
        <li key="phone-verified" className="flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-success" />
          <span className="text-sm">Phone verification</span>
        </li>
        {stepOrder.map((s, idx) => {
          let icon = null;

          if (s === DeploySteps.DONE) {
            return null;
          }

          if (idx < currentIdx) {
            icon = <CheckCircle2 className="w-5 h-5 text-success" />;
          } else if (idx === currentIdx) {
            icon = <LoaderCircle className="w-5 h-5 animate-spin text-primary" />;
          } else {
            icon = <CircleIcon className="w-5 h-5 text-muted-foreground" />;
          }
          return (
            <li key={s} className="flex items-center gap-2">
              {icon}
              <span className="text-sm">{stepLabels[s]}</span>
            </li>
          );
        })}
      </ol>
    );
  };

  return (
    <div className="col-span-6 lg:col-start-2 lg:col-span-4 mx-4 lg:mx-0">
      <h2 className="text-lg font-semibold mb-4 mt-4">Configuring your account</h2>
      <div className="flex flex-col justify-center h-full">{renderStepList()}</div>
      {step === DeploySteps.DONE && (
        <Button className="mt-4" onClick={() => navigate("/")}>
          Visit Home
        </Button>
      )}
    </div>
  );
};

export default DeploySafeStep;
