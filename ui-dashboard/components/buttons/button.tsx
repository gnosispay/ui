// stop using this use ButtonV2 instead
import { twMerge } from "tailwind-merge";
import Spinner from "../spinner";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
  loading?: boolean;
}

const Button = (props: ButtonProps) => {
  const { children, className, loading, ...rest } = props;
  return (
    <button
      className={twMerge(
        "px-4 py-2 bg-gp-text-hc text-white flex rounded-lg items-center justify-center gap-2 focus:outline-none focus:border-transparent cursor-pointer disabled:cursor-default disabled:opacity-60 disabled:pointer-events-none",
        className,
      )}
      {...rest}
    >
      {loading && <Spinner monochromatic className="w-3 h-3" />}
      {children}
    </button>
  );
};

export default Button;
