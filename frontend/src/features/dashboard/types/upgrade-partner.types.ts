export type PartnerApplicantType = "INDIVIDUAL" | "COMPANY";

export type PartnerApplicationStatus =
  | "PENDING"
  | "UNDER_REVIEW"
  | "NEED_DOCS"
  | "APPROVED"
  | "REJECTED";

export type PartnerTier = "BRONZE" | "SILVER" | "GOLD";

export interface PartnerDocumentItem {
  id?: string;
  title: string;
  fileName: string;
  fileUrl: string;
  type: string;
  fileSize?: string;
  uploadedAt?: string;
}

export interface PartnerApplicationData {
  id?: string;
  userId?: string;
  applicantType: PartnerApplicantType;

  // Common Identity & Contact
  fullName: string;
  phone: string;
  landlinePhone?: string;
  email?: string;
  province: string;
  city: string;
  address: string;
  postalCode?: string;

  // Business & Activity
  fieldOfActivity: string;
  experienceYears: number;
  estimatedMonthlyPurchase: number; // Toman
  requestedCreditLimit: number; // Toman
  websiteOrSocial?: string;
  notes?: string;

  // Individual specific (شخص حقیقی / نصاب / متخصص / فروشگاه آزاد)
  nationalCode?: string;
  tradeName?: string;
  businessLicenseNumber?: string;

  // Company specific (شخص حقوقی / شرکت / موسسه ثبتی)
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

  // Documents
  documents: PartnerDocumentItem[];

  // Review & Status
  status: PartnerApplicationStatus;
  tier?: PartnerTier;
  approvedCreditLimit?: number;
  assignedAccountManager?: string;
  reviewerNotes?: string;
  reviewedAt?: string;
  submittedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PartnerApplicationResponse {
  application: PartnerApplicationData | null;
  isPartner: boolean;
  user: {
    id: string;
    name: string;
    phone: string;
    email?: string;
    roles: string[];
  };
}
