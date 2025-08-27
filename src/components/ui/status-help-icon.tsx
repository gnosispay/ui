import { HelpCircle } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useCallback } from "react";

interface StatusHelpIconProps {
  type: "pending" | "refund";
}

export const StatusHelpIcon = ({ type }: StatusHelpIconProps) => {
  const getHelpText = useCallback(() => {
    switch (type) {
      case "pending":
        return "This transaction is awaiting settlement.";
      case "refund":
        return "This payment has been partially refunded. The refund will be transferred within 10 working days from the payment date.";
      default:
        return "";
    }
  }, [type]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center justify-center ml-1 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          aria-label={`Help about ${type} status`}
        >
          <HelpCircle className="w-3 h-3" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-64 text-sm" align="start">
        <p className="text-foreground">{getHelpText()}</p>
      </PopoverContent>
    </Popover>
  );
};
