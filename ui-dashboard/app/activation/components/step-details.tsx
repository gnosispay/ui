import type { ReactNode } from "react";

// StepIndicator.tsx
interface StepIndicatorProps {
  stepNumber: number;
  children?: ReactNode;
}

const StepIndicator: React.FC<StepIndicatorProps> = ({ stepNumber }) => (
  <div className="w-7 h-7 bg-lime-300 rounded-full flex justify-center items-center">
    <div className="text-lime-900 text-lg font-semibold leading-relaxed">
      {stepNumber}
    </div>
  </div>
);

// StepTitle.tsx
interface StepTitleProps {
  children: ReactNode;
}

const StepTitle: React.FC<StepTitleProps> = ({ children }) => (
  <div className="text-stone-800 text-2xl font-semibold leading-9">
    {children}
  </div>
);

// StepDescription.tsx
interface StepDescriptionProps {
  children: ReactNode;
}

const StepDescription: React.FC<StepDescriptionProps> = ({ children }) => (
  <p className="text-stone-600 text-base w-full">{children}</p>
);

export { StepIndicator, StepTitle, StepDescription };
