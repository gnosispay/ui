import { useCallback, useEffect, useState } from "react";
import { X } from "lucide-react";
import { cn } from "@/utils/cn";
import { Link } from "react-router-dom";
import PartnerAppsImage from "@/assets/Partner-apps.png";
import {
  shouldShowBanner,
  getBannerDismissalData,
  setBannerDismissalData,
  createDismissalData,
} from "@/utils/bannerUtils";
import { PARTNERS_URL } from "@/constants";

interface PartnerBannerProps {
  className?: string;
}

export function PartnerBanner({ className }: PartnerBannerProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const dismissalData = getBannerDismissalData('partner');
    const shouldShow = shouldShowBanner(dismissalData);
    setIsVisible(shouldShow);
  }, []);

  const handleDismiss = useCallback(() => {
    const currentData = getBannerDismissalData('partner');
    const newData = createDismissalData(currentData);
    
    setBannerDismissalData(newData, 'partner');
    setIsVisible(false);
  }, []);

  if (!isVisible) {
    return null;
  }

  return (
    <Link to={PARTNERS_URL} className={cn(
        "block relative rounded-lg overflow-hidden bg-card mb-4",
        "w-full cursor-pointer hover:bg-card/80 transition-colors",
        className
      )}>

        <div
          className="absolute top-0 right-0 bottom-0 w-1/3 bg-cover bg-no-repeat"
          style={{
            backgroundImage: `url(${PartnerAppsImage})`,
          }}
        />
        
        <div className="relative p-4 flex flex-col justify-center">
          {/* Dismiss Button */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleDismiss();
            }}
            className="absolute top-2 right-2 p-1 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 cursor-pointer z-10"
            aria-label="Dismiss banner"
          >
            <X size={14} className="text-foreground" />
          </button>
          
          <div className="w-3/4">
            <h3 className="font-semibold text-foreground mb-1 text-xs leading-4">
              📱 Discover partner apps
            </h3>
            <p className="text-xs font-normal leading-4 text-muted-foreground">
              For the best Gnosis Pay experience, try our partner apps
            </p>
          </div>
        </div>
    </Link>
  );
}
