import { PartnerApplicationData } from "../types/upgrade-partner.types";

export const INITIAL_PARTNER_APPLICATION: PartnerApplicationData = {
  applicantType: "INDIVIDUAL",
  fullName: "",
  phone: "",
  landlinePhone: "",
  province: "تهران",
  city: "تهران",
  address: "",
  postalCode: "",
  fieldOfActivity: "پسیو شبکه، کابل‌کشی و دوربین مداربسته",
  experienceYears: 3,
  estimatedMonthlyPurchase: 30000000,
  requestedCreditLimit: 50000000,
  websiteOrSocial: "",
  notes: "",

  // Individual fields
  nationalCode: "",
  tradeName: "",
  businessLicenseNumber: "",

  // Company fields
  companyName: "",
  companyType: "private_joint_stock",
  nationalCompanyId: "",
  economicCode: "",
  registrationNumber: "",
  establishedYear: "",
  ceoOrAgentName: "",
  agentPosition: "مدیرعامل",

  documents: [],
  status: "PENDING",
};
