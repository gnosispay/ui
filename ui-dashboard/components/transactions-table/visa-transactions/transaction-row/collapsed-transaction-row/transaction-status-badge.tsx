import { Info } from "@phosphor-icons/react/dist/ssr";

interface TransactionStatusBadgeProps {
  type: "pending" | "refund";
}

export const TransactionStatusBadge = ({
  type,
}: TransactionStatusBadgeProps) => {
  const styles = {
    container: {
      pending:
        "ml-2 opacity-75 inline-flex items-center rounded-md bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-800 ring-1 ring-inset ring-yellow-600/20",
      refund: "text-gp-text-lc",
    },
    icon: {
      pending: "text-yellow-800",
      refund: "text-gp-text-lc",
    },
  };

  const tooltipContent = {
    pending: "This transaction is awaiting settlement.",
    refund: (
      <>
        This payment has been partially refunded.
        <br />
        The refund will be transferred within 10 working days
        <br />
        from the payment date.
      </>
    ),
  };

  return (
    <span className={styles.container[type]}>
      {type === "pending" ? (
        "Pending"
      ) : (
        <>
          <span className="text-primary"> - </span>Refund
        </>
      )}

      <div className="rounded-md pl-0 gp-text-lc text-sm relative inline-block">
        <div className="relative inline-block group">
          <span className="w-74 text-center absolute bottom-full mb-0 transform left-1/2 -translate-x-1/2 bg-black text-white text-xs rounded py-1 px-2 shadow-lg hidden group-hover:block z-50">
            {tooltipContent[type]}
          </span>

          <Info
            className={`${styles.icon[type]} inline-block -mt-1 ml-1 w-4 h-4`}
          />
        </div>
      </div>
    </span>
  );
};
