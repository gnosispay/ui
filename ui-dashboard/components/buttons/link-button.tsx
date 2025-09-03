// looks like a button but is a link
import Link from "next/link";
import { twMerge } from "tailwind-merge";

const LinkButton = (props: React.ComponentProps<typeof Link>) => {
  const { children, className, ...rest } = props;
  return (
    <Link
      className={twMerge(
        "px-4 py-2 bg-gp-text-hc text-white flex rounded-xl items-center justify-center gap-2 focus:outline-none focus:border-transparent cursor-pointer disabled:cursor-default disabled:pointer-events-none",
        className,
      )}
      {...rest}
    >
      {children}
    </Link>
  );
};

export default LinkButton;
