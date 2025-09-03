import { forwardRef } from "react";
import { twMerge } from "tailwind-merge";

export const Input = forwardRef<HTMLInputElement, TextFieldProps>(
  function TextField({ id, type = "text", className = "", ...props }, ref) {
    return (
      <input
        id={id}
        type={type}
        className={twMerge(inputClassName, className)}
        {...props}
        ref={ref}
      />
    );
  },
);
export const Label = ({
  id,
  required,
  children,
  className,
  ...props
}: LabelProps) => {
  return (
    <label
      htmlFor={id}
      className={twMerge("block text-sm font-medium text-gp-dust", className)}
      {...props}
    >
      {children}
      {required && <span className="text-red-500">*</span>}
    </label>
  );
};
export type LabelProps = {
  id?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
} & React.LabelHTMLAttributes<HTMLLabelElement>;
export type TextFieldProps = {
  id?: string;
  label?: string;
  type?: string;
  className?: string;
} & React.InputHTMLAttributes<HTMLInputElement>;

export const inputClassName = twMerge(
  "block w-full appearance-none rounded-md px-3 py-2 text-gray-700 placeholder-gray-400 border border-gray-200",
  "focus:ring-green-brand/50 focus:outline-0 focus:border-gray-200 focus:ring-2 sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed",
);
