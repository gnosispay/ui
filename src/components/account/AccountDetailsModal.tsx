import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useUser } from "@/context/UserContext";
import { IbanAccountDetails } from "./IbanAccountDetails";
import { SafeAccountDetails } from "./SafeAccountDetails";

interface AccountDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

enum AccountDetailsTab {
  SAFE = "safe",
  IBAN = "iban",
}

export const AccountDetailsModal = ({ open, onOpenChange }: AccountDetailsModalProps) => {
  const { safeConfig } = useUser();
  const [activeTab, setActiveTab] = useState<AccountDetailsTab>(AccountDetailsTab.SAFE);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Account details</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Use these account details to send {safeConfig?.fiatSymbol} to your Gnosis Pay Card account.
          </p>

          {/* Tab Navigation */}
          <div className="flex bg-muted/50 rounded-lg p-1">
            <button
              type="button"
              onClick={() => setActiveTab(AccountDetailsTab.SAFE)}
              className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === AccountDetailsTab.SAFE
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Safe
            </button>
            <button
              type="button"
              onClick={() => setActiveTab(AccountDetailsTab.IBAN)}
              className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === AccountDetailsTab.IBAN
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              IBAN
            </button>
          </div>

          {activeTab === AccountDetailsTab.SAFE && <SafeAccountDetails />}
          {activeTab === AccountDetailsTab.IBAN && <IbanAccountDetails />}
        </div>
      </DialogContent>
    </Dialog>
  );
};
