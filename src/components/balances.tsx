import { useUser } from "@/context/UserContext";
import { useMemo } from "react";
import { Clock } from "lucide-react";
import { Skeleton } from "./ui/skeleton";

const formatCurrency = (value: string | undefined): string | undefined => {
  if (!value) {
    return undefined;
  }
  try {
    const bigIntValue = BigInt(value);
    const valueInUnits = Number(bigIntValue) / 10 ** 18; // Changed to 10^18 for correct Euro conversion
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "EUR" }).format(valueInUnits);
  } catch (e) {
    console.error("Error formatting currency:", e);
    return "€NaN";
  }
};

export const Balances = () => {
  const { balances } = useUser();

  const formattedBalance = useMemo(() => formatCurrency(balances?.total), [balances?.total]);
  const formattedPending = useMemo(() => formatCurrency(balances?.pending), [balances?.pending]);

  return (
    <div className="flex flex-col gap-2 p-4">
      <h1 className="font-bold text-secondary">Balance</h1>
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
      {formattedPending && formattedPending !== "€0.00" && (
        <div className="text-secondary flex items-center gap-1">
          <Clock className="w-6 h-6" aria-hidden="true" />
          {formattedPending} pending
        </div>
      )}
    </div>
  );
};
