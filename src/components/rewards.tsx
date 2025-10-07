import { useCallback, useMemo, useState } from "react";
import { getApiV1Rewards } from "@/client";
import { Skeleton } from "./ui/skeleton";
import { OgnftBadge } from "./ui/ognft-badge";
import { StandardAlert } from "./ui/standard-alert";
import { extractErrorMessage } from "@/utils/errorHelpers";
import { Wallet } from "lucide-react";

interface RewardsData {
  isOg: boolean;
  gnoBalance: number;
  cashbackRate: number;
}

export const Rewards = () => {
  const [rewardsData, setRewardsData] = useState<RewardsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRewards = useCallback(() => {
    setIsLoading(true);
    setError(null);

    getApiV1Rewards()
      .then((response) => {
        if (response.data) {
          setRewardsData(response.data);
        }
      })
      .catch((err) => {
        setError(extractErrorMessage(err, "Error fetching rewards"));
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  // Fetch rewards data on component mount
  useMemo(() => {
    fetchRewards();
  }, [fetchRewards]);

  const totalCashbackRate = useMemo(() => {
    if (!rewardsData) return 0;
    return rewardsData.cashbackRate + (rewardsData.isOg ? 1 : 0);
  }, [rewardsData]);

  const totalCashbackRateFormatted = useMemo(() => {
    return totalCashbackRate.toFixed(2);
  }, [totalCashbackRate]);

  const formattedGnoBalance = useMemo(() => {
    if (!rewardsData) return "0";
    // Floor to 2 decimal places: 0.616 becomes 0.61
    const flooredValue = Math.floor(rewardsData.gnoBalance * 100) / 100;
    return flooredValue.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }, [rewardsData]);

  if (error) {
    return (
      <div className="bg-card p-4 rounded-lg">
        <StandardAlert variant="destructive" description={error} />
      </div>
    );
  }

  return (
    <div className="bg-card p-4 rounded-lg">
      {isLoading ? (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Skeleton className="w-6 h-6" />
            <Skeleton className="w-20 h-4" />
            <Skeleton className="w-8 h-5 rounded-full" />
            <div className="flex-1" />
            <Skeleton className="w-12 h-4" />
          </div>
          <div className="flex justify-between items-center">
            <Skeleton className="w-24 h-4" />
            <Skeleton className="w-16 h-4" />
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-foreground" />
            <span className="text-sm font-medium text-foreground">Cashback</span>
            {rewardsData?.isOg && <OgnftBadge />}
            <div className="flex-1" />
            <span className="text-sm font-medium text-foreground">{totalCashbackRateFormatted}%</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">GNO balance</span>
            <span className="text-sm font-medium text-foreground">{formattedGnoBalance} GNO</span>
          </div>
        </div>
      )}
    </div>
  );
};
