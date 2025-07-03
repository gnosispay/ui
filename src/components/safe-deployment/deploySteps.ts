export enum DeploySteps {
  SafeCreation = "safe-creation",
  SetCurrency = "set-currency",
  GetSignaturePayload = "get-signature-payload",
  Signing = "signing",
  DeployModules = "deploy-modules",
  Done = "done",
}

export const stepOrder = [
  DeploySteps.SafeCreation,
  DeploySteps.SetCurrency,
  DeploySteps.GetSignaturePayload,
  DeploySteps.Signing,
  DeploySteps.DeployModules,
  DeploySteps.Done,
] as const;

export const stepLabels: Record<DeploySteps, string> = {
  [DeploySteps.SafeCreation]: "Create Safe account",
  [DeploySteps.SetCurrency]: "Set Safe currency",
  [DeploySteps.GetSignaturePayload]: "Prepare signature data",
  [DeploySteps.Signing]: "Sign setup message",
  [DeploySteps.DeployModules]: "Deploy Safe modules",
  [DeploySteps.Done]: "Done",
};
