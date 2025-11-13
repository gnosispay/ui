enum KYCProcessingStatus {
  pending = "pending",
  done = "done",
  contacted = "contacted",
}

enum KYCVerificationStatus {
  pending = "pending",
  approved = "approved",
  rejected = "rejected",
}
enum KYCVerificationConsolidatedStatus {
  notStarted = "notStarted",
  documentsRequested = "documentsRequested",
  pending = "pending",
  processing = "processing",
  approved = "approved",
  resubmissionRequested = "resubmissionRequested",
  rejected = "rejected",
  requiresAction = "requiresAction",
}

export interface KycUserResponse {
  approved?: boolean;
  processingStatus: KYCProcessingStatus;
  verificationStatus: KYCVerificationStatus;
  consolidatedStatus: KYCVerificationConsolidatedStatus;
  person?: {
    full_name?: string;
    residential_address?: string;
    residential_address_country?: string;
  };
}
