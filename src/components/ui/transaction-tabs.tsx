import * as React from "react";
import { cn } from "@/lib/utils";

interface TransactionTabsProps {
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}

interface TransactionTabProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

const TransactionTabsContext = React.createContext<{
  value: string;
  onValueChange: (value: string) => void;
} | null>(null);

const TransactionTabs = React.forwardRef<HTMLDivElement, TransactionTabsProps>(
  ({ value, onValueChange, children, className, ...props }, ref) => {
    return (
      <TransactionTabsContext.Provider value={{ value, onValueChange }}>
        <div
          ref={ref}
          className={cn(
            "flex justify-start border-b border-border mb-4",
            className
          )}
          {...props}
        >
          <div className="flex">
            {children}
          </div>
        </div>
      </TransactionTabsContext.Provider>
    );
  }
);
TransactionTabs.displayName = "TransactionTabs";

const TransactionTab = React.forwardRef<HTMLButtonElement, TransactionTabProps>(
  ({ value, children, className, ...props }, ref) => {
    const context = React.useContext(TransactionTabsContext);
    
    if (!context) {
      throw new Error("TransactionTab must be used within TransactionTabs");
    }

    const { value: selectedValue, onValueChange } = context;
    const isSelected = selectedValue === value;

    return (
      <button
        ref={ref}
        type="button"
        onClick={() => onValueChange(value)}
        className={cn(
          "px-4 py-4 text-sm font-medium transition-all duration-200 min-h-[44px]",
          "hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          "relative border-b-2 border-transparent whitespace-nowrap cursor-pointer",
          "sm:px-6", // More padding on larger screens
          isSelected
            ? "text-foreground border-b-brand font-semibold"
            : "text-muted-foreground hover:text-foreground",
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);
TransactionTab.displayName = "TransactionTab";

export { TransactionTabs, TransactionTab };
