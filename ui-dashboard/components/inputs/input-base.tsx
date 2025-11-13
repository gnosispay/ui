import React, { forwardRef } from "react";
import { twMerge } from "tailwind-merge";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
  [key: string]: any;
}

const Input = forwardRef(function Input(
  props: InputProps,
  ref: React.Ref<HTMLInputElement>,
) {
  const { className, ...rest } = props;
  return (
    <input
      className={twMerge(
        "py-2 px-4 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-1 focus:ring-stone-400 focus:border-transparent disabled:bg-neutral-100",
        className,
      )}
      {...rest}
      ref={ref}
    />
  );
});

export default Input;
