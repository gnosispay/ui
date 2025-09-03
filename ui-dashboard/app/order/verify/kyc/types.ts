export enum KYCProcessingStatus {
  pending = "pending",
  done = "done",
  contacted = "contacted",
}

export enum KYCVerificationStatus {
  pending = "pending",
  approved = "approved",
  rejected = "rejected",
}

export interface KycUserResponse {
  approved?: boolean;
  processingStatus: KYCProcessingStatus;
  verificationStatus: KYCVerificationStatus;
  person?: {
    full_name?: string;
    residential_address?: string;
    residential_address_country?: string;
  };
}
