import { twMerge } from "tailwind-merge";

const Divider = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div className="relative flex py-4 items-center">
    <div
      className={twMerge("flex-grow border-t border-stone-300", className)}
    ></div>
    <span className={twMerge("flex-shrink mx-4 text-stone-700", className)}>
      {children}
    </span>
    <div
      className={twMerge("flex-grow border-t border-stone-300", className)}
    ></div>
  </div>
);

export default Divider;
