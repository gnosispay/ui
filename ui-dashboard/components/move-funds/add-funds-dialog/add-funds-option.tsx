import { CaretRight } from "@phosphor-icons/react";
import { twMerge } from "tailwind-merge";
import type React from "react";

interface AddFundsOptionProps {
  title: string;
  description: string;
  onClick?: () => void;
  icon: JSX.Element;
  disabled?: boolean;
}

export const AddFundsOption = ({
  title,
  description,
  onClick,
  icon,
  disabled = false,
}: AddFundsOptionProps) => (
  <div
    className={twMerge(
      "flex flex-row gap-3 bg-white rounded-xl border-low-contrast border items-center px-4 py-2",
      disabled ? "cursor-not-allowed opacity-50" : "hover:cursor-pointer",
    )}
    onClick={() => onClick && onClick()}
  >
    <div>{icon}</div>

    <div className="text-left flex-grow">
      <h3 className="font-medium">{title}</h3>
      <p className="text-sm text-gp-text-lc">{description}</p>
    </div>

    <CaretRight className="text-2xl ml-auto text-secondary" />
  </div>
);
