import { cn } from "@/utils/cn";

interface OgnftBadgeProps {
  className?: string;
  "data-testid"?: string;
}

export const OgnftBadge = ({ className, "data-testid": dataTestId }: OgnftBadgeProps) => {
  return (
    <div
      className={cn(
        "inline-flex items-center justify-center px-2 py-1 text-xs font-medium rounded-full",
        "bg-brand text-button-black",
        "border border-border",
        className
      )}
      data-testid={dataTestId}
    >
      🧑‍🚀 OG
    </div>
  );
};
