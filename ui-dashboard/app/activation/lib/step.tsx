import { twMerge } from "tailwind-merge";

// replace with icon later on
const Check = () => <div>Check</div>;

type StepProps = {
  number: number;
  name: string;
  description: string;
  currentStepNumber: number;
};

export const Step = ({
  currentStepNumber,
  number,
  name,
  description,
}: StepProps) => (
  <li
    className={twMerge(
      "relative flex max-w-[400px] flex-1 flex-col justify-center rounded-3xl border-2 border-green-brand px-3 py-4 sm:px-6",
      currentStepNumber !== number && "hidden opacity-40 lg:block",
    )}
  >
    <div className="flex flex-col items-center">
      <span className="flex items-center text-sm">
        <span className="flex h-[50px] w-[50px] flex-shrink-0 items-center justify-center rounded-full">
          {number < currentStepNumber ? (
            <span className="flex h-full w-full flex-shrink-0 items-center justify-center rounded-full bg-green-brand">
              <Check />
            </span>
          ) : (
            <span className="flex h-full w-full flex-shrink-0 items-center justify-center rounded-full bg-green-brand">
              <span className="text-xl font-medium text-gp-green">
                {number}
              </span>
            </span>
          )}
        </span>
        <span className="ml-4 mt-0.5 flex min-w-0 flex-col gap-1">
          <span className="text-xl font-medium text-black">{name}</span>
          <span className="text-lg text-black-500">{description}</span>
        </span>
      </span>
    </div>
  </li>
);
