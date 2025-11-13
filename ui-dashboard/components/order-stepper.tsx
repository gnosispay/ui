import { Check } from "@phosphor-icons/react/dist/ssr";
import FillableBar from "@/app/dashboard/(balances)/fillable-bar";
import { classNames } from "../lib/utils";

export interface Step {
  title: string;
  description?: string;
  icon: JSX.Element;
  urlPrefix: string;
}

interface OrderStepperProps {
  steps: Step[];
  stepReached: number;
  showStepNumber?: boolean;
  isMobile?: boolean;
}

export const OrderStepper = ({
  steps,
  stepReached,
  showStepNumber,
  isMobile,
}: OrderStepperProps) => {
  if (isMobile) {
    return (
      <div className="flex flex-col justify-center items-center gap-3 w-full max-w-[200px]">
        <p className="text-sm text-secondary">
          STEP {stepReached} OF {steps.length}
        </p>
        <FillableBar fillPercent={(stepReached / steps.length) * 100} />
      </div>
    );
  }
  return (
    <div className="flex flex-col justify-center hidden sm:block">
      {steps.map((step, index) => {
        const { title, description, icon } = step;
        return (
          <div key={title} className={classNames("flex space-x-4")}>
            <div>
              <div
                className={classNames(
                  "w-10 h-10 rounded-full text-primary text-2xl flex items-center justify-center",
                  index + 1 <= stepReached ? "bg-green-brand" : "bg-tertiary",
                )}
              >
                {stepReached <= index + 1 ? icon : <Check />}
              </div>
              {steps.length - 1 !== index && (
                <div className="w-1 h-8 bg-tertiary rounded-lg ml-4 my-2"></div>
              )}
            </div>
            <div className="flex flex-col">
              {showStepNumber && (
                <p className="text-xs text-secondary">STEP {index + 1}</p>
              )}
              <p className="text-base text-primary">{title}</p>
              {description && (
                <p className="text-sm text-secondary">{description}</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
