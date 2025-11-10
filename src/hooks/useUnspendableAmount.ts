import { useMemo } from "react";
import { useUser } from "@/context/UserContext";
import { currencies } from "@/constants";
import { formatCurrency } from "@/utils/formatCurrency";

export const useUnspendableAmount = () => {
  const { balances, safeConfig } = useUser();

  const currencyInfo = useMemo(() => {
    if (!safeConfig?.fiatSymbol) {
      return;
    }

    return currencies[safeConfig.fiatSymbol];
  }, [safeConfig?.fiatSymbol]);

  const unspendableData = useMemo(() => {
    const spendableBn = BigInt(balances?.spendable ?? "0");
    const totalBn = BigInt(balances?.total ?? "0");
    const pendingBn = BigInt(balances?.pending ?? "0");
    const unspendableBn = totalBn - spendableBn - pendingBn;

    return {
      unspendableFormatted: formatCurrency(unspendableBn.toString(), currencyInfo),
      unspendableBn,
      hasUnspendableAmount: unspendableBn > 0n,
    };
  }, [balances?.total, balances?.spendable, balances?.pending, currencyInfo]);

  return unspendableData;
};
