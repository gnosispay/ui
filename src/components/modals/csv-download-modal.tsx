import { useState, useCallback, useMemo } from "react";
import { Download } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { IconButton } from "@/components/ui/icon-button";
import { StandardAlert } from "@/components/ui/standard-alert";
import { useCards } from "@/context/CardsContext";
import { getApiV1CardsTransactions } from "@/client";
import type { Event } from "@/client";
import { extractErrorMessage } from "@/utils/errorHelpers";
import {
  type DateRange,
  DateRangeOptions,
  DATE_RANGE_OPTIONS,
  getDateRange,
  convertTransactionsToCSV,
  downloadCSV,
  generateCSVFilename,
  validateCSVDownloadParams,
} from "@/utils/csvDownloadUtils";

interface CSVDownloadModalProps {
  className?: string;
  preSelectedCardToken?: string;
}

export const CSVDownloadModal = ({ className, preSelectedCardToken }: CSVDownloadModalProps) => {
  const { cards } = useCards();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCardTokens, setSelectedCardTokens] = useState<string[]>([]);
  const [selectedDateRange, setSelectedDateRange] = useState<DateRangeOptions>(DateRangeOptions.LAST_30);
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState<string>("");

  // Filter out cards without cardToken and prepare for selection
  const availableCards = useMemo(() => {
    return cards?.filter((card) => card.cardToken) || [];
  }, [cards]);

  // Handle checkbox selection for cards
  const handleCardSelection = useCallback((cardToken: string, checked: boolean) => {
    setSelectedCardTokens((prev) => {
      if (checked) {
        return [...prev, cardToken];
      } else {
        return prev.filter((token) => token !== cardToken);
      }
    });
  }, []);

  // Select/deselect all cards
  const handleSelectAllCards = useCallback(
    (checked: boolean) => {
      if (checked) {
        setSelectedCardTokens(availableCards.map((card) => card.cardToken || "").filter(Boolean));
      } else {
        setSelectedCardTokens([]);
      }
    },
    [availableCards],
  );

  // Convert transaction data to CSV format using utility
  const convertToCSV = useCallback(
    (transactions: Event[]) => convertTransactionsToCSV(transactions, availableCards),
    [availableCards],
  );

  // Download CSV file using utility
  const handleCSVDownload = useCallback((csvData: string, filename: string) => {
    try {
      downloadCSV(csvData, filename);
    } catch (err) {
      setError(extractErrorMessage(err, "No data to export"));
    }
  }, []);

  // Fetch all transactions with pagination
  const fetchAllTransactions = useCallback(async (cardTokens: string[], dateRange: DateRange) => {
    const allTransactions: Event[] = [];
    let offset = 0;
    const limit = 100;
    let hasMore = true;

    const cardTokensParam = cardTokens.join(",");

    while (hasMore) {
      const { data, error } = await getApiV1CardsTransactions({
        query: {
          cardTokens: cardTokensParam,
          limit,
          offset,
          after: dateRange.after,
          before: dateRange.before,
        },
      });

      if (error) {
        throw new Error(extractErrorMessage(error, "Error fetching transactions"));
      }

      if (!data || !data.results) {
        break;
      }

      allTransactions.push(...data.results);

      // Check if there are more pages
      hasMore = !!data.next;
      offset += limit;
    }

    return allTransactions;
  }, []);

  // Handle download action
  const handleDownload = useCallback(async () => {
    // Validate parameters using utility
    const validation = validateCSVDownloadParams(selectedCardTokens, selectedDateRange);
    if (!validation.isValid) {
      setError(validation.error || "Invalid parameters");
      return;
    }

    setIsDownloading(true);
    setError("");

    try {
      const dateRange = getDateRange(parseInt(selectedDateRange, 10));
      const transactions = await fetchAllTransactions(selectedCardTokens, dateRange);

      const csvData = convertToCSV(transactions);
      const filename = generateCSVFilename(selectedCardTokens, availableCards, selectedDateRange);

      handleCSVDownload(csvData, filename);

      // Close modal on successful download
      setIsOpen(false);
    } catch (err) {
      setError(extractErrorMessage(err, "Failed to download transactions"));
    } finally {
      setIsDownloading(false);
    }
  }, [selectedCardTokens, selectedDateRange, fetchAllTransactions, convertToCSV, availableCards, handleCSVDownload]);

  // Reset form when modal opens
  const handleOpenChange = useCallback(
    (open: boolean) => {
      setIsOpen(open);
      if (open) {
        setError("");
        // Use preSelectedCardToken if provided, otherwise auto-select all cards
        if (preSelectedCardToken && availableCards.some((card) => card.cardToken === preSelectedCardToken)) {
          setSelectedCardTokens([preSelectedCardToken]);
        } else if (availableCards.length > 0) {
          setSelectedCardTokens(availableCards.map((card) => card.cardToken || "").filter(Boolean));
        }
      } else {
        setSelectedCardTokens([]);
        setSelectedDateRange(DateRangeOptions.LAST_30);
        setError("");
      }
    },
    [availableCards, preSelectedCardToken],
  );

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <IconButton
          variant="ghost"
          size="sm"
          icon={<Download className="w-4 h-4" />}
          className={className}
          aria-label="Download transactions as CSV"
        />
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Download Card Transactions</DialogTitle>
          <DialogDescription>
            {preSelectedCardToken
              ? "Export transactions for the selected card as a CSV file."
              : "Export your card transactions as a CSV file."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Card Selection */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">Select Cards</span>
              {availableCards.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleSelectAllCards(selectedCardTokens.length !== availableCards.length)}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  {selectedCardTokens.length === availableCards.length ? "Deselect All" : "Select All"}
                </button>
              )}
            </div>
            <div className="space-y-3">
              {availableCards.map((card) => (
                <div key={card.id} className="flex items-center space-x-3">
                  <Checkbox
                    id={`card-${card.id}`}
                    checked={selectedCardTokens.includes(card.cardToken || "")}
                    onCheckedChange={(checked) => handleCardSelection(card.cardToken || "", !!checked)}
                  />
                  <label htmlFor={`card-${card.id}`} className="text-sm text-foreground cursor-pointer flex-1">
                    {card.virtual ? "Virtual" : "Physical"} <span className="ml-2">• • •</span> {card.lastFourDigits}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Date Range Selection */}
          <div className="space-y-2">
            <label htmlFor="date-range-select" className="text-sm font-medium text-foreground">
              Date Range
            </label>
            <Select
              value={selectedDateRange}
              onValueChange={(value) => setSelectedDateRange(value as DateRangeOptions)}
            >
              <SelectTrigger id="date-range-select" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DATE_RANGE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Error Display */}
          {error && <StandardAlert variant="destructive" description={error} />}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isDownloading}>
            Cancel
          </Button>
          <Button
            onClick={handleDownload}
            disabled={selectedCardTokens.length === 0 || !selectedDateRange || isDownloading}
            loading={isDownloading}
          >
            {isDownloading ? "Downloading..." : "Download CSV"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
