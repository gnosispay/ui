import { CardTransactions } from "./CardTransactions";
import { OnchainTransactions } from "./OnchainTransactions";
import { IbanTransactions } from "./IbanTransactions";
import { useState, useCallback } from "react";
import { TransactionTabs, TransactionTab } from "@/components/ui/transaction-tabs";
import { CSVDownloadModal } from "@/components/modals/csv-download-modal";

enum TransactionType {
  CARD = "card",
  ONCHAIN = "onchain",
  IBAN = "iban",
}

export const Transactions = () => {
  const [selectedType, setSelectedType] = useState<TransactionType>(TransactionType.CARD);

  const handleTabChange = useCallback((value: string) => {
    setSelectedType(value as TransactionType);
  }, []);

  return (
    <div className="flex flex-col gap-4 mb-4">
      {/* Transactions Content */}
      <div className="bg-card rounded-lg">
        {/* Transaction Tabs with Download Button */}
        <div className="flex items-center justify-between border-b border-border mb-4">
          <TransactionTabs value={selectedType} onValueChange={handleTabChange} className="border-b-0 mb-0">
            <TransactionTab value={TransactionType.CARD}>Card</TransactionTab>
            <TransactionTab value={TransactionType.ONCHAIN}>On-chain</TransactionTab>
            <TransactionTab value={TransactionType.IBAN}>IBAN</TransactionTab>
          </TransactionTabs>
          {selectedType === TransactionType.CARD && (
            <div className="pr-4">
              <CSVDownloadModal />
            </div>
          )}
        </div>
        <div className="p-2">
          {selectedType === TransactionType.CARD && <CardTransactions />}
          {selectedType === TransactionType.ONCHAIN && <OnchainTransactions />}
          {selectedType === TransactionType.IBAN && <IbanTransactions />}
        </div>
      </div>
    </div>
  );
};
