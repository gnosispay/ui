import { useCallback, useState, useEffect, useMemo } from "react";
import { CheckCircle2 } from "lucide-react";
import { isAfter, subHours } from "date-fns";
import {
  getApiV1TransactionsDispute,
  postApiV1TransactionsByThreadIdDispute,
  type GetApiV1TransactionsDisputeResponse,
  type PostApiV1TransactionsByThreadIdDisputeData,
} from "@/client";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { StandardAlert } from "@/components/ui/standard-alert";
import { extractErrorMessage } from "@/utils/errorHelpers";

enum DisputeStep {
  SelectReason = "select-reason",
  Success = "success",
}

type DisputeReason = PostApiV1TransactionsByThreadIdDisputeData["body"]["disputeReason"];

type DisputeReasons = NonNullable<GetApiV1TransactionsDisputeResponse["result"]>;

interface DisputeSectionProps {
  threadId: string;
  transactionDate?: string;
  onBack: () => void;
}

export const DisputeSection = ({ threadId, onBack, transactionDate }: DisputeSectionProps) => {
  const [disputeStep, setDisputeStep] = useState<DisputeStep>(DisputeStep.SelectReason);
  const [selectedReason, setSelectedReason] = useState<DisputeReason | "">("");
  const [disputeReasons, setDisputeReasons] = useState<DisputeReasons>({});
  const [isLoadingReasons, setIsLoadingReasons] = useState(false);
  const [isSubmittingDispute, setIsSubmittingDispute] = useState(false);
  const [disputeError, setDisputeError] = useState<string>("");
  const showCardRestrictionWarning = useMemo(() => {
    return selectedReason === "unrecognized_transaction_report_fraudulent";
  }, [selectedReason]);
  const isLessThan24hOld = useMemo(() => {
    if (!transactionDate) return false;

    const transactionDateTime = new Date(transactionDate);
    const twentyFourHoursAgo = subHours(new Date(), 24);

    return isAfter(transactionDateTime, twentyFourHoursAgo);
  }, [transactionDate]);

  const canDispute = useMemo(() => {
    return !isLessThan24hOld || selectedReason === "unrecognized_transaction_report_fraudulent";
  }, [isLessThan24hOld, selectedReason]);

  const fetchDisputeReasons = useCallback(() => {
    if (Object.keys(disputeReasons).length > 0) return; // Already loaded

    setIsLoadingReasons(true);
    setDisputeError("");

    getApiV1TransactionsDispute()
      .then((response) => {
        if (response.data?.result) {
          setDisputeReasons(response.data.result);
        }
      })
      .catch((error) => {
        setDisputeError(extractErrorMessage(error, "Failed to load dispute reasons"));
      })
      .finally(() => {
        setIsLoadingReasons(false);
      });
  }, [disputeReasons]);

  const submitDispute = useCallback(() => {
    if (!threadId || !selectedReason) {
      return;
    }

    setIsSubmittingDispute(true);
    setDisputeError("");

    postApiV1TransactionsByThreadIdDispute({
      path: {
        threadId,
      },
      body: {
        disputeReason: selectedReason,
      },
    })
      .then(({ error }) => {
        if (error) {
          setDisputeError(extractErrorMessage(error, "Failed to submit dispute"));
          return;
        }

        setDisputeStep(DisputeStep.Success);
        setSelectedReason("");
      })
      .catch((error) => {
        setDisputeError(extractErrorMessage(error, "Failed to submit dispute"));
      })
      .finally(() => {
        setIsSubmittingDispute(false);
      });
  }, [threadId, selectedReason]);

  // Handle starting dispute flow
  // Auto-fetch dispute reasons when component mounts
  useEffect(() => {
    fetchDisputeReasons();
  }, [fetchDisputeReasons]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        {disputeStep !== DisputeStep.Success && (
          <h2 className="text-lg font-semibold text-foreground">Dispute Transaction</h2>
        )}
      </div>

      {/* Error Message */}
      {disputeError && <StandardAlert variant="destructive" description={disputeError} />}

      {/* Select Reason Step */}
      {disputeStep === DisputeStep.SelectReason && (
        <div className="space-y-4">
          <div>
            <p className="text-sm mb-4">Select the reason that best describes your issue with this transaction.</p>

            {isLoadingReasons ? (
              <Skeleton className="h-9 w-full" />
            ) : (
              <Select value={selectedReason} onValueChange={(value: DisputeReason) => setSelectedReason(value)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a reason..." />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(disputeReasons).map(([key, value]) => (
                    <SelectItem key={key} value={key as DisputeReason}>
                      {value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Additional Warning for Fraudulent Transaction */}
          {showCardRestrictionWarning && (
            <StandardAlert
              variant="warning"
              description="Important: If you report this transaction as fraudulent, your card will be temporarily restricted until this issue is resolved to protect your account."
            />
          )}

          {!canDispute && (
            <StandardAlert
              variant="destructive"
              description="This transaction is less than 24 hours old. Please wait before disputing as refunds for reversed or failed transactions are automatically processed within one business day."
            />
          )}

          <div className="flex gap-3">
            <Button variant="outline" onClick={onBack} disabled={isSubmittingDispute}>
              Back
            </Button>
            <Button
              onClick={submitDispute}
              className="flex-1"
              disabled={!selectedReason || isSubmittingDispute || !canDispute}
            >
              {isSubmittingDispute ? "Submitting..." : "Submit Dispute"}
            </Button>
          </div>
        </div>
      )}

      {disputeStep === DisputeStep.Success && (
        <div className="space-y-6 text-center">
          <div className="flex justify-center">
            <CheckCircle2 className="w-16 h-16 text-success" />
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-foreground">Dispute Submitted Successfully</h3>
            <p className="text-sm text-muted-foreground">
              Your dispute has been submitted and a support ticket has been created. Our team will review your case and
              get back to you soon.
            </p>
            <p className="text-sm text-muted-foreground">
              You'll receive updates via email about the status of your dispute.
            </p>
          </div>

          <Button variant="outline" onClick={onBack} className="w-full">
            Back
          </Button>
        </div>
      )}
    </div>
  );
};
