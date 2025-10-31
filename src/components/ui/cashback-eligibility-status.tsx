import { useMemo } from "react";
import { Gift, X, Clock } from "lucide-react";
import type { Event } from "@/client";
import { useTransactionStatus } from "@/hooks/useTransactionStatus";

interface CashbackEligibilityStatusProps {
  transactionDetails: Event;
}

export const CashbackEligibilityStatus = ({ transactionDetails }: CashbackEligibilityStatusProps) => {
  const { isRefund, isReversal, otherTxStatus } = useTransactionStatus(transactionDetails);

  const cashbackStatus = useMemo(() => {
    const eligibleForReward = transactionDetails.impactsCashback;

    if (eligibleForReward === true) {
      return {
        icon: <Gift className="w-4 h-4 text-button-black" />,
        iconBg: "bg-brand",
        label: "Eligible",
      };
    }

    // For refunds, and other transaction statuses such as incorrect pin, insufficient funds, etc.
    // the eligibleForReward is null
    if (eligibleForReward === false || isRefund || otherTxStatus !== null) {
      return {
        icon: <X className="w-4 h-4 text-button-black" />,
        iconBg: "bg-icon-background",
        label: "Not eligible",
      };
    }

    // Awaiting settlement (eligibleForReward is null/undefined)
    return {
      icon: <Clock className="w-4 h-4 text-button-black" />,
      iconBg: "bg-icon-background",
      label: "Awaiting settlement",
    };
  }, [transactionDetails.impactsCashback, isRefund, isReversal]);

  return (
    <div className="flex items-center">
      <div className={`flex items-center justify-center ${cashbackStatus.iconBg} w-8 h-8 rounded-full`}>
        {cashbackStatus.icon}
      </div>
      <span className="ml-2 font-medium text-foreground">{cashbackStatus.label}</span>
    </div>
  );
};
