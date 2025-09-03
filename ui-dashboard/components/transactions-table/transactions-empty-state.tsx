import type { JSX } from "react";
import type { Icon as IconType } from "@phosphor-icons/react";

const TransactionsEmptyState: React.FC<{
  Icon: IconType;
  title: string;
  description: JSX.Element;
}> = ({ Icon, title, description }) => (
  <div className="flex flex-col items-center justify-center pt-24">
    <div className="flex items-center justify-center rounded-full bg-stone-200 h-16 w-16">
      <Icon className="w-16 h-10 text-stone-400 font-bold" />
    </div>

    <div className="text-center mt-5">
      <p className="text-xl font-semibold text-stone-900 mb-1">{title}</p>

      <p className="text-sm text-stone-800 font-light">{description}</p>
    </div>
  </div>
);

export default TransactionsEmptyState;
