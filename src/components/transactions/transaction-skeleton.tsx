import { Skeleton } from "../ui/skeleton";

export const TransactionSkeleton = () => (
  <div className="flex flex-col gap-4 bg-card p-4 rounded-lg">
    {[1, 2].map((numb) => (
      <div key={`loader-date-${numb}`} className="text-xs text-secondary mb-2">
        <Skeleton className="h-4 w-20 rounded-lg" />
        {[1, 2, 3].map((numb) => (
          <div key={`loader-card-${numb}`} className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-icon-card-bg flex items-center justify-center">
                <Skeleton className="w-6 h-6 rounded-full" />
              </div>
              <div>
                <div className="text-xl text-primary">
                  <Skeleton className="h-6 w-32 rounded-lg mb-2" />
                </div>
                <div className="text-xs text-secondary">
                  <Skeleton className="h-4 w-16 rounded-lg" />
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xl text-primary">
                <Skeleton className="h-6 w-22 rounded-lg" />
              </div>
            </div>
          </div>
        ))}
      </div>
    ))}
  </div>
);
