import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useUser } from "@/context/UserContext";
import { Building2, Download, ArrowLeftRight, ChevronRight, LifeBuoy } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { BankTransferStep } from "./bank-transfer-step";
import { CryptoStep } from "./crypto-step";
import { useDebridgeUrl } from "@/hooks/useDebridgeUrl";
import { useJumperUrl } from "@/hooks/useJumperUrl";
import { currencies } from "@/constants";

interface AddFundsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

enum Step {
  Select = "Add funds",
  IBAN = "Bank transfer",
  Crypto = "Top up with crypto",
}

export const AddFundsModal = ({ open, onOpenChange }: AddFundsModalProps) => {
  const { user, safeConfig } = useUser();
  const currency = useMemo(() => {
    if (!safeConfig?.fiatSymbol) return null;
    return currencies[safeConfig.fiatSymbol];
  }, [safeConfig]);
  const [step, setStep] = useState<Step>(Step.Select);
  const onLocalOpenChange = useCallback(
    (open: boolean) => {
      setStep(Step.Select);
      onOpenChange(open);
    },
    [onOpenChange],
  );

  const debridgeUrl = useDebridgeUrl();
  const jumperUrl = useJumperUrl();

  const fundingOptions = useMemo(() => {
    const baseOptions = [
      {
        icon: Download,
        title: "Top up with crypto",
        description: "Send crypto to your Gnosis Card account • ~5 mins",
        onClick: () => {
          setStep(Step.Crypto);
        },
      },
      {
        icon: ArrowLeftRight,
        title: "Swap tokens via Jumper",
        description: `Exchange your crypto for ${currency?.tokenSymbol} • ~5 mins`,
        onClick: () => {
          if (!jumperUrl) return;
          window.open(jumperUrl, "_blank");
        },
      },
      {
        icon: ArrowLeftRight,
        title: "Swap tokens via deBridge",
        description: `Exchange your crypto for ${currency?.tokenSymbol} • ~5 mins`,
        onClick: () => {
          if (!debridgeUrl) return;
          window.open(debridgeUrl, "_blank");
        },
      },
    ];

    // Add bank transfer option if user has banking details
    if (user?.bankingDetails?.moneriumIban) {
      baseOptions.push({
        icon: Building2,
        title: "Bank transfer",
        description: "Send Euros from your bank account • Up to 1 day",
        onClick: () => {
          setStep(Step.IBAN);
        },
      });
    }

    return baseOptions;
  }, [user?.bankingDetails?.moneriumIban, debridgeUrl, jumperUrl, currency?.tokenSymbol]);

  return (
    <Dialog open={open} onOpenChange={onLocalOpenChange}>
      <DialogContent aria-describedby={undefined}>
        <DialogTitle>{step}</DialogTitle>
        <div className="pb-6 space-y-3">
          {step === Step.Select && (
            <>
              {fundingOptions.map((option) => {
                const IconComponent = option.icon;
                return (
                  <button
                    key={option.title}
                    type="button"
                    className="cursor-pointer w-full flex items-center gap-4 p-4 rounded-lg border hover:bg-muted/50 transition-colors text-left"
                    onClick={option.onClick}
                  >
                    <div className="flex-shrink-0">
                      <IconComponent className="h-6 w-6 text-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-foreground mb-1">{option.title}</h3>
                      <p className="text-sm text-muted-foreground">{option.description}</p>
                    </div>
                    <div className="flex-shrink-0">
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </button>
                );
              })}
              <div className="flex items-center gap-2 pt-2 text-sm text-muted-foreground">
                <LifeBuoy className="h-4 w-4" />
                <span>
                  More info about bridging and swaping on our{" "}
                  <a
                    href="https://help.gnosispay.com/hc/en-us/articles/39563426086932-Funding-with-Cryptocurrency-Swapping-Bridging"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground underline"
                  >
                    help center
                  </a>
                  .
                </span>
              </div>
            </>
          )}
          {step === Step.IBAN && <BankTransferStep onBack={() => setStep(Step.Select)} />}
          {step === Step.Crypto && <CryptoStep onBack={() => setStep(Step.Select)} />}
        </div>
      </DialogContent>
    </Dialog>
  );
};
