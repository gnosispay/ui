import { Skeleton } from "../ui/skeleton";
import CardFront from "./card-front";

export const CardSkeleton = () => {
  return (
    <div className="rounded-xl overflow-hidden w-xs bg-black relative lg:mx-0 mx-auto">
      <CardFront />
      <div className="absolute left-4 bottom-4 flex flex-col items-start z-10">
        <div className="mb-1">
          <Skeleton className="h-4 w-20 rounded-lg bg-gray-600" />
        </div>
        <div className="flex items-center">
          <span className="mr-2 text-white text-lg font-semibold">•••</span>
          <Skeleton className="h-6 w-22 rounded-lg bg-gray-600" />
        </div>
      </div>
    </div>
  );
};
