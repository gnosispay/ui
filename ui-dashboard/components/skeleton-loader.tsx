import { twMerge } from "tailwind-merge";
import useHasMounted from "@/hooks/use-has-mounted";

interface SkeletonLoaderProps {
  className?: string;
  children?: React.ReactNode;
  isLoading?: boolean;
}

const SkeletonLoader = ({
  className,
  children,
  isLoading = false,
}: SkeletonLoaderProps) => {
  const hasMounted = useHasMounted();

  if (hasMounted && !isLoading) {return children;}

  return (
    <div
      className={twMerge(
        "animate-pulse bg-stone-200 w-20 h-4 rounded",
        className,
      )}
    />
  );
};

export default SkeletonLoader;
