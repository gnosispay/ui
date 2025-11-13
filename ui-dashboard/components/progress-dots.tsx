import { classNames } from "../lib/utils";

interface Step {
  title: string;
  description: string;
}

interface ProgressDotsProps {
  steps: Step[];
  stepReached: number;
}

export const ProgressDots = ({ steps, stepReached }: ProgressDotsProps) => {
  return (
    <div className="flex flex-col justify-center">
      {steps.map((step, index) => (
        <div
          key={step.title}
          className={classNames(
            "flex space-x-4 border-l",
            steps.length - 1 === index ? "pb-0" : "pb-6",
            stepReached <= index ? "border-low-contrast" : "border-green-500",
          )}
        >
          <div className="-ml-1 relative">
            {/* cover last left border from bottom */}
            {index === steps.length - 1 && (
              <div className="bg-white h-8 w-2 absolute bottom-0 left-0"></div>
            )}
            <div
              className={classNames(
                "w-2 h-2 rounded-full",
                index <= stepReached ? "bg-green-500" : "bg-tertiary",
              )}
            ></div>
          </div>
          <div className="space-y-1 -mt-2">
            <p className="text-base">{step.title}</p>
            <p className="text-sm text-gray-500">{step.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
};
