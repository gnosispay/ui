import React, { forwardRef } from "react";
import { twMerge } from "tailwind-merge";

interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  className?: string;
  [key: string]: any;
}

const Textarea = forwardRef(function Input(
  props: TextareaProps,
  ref: React.Ref<HTMLTextAreaElement>,
) {
  const { className, ...rest } = props;
  return (
    <textarea
      className={twMerge(
        "py-2 px-4 disabled:bg-neutral-100 border border-gray-300 min-h-[100px] rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-gp-primary focus:border-transparent",
        className,
      )}
      {...rest}
      ref={ref}
    />
  );
});

export default Textarea;
