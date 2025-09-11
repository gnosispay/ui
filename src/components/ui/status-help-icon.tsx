import { HelpCircle } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useCallback } from "react";

interface StatusHelpIconProps {
  type: "pending" | "refund" | "pending-merchant" | "reversal" | "rewards";
}

export const StatusHelpIcon = ({ type }: StatusHelpIconProps) => {
  const getHelpText = useCallback(() => {
    switch (type) {
      case "pending":
        return "This transaction is awaiting settlement.";
      case "refund":
        return "This payment has been partially refunded. The refund will be transferred within 10 working days from the payment date.";
      case "pending-merchant":
        return "If not confirmed by the merchant, it will be reverted in 11 days";
      case "reversal":
        return "This payment is the reversal of a previous transaction.";
      case "rewards":
        return <>Learn more about the <a href="https://help.gnosispay.com/hc/en-us/articles/39631920738452-About-the-Gnosis-Pay-GNO-Cashback-Programmes" target="_blank" rel="noopener noreferrer" className="text-muted-foreground underline">Rewards program</a></>;
      default:
        return "";
    }
  }, [type]);

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
  }, []);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <span
          className="inline-flex items-center justify-center ml-1 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          aria-label={`Help about ${type} status`}
          role="button"
          tabIndex={0}
          onClick={handleClick}
        >
          <HelpCircle className="w-3 h-3" />
        </span>
      </PopoverTrigger>
      <PopoverContent className="w-64 text-sm" align="start">
        <div className="text-foreground">{getHelpText()}</div>
      </PopoverContent>
    </Popover>
  );
};
