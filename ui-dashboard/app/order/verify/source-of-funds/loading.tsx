import { twMerge } from "tailwind-merge";

const SkeletonLoader = ({ className }: { className: string }) => {
  return (
    <div
      className={twMerge(
        "animate-pulse bg-stone-200 w-20 h-4 rounded",
        className,
      )}
    />
  );
};

const LoadingShipping = () => {
  return (
    <div className="w-full flex flex-col gap-3">
      <div className="flex flex-col items-center justify-center gap-8 rounded-3xl border-2 border-gp-green-200 bg-white-800 p-4 sm:p-4 lg:justify-start lg:rounded-xl">
        <SkeletonLoader className="h-6 w-3/4" />
        <div className="relative max-w-xl w-full">
          <SkeletonLoader className="h-40 w-full" />
        </div>
        <>
          <SkeletonLoader className="h-12 w-full" />
          <div className="flex w-full flex-col gap-4">
            <SkeletonLoader className="h-12 w-full" />
          </div>
        </>
      </div>
    </div>
  );
};

export default LoadingShipping;
