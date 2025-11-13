import { twMerge } from "tailwind-merge";

import FormattedDateTime from "../../../../format-date";
import SkeletonLoader from "../../../../skeleton-loader";

interface TransactionDateProps {
  date: Date;
  showDate: boolean;
  open: boolean;
}

export const TransactionDate = ({
  date,
  showDate,
  open,
}: TransactionDateProps) => {
  return (
    <div
      className={twMerge("min-w-[100px]", !open && !showDate && "invisible")}
    >
      <SkeletonLoader className="w-20 h-4 inline-block">
        <span className="text-gp-text-hc">
          <FormattedDateTime date={date} format="MMM d" />
        </span>

        {open && (
          <span className="text-gp-text-lc">
            {" at "}
            <FormattedDateTime date={date} format="p" />
          </span>
        )}
      </SkeletonLoader>
    </div>
  );
};
