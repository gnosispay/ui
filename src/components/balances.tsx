import { useUser } from "@/context/UserContext";
import { useMemo } from "react";
import { CircleMinus, Clock } from "lucide-react";
import { Skeleton } from "./ui/skeleton";
import { currencies } from "../constants";
import { formatCurrency } from "@/utils/formatCurrency";
import { useUnspendableAmount } from "@/hooks/useUnspendableAmount";

export const Balances = () => {
  const { balances, safeConfig } = useUser();
  const { unspendableFormatted, shouldShowAlert } = useUnspendableAmount();
  const currencyInfo = useMemo(() => {
    if (!safeConfig?.fiatSymbol) {
      return;
    }

    return currencies[safeConfig.fiatSymbol];
  }, [safeConfig?.fiatSymbol]);

  const formattedBalance = useMemo(
    () => formatCurrency(balances?.total, currencyInfo),
    [balances?.total, currencyInfo],
  );

  const formattedPending = useMemo(
    () => formatCurrency(balances?.pending, currencyInfo),
    [balances?.pending, currencyInfo],
  );

  return (
    <div className="flex flex-col gap-2 mb-4 mx-4 lg:mx-0">
      <h1 className="font-bold text-secondary text-lg">Balance</h1>
      {formattedBalance ? (
        <div className="text-4xl text-primary font-bold">
          {formattedBalance.split(".")[0]}
          <span className="text-secondary">
            {formattedBalance.split(".")[1] ? `.${formattedBalance.split(".")[1]}` : ""}
          </span>
        </div>
      ) : (
        <Skeleton className="h-10 w-32 rounded-lg" />
      )}
      {balances?.pending && balances.pending !== "0" && (
        <div className="text-secondary flex items-center gap-1">
          <Clock className="w-4 h-4" aria-hidden="true" />
          {formattedPending} pending
        </div>
      )}
      {shouldShowAlert && (
        <div className="text-secondary flex items-center gap-1">
          <CircleMinus className="w-4 h-4" aria-hidden="true" />
          {unspendableFormatted} not spendable
        </div>
      )}
    </div>
  );
};
