import { useCallback, useEffect, useState } from "react";
import { X } from "lucide-react";
import { cn } from "@/utils/cn";
import IbanIcon from "@/assets/IBAN-banner.png";
import {
  shouldShowBanner,
  getBannerDismissalData,
  setBannerDismissalData,
  createDismissalData,
} from "@/utils/bannerUtils";
import { IbanIntegrationModal } from "@/components/modals/iban-integration-modal";
import { useIBAN } from "@/context/IBANContext";

interface IbanBannerProps {
  className?: string;
}

export function IbanBanner({ className }: IbanBannerProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { hasIbanSet, isEligibleForIban } = useIBAN();


  useEffect(() => {
    // Only show if user doesn't have IBAN set
    if (hasIbanSet || !isEligibleForIban) {
      setIsVisible(false);
      return;
    }

    const dismissalData = getBannerDismissalData('iban');
    const shouldShow = shouldShowBanner(dismissalData);
    setIsVisible(shouldShow);
  }, [hasIbanSet]);

  const handleDismiss = useCallback(() => {
    const currentData = getBannerDismissalData('iban');
    const newData = createDismissalData(currentData);
    
    setBannerDismissalData(newData, 'iban');
    setIsVisible(false);
  }, []);

  const handleClick = useCallback(() => {
    setIsModalOpen(true);
  }, []);

  if (!isVisible) {
    return null;
  }

  return (
    <>
      <div
        data-testid="iban-banner"
        className={cn(
          "block relative rounded-lg overflow-hidden bg-card",
          "w-full mb-4 cursor-pointer hover:bg-card/80 transition-colors",
          className
        )}
        onClick={handleClick}
      >
        <div className="absolute top-0 right-0 bottom-0 w-1/3 flex items-center justify-center">
          <img src={IbanIcon} alt="IBAN" className="w-3/4 h-3/4 object-cover" />
        </div>

        <div className="relative p-4 flex flex-col justify-center">
          {/* Dismiss Button */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleDismiss();
            }}
            className="absolute top-2 right-2 p-1 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 cursor-pointer z-10"
            aria-label="Dismiss IBAN banner"
            data-testid="iban-banner-dismiss"
          >
            <X size={14} className="text-foreground" />
          </button>
          
          <div className="w-3/4">
            <h3 className="font-semibold text-foreground mb-1 text-xs leading-4">
              Create your IBAN
            </h3>
            <p className="text-xs font-normal leading-4 text-muted-foreground">
              Get an IBAN to receive funds directly to your account
            </p>
          </div>
        </div>
      </div>
      
      <IbanIntegrationModal 
        isOpen={isModalOpen} 
        onOpenChange={setIsModalOpen} 
      />
    </>
  );
}
