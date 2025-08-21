import { Skeleton } from "@/components/ui/skeleton";

export const AddressCheckSkeleton = () => {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <Skeleton className="h-8 w-64 mx-auto mb-2" />
        <Skeleton className="h-5 w-80 mx-auto" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Order Details Skeleton */}
        <div className="space-y-6">
          {/* Order Details Card Skeleton */}
          <div className="bg-card rounded-xl p-6">
            <Skeleton className="h-6 w-32 mb-4" />
            <div className="space-y-3">
              <div>
                <Skeleton className="h-4 w-24 mb-1" />
                <Skeleton className="h-5 w-48" />
              </div>
            </div>
          </div>

          {/* Shipping Address Card Skeleton */}
          <div className="bg-card rounded-xl p-6">
            <Skeleton className="h-6 w-36 mb-4" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </div>
        </div>

        {/* Right Column - Summary Skeleton */}
        <div className="space-y-6">
          {/* Summary Card Skeleton */}
          <div className="bg-card rounded-xl p-6">
            <Skeleton className="h-6 w-20 mb-4" />
            <div className="space-y-3">
              <div className="flex justify-between">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-16" />
              </div>
              <div className="text-right">
                <Skeleton className="h-3 w-12 ml-auto" />
              </div>
            </div>
          </div>

          {/* Total Card Skeleton */}
          <div className="bg-card rounded-xl p-6">
            <div className="flex justify-between">
              <Skeleton className="h-6 w-12" />
              <div className="text-right space-y-1">
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-4 w-16" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons Skeleton */}
      <div className="flex justify-end gap-3 mt-6">
        <Skeleton className="h-10 w-28" />
        <Skeleton className="h-10 w-44" />
      </div>
    </div>
  );
};
