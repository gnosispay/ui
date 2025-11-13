import React from "react";
import FormatCurrency from "@/components/format-currency";

interface BalanceCardProps {
  title: string;
  description: React.ReactNode;
  currencyName: string;
  amount: bigint;
  decimals: number;
  icon: React.ReactNode;
  className?: string;
}

const BalanceCard: React.FC<BalanceCardProps> = ({
  title,
  description,
  currencyName,
  amount,
  decimals,
  icon,
  className,
}) => {
  return (
    <div
      className={`border-gp-border border rounded-2xl shadow-gp-container p-8 pb-12 grow basis-0 w-[400px] mb-4 relative bg-white px-3 ${className} `}
    >
      <div className="w-7 h-7 opacity-80 absolute left-4">{icon}</div>
      <div className="ml-12 h-full flex flex-col justify-between">
        <div className="flex justify-items items-center">
          <div className="text-gp-text-lc group flex gap-x-3 rounded-md leading-6">
            {title}
          </div>
        </div>
        <div className="text-sm text-gray-500 mt-2 mb-2">{description}</div>
        <div className="flex gap-1 items-baseline mt-auto">
          <FormatCurrency
            currency={currencyName}
            amount={amount}
            decimals={decimals}
            currencyClassName="text-4xl"
            integerClassName="text-6xl"
            decimalClassName="text-6xl"
            FractionClassName="text-4xl opacity-100"
          />
        </div>
      </div>
    </div>
  );
};

export default BalanceCard;
