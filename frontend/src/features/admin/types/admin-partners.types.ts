export type AdminPartnerStatus = "pending_review" | "approved" | "rejected";
export type AdminPartnerTier = "tier_gold" | "tier_silver" | "tier_bronze";

export interface AdminPartnerDocument {
  id: string;
  title: string;
  type: "official_gazette" | "tax_certificate" | "ceo_national_card" | "financial_audit";
  status: "verified" | "pending" | "rejected";
  uploadedAt: string;
  fileName: string;
  fileSize: string;
}

export interface AdminPartner {
  id: string;
  companyName: string;
  managerName: string;
  nationalCode: string; // شناسه ملی ۱۱ رقمی شرکت
  economicCode: string; // کد اقتصادی ۱۲ رقمی
  registrationNumber: string; // شماره ثبت شرکت
  phone: string;
  email: string;
  address: string;
  requestedCreditLimit: number; // e.g. 300,000,000 تومان
  approvedCreditLimit?: number;
  usedCredit: number;
  status: AdminPartnerStatus;
  tier: AdminPartnerTier;
  submittedAt: string;
  approvedAt?: string;
  assignedAccountManager: string;
  sayadiChequesCount: number;
  documents: AdminPartnerDocument[];
  notes?: string;
}
