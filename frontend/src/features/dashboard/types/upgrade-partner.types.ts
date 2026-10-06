export type PartnerApplicationStatus =
  | "not_submitted"
  | "pending_verification"
  | "credit_approved"
  | "needs_additional_docs"
  | "rejected";

export interface PartnerApplicationData {
  companyName: string;
  companyType: "private_joint_stock" | "limited_liability" | "cooperative" | "other";
  nationalId: string;
  economicCode: string;
  registrationNumber: string;
  establishedYear: string;
  fieldOfActivity: string;
  estimatedMonthlyPurchase: string;
  requestedCreditLine: number; // Toman
  officialGazetteFileName?: string;
  taxClearanceFileName?: string;
  notes?: string;
  status: PartnerApplicationStatus;
  statusLabel: string;
  submittedAt?: string;
  reviewerNotes?: string;
}
