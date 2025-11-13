import { twMerge } from "tailwind-merge";

type SpinnerProps = {
  className?: string;
  monochromatic?: boolean;
};

const Spinner = ({ className, monochromatic = false }: SpinnerProps) => {
  const gradient = monochromatic
    ? "bg-[conic-gradient(black,white)]"
    : "bg-[conic-gradient(#FCF9F2,#7A9822)]";
  return (
    <div
      role="status"
      className={twMerge(
        "rounded-full w-6 aspect-square bg-[${gradient}] animate-spin",
        gradient,
        className,
      )}
    ></div>
  );
};

export default Spinner;
