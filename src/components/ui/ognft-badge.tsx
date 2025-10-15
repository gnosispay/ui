import { cn } from "@/utils/cn";

interface OgnftBadgeProps {
  className?: string;
}

export const OgnftBadge = ({ className }: OgnftBadgeProps) => {
  return (
    <div
      className={cn(
        "inline-flex items-center justify-center px-2 py-1 text-xs font-medium rounded-full",
        "bg-brand text-button-black",
        "border border-border",
        className
      )}
    >
     🧑‍🚀 OG
    </div>
  );
};
