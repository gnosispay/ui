import { CheckCircle2, LoaderCircle, CircleIcon } from "lucide-react";
import { DeploySteps, stepLabels, stepOrder } from "./deploySteps";
import type React from "react";

type StepListProps = {
  step: DeploySteps;
};

const StepList: React.FC<StepListProps> = ({ step }) => {
  const currentIdx = step ? stepOrder.indexOf(step) : 0;
  return (
    <ol className="mb-4 mt-2 flex flex-col gap-2">
      <li key="phone-verified" className="flex items-center gap-2">
        <CheckCircle2 className="w-5 h-5 text-success" />
        <span className="text-sm">Phone verification</span>
      </li>
      {stepOrder.map((s, idx) => {
        let icon = null;

        if (s === DeploySteps.Done) {
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

export default StepList;
