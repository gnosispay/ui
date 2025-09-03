import { Check } from "@phosphor-icons/react/dist/ssr";
import { twMerge } from "tailwind-merge";
import type { ReactNode } from "react";

export const Stepper = ({ children }: { children: ReactNode }) => {
  return <div className="flex flex-col gap-4 ">{children}</div>;
};
export type StepProps = {
  stepNumber: number;
  title: string;
  status: "complete" | "current" | "incomplete";
  showConnector?: boolean;
};

export const Step = ({
  stepNumber,
  title,
  status,
  showConnector,
}: StepProps) => {
  const showCheck = status === "complete";
  const prefixColor = {
    current: "text-lime-900",
    incomplete: "text-stone-400",
    complete: "text-lime-600",
  };
  const textColor = {
    current: "text-lime-900",
    incomplete: "text-neutral-500",
    complete: "text-lime-600",
  };
  const circleColor = {
    current: "bg-lime-300",
    incomplete: "bg-stone-200",
    complete: "bg-lime-300",
  };
  const connectorColor = {
    current: "bg-lime-300",
    incomplete: "bg-stone-200",
    complete: "bg-lime-300",
  };
  return (
    <div className="flex items-center relative pb-10">
      {showConnector && (
        <div
          className={twMerge(
            "absolute left-3 top-4 -ml-px mt-0.5 h-full w-0.5 ",
            connectorColor[status],
          )}
          aria-hidden="true"
        />
      )}
      <div className="group relative flex items-center">
        <div
          className={twMerge(
            "w-6 h-6 rounded-full justify-center items-center flex",
            circleColor[status],
          )}
        >
          <div
            className={twMerge(
              `text-sm font-semibold font-['SF Pro Rounded'] leading-tight `,
              prefixColor[status],
            )}
          >
            {showCheck ? <Check size={16} /> : stepNumber}
          </div>
        </div>
        <div
          className={twMerge(
            "ml-3 text-lime-900 text-lg font-medium leading-relaxed",
            textColor[status],
          )}
        >
          {title}
        </div>
      </div>
    </div>
  );
};
