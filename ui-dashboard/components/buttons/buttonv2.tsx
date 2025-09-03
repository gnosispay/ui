// iteration on the original button minus the loading state
// if you're hesitating which button to use, use this one and implement the loading state at the component level
import { twMerge } from "tailwind-merge";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
}

const Button = (props: ButtonProps) => {
  const { children, className, ...rest } = props;
  return (
    <button
      className={twMerge(
        "px-4 py-3 bg-gp-text-hc text-white flex rounded-xl items-center justify-center gap-2 focus:outline-none focus:border-transparent cursor-pointer disabled:cursor-default disabled:pointer-events-none disabled:bg-gray-500",
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
};

export default Button;
