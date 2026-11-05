export type AdminApplicantType = "INDIVIDUAL" | "COMPANY";

export type AdminPartnerStatus =
  | "PENDING"
  | "UNDER_REVIEW"
  | "NEED_DOCS"
  | "APPROVED"
  | "REJECTED"
  | "pending_review"
  | "approved"
  | "rejected";

export type AdminPartnerTier =
  | "BRONZE"
  | "SILVER"
  | "GOLD"
  | "tier_gold"
  | "tier_silver"
  | "tier_bronze";

export interface AdminPartnerDocument {
  id: string;
  title: string;
  type: string;
  status?: "verified" | "pending" | "rejected";
  uploadedAt: string;
  fileName: string;
  fileSize?: string;
  fileUrl?: string;
}

export interface AdminPartner {
  id: string;
  userId?: string;
  applicantType: AdminApplicantType;

  // Common identity & Contact
  fullName: string;
  phone: string;
  landlinePhone?: string;
  province: string;
  city: string;
  address: string;
  postalCode?: string;

  // Business & Activity
  fieldOfActivity: string;
  experienceYears: number;
  estimatedMonthlyPurchase: number;
  requestedCreditLimit: number;
  approvedCreditLimit?: number;
  usedCredit?: number;
  websiteOrSocial?: string;
  notes?: string;

  // Individual specific (شخص حقیقی)
  nationalCode?: string;
  tradeName?: string;
  businessLicenseNumber?: string;

  // Company specific (شخص حقوقی)
  companyName?: string;
  companyType?: string;
  nationalCompanyId?: string;
  economicCode?: string;
  registrationNumber?: string;
  establishedYear?: string;
  ceoOrAgentName?: string;
  agentPosition?: string;
  officialGazetteFileUrl?: string;
  officialGazetteFileName?: string;
  taxClearanceFileUrl?: string;
  taxClearanceFileName?: string;

  // Management & Review
  status: AdminPartnerStatus;
  tier: AdminPartnerTier;
  submittedAt: string;
  reviewedAt?: string;
  approvedAt?: string;
  assignedAccountManager?: string;
  sayadiChequesCount?: number;
  reviewerNotes?: string;
  documents: AdminPartnerDocument[];

  user?: {
    id: string;
    name: string;
    phone: string;
    };
}

export interface AdminPartnersStats {
  totalApplications: number;
  pendingCount: number;
  approvedCount: number;
  needDocsCount: number;
  rejectedCount: number;
  individualCount: number;
  companyCount: number;
  totalApprovedCredit: number;
}

export interface AdminPartnersResponse {
  items: AdminPartner[];
  total: number;
  page: number;
  limit: number;
  stats: AdminPartnersStats;
}
