import { useState, useEffect, useCallback } from "react";
import type { Event } from "@/client";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { DisputeSection } from "./dispute-section";
import { TransactionDetailsView } from "./transaction-details-view";

interface TransactionDetailsModalProps {
  transaction: Event | null;
  isOpen: boolean;
  onClose: () => void;
}

enum ModalView {
  Details = "details",
  Dispute = "dispute",
}

export const TransactionDetailsModal = ({ transaction, isOpen, onClose }: TransactionDetailsModalProps) => {
  const [currentView, setCurrentView] = useState<ModalView>(ModalView.Details);

  // Reset view when modal opens/closes or transaction changes
  useEffect(() => {
    if (!isOpen) {
      setCurrentView(ModalView.Details);
    }
  }, [isOpen]);

  const handleStartDispute = useCallback(() => {
    setCurrentView(ModalView.Dispute);
  }, []);

  const handleBackToDetails = useCallback(() => {
    setCurrentView(ModalView.Details);
  }, []);

  if (!transaction) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        {currentView === ModalView.Details && (
          <TransactionDetailsView transaction={transaction} onStartDispute={handleStartDispute} />
        )}

        {currentView === ModalView.Dispute && transaction.threadId && (
          <DisputeSection
            key={transaction.threadId}
            transactionDate={transaction.createdAt}
            threadId={transaction.threadId}
            onBack={handleBackToDetails}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};
