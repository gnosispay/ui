import { IncidentBanner } from "@/components/ui/incident-banner";
import { cn } from "@/utils/cn";

interface WithdrawBannerProps {
  className?: string;
}

export function WithdrawBanner({ className }: WithdrawBannerProps) {
  return <IncidentBanner variant="withdraw" className={cn(className)} />;
}
