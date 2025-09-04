import { useCallback, useEffect, useState } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import PartnerAppsImage from "@/assets/Partner-apps.png";

const BANNER_STORAGE_KEY = "gp-ui.partner-banner-dismissed.v1";

interface PartnerBannerProps {
  className?: string;
}

export function PartnerBanner({ className }: PartnerBannerProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if banner was previously dismissed
    const isDismissed = localStorage.getItem(BANNER_STORAGE_KEY) === "true";
    setIsVisible(!isDismissed);
  }, []);

  const handleDismiss = useCallback(() => {
    localStorage.setItem(BANNER_STORAGE_KEY, "true");
    setIsVisible(false);
  }, []);

  if (!isVisible) {
    return null;
  }

  return (
    <div
      className={cn(
        "relative rounded-lg overflow-hidden bg-card border border-border",
        "w-full",
        className
      )}
    >
      <div
        className="absolute top-0 right-2 bottom-0 w-1/3 bg-cover bg-no-repeat"
        style={{
          backgroundImage: `url(${PartnerAppsImage})`,
        }}
      />
      
      {/* Content */}
      <div className="relative p-4 flex flex-col justify-center">
        {/* Dismiss Button */}
        <button
          onClick={handleDismiss}
          className="absolute top-2 right-2 p-1 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 cursor-pointer"
          aria-label="Dismiss banner"
        >
          <X size={14} className="text-foreground" />
        </button>
        
        <div className="w-3/4">
          <h3 className="font-semibold text-foreground mb-1 text-xs leading-4">
            📱 Discover partner apps
          </h3>
          <p className="text-xs font-normal leading-4 text-muted-foreground">
            For the best Gnosis Pay experience try one of our partner apps
          </p>
        </div>
      </div>
    </div>
  );
}
