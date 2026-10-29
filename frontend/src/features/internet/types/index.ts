export type InternetPlanType =
  | "adsl"
  | "vdsl"
  | "ftth"
  | "point_to_point"
  | "td_lte"
  | "dedicated_bandwidth";

export type NightTrafficType = "NORMAL" | "HALF_PRICE" | "FREE_BUSINESS";

export type BillingCycle = "1_month" | "3_months" | "6_months" | "12_months";

export interface InternetPlan {
  id: string;
  title: string;
  monthlyPrice: number; // in Tomans
  badge?: string | null;
  description?: string | null;
  internationalTraffic?: number | null; // null = نامحدود
  domesticTraffic?: number | null; // null = نامحدود
  nightTraffic?: NightTrafficType;
  features: string[];
  isFeatured?: boolean;
  isActive?: boolean;
  sortOrder?: number;
  discountThreeMonths?: number;
  discountSixMonths?: number;
  discountYearly?: number;
  createdAt?: string;
  updatedAt?: string;

  // Compatibility / UI helper properties
  name?: string;
  type?: InternetPlanType;
  speed?: string;
  speedMbps?: number;
  trafficInternationalGb?: number;
  trafficDomesticGb?: number;
  nightTrafficFree?: boolean;
  basePricePerMonth?: number;
  popular?: boolean;
  recommendedFor?: string;
}

export interface StaticIpPackage {
  id: string;
  ipCount: number;
  label: string;
  usableIps: number;
  pricePerMonth: number;
  discountPercentForYearly: number;
  setupFee: number;
  subnetMask?: string;
  features: string[];
  recommendedFor: string;
}

export interface InternetAddonItem {
  id: string;
  title: string;
  description: string;
  price: number;
  isOneTime: boolean;
  iconName: string;
}

export interface InternetSettings {
  staticIpMonthlyPrice: number;
  modemPrice?: number;
  installationPrice?: number;
  partnerInternetCommission: number;
  partnerStaticIpCommission: number;
}

export interface CalculateCostParams {
  planId: string;
  serviceDurationMonths: number;
  hasStaticIp?: boolean;
  includeModem?: boolean;
  includeInstallation?: boolean;
}

export interface CostCalculationResult {
  planId: string;
  planTitle: string;
  durationMonths: number;
  baseMonthlyPrice: number;
  discountPercent: number;
  discountedMonthlyPrice: number;
  planDurationTotal: number;
  planDiscountAmount: number;
  hasStaticIp: boolean;
  staticIpMonthlyPrice: number;
  staticIpMonthlyDiscounted: number;
  staticIpTotal: number;
  includeModem: boolean;
  modemCost: number;
  includeInstallation: boolean;
  installationCost: number;
  addonsTotal: number;
  finalAmount: number;
  partnerCommission: number;
}

export interface InternetOrderFormData {
  fullName: string;
  companyName?: string;
  nationalCode: string;
  phoneNumber: string;
  province: string;
  city: string;
  postalCode: string;
  landlineNumber?: string;
  address: string;
  selectedPlanId: string;
  billingCycle: BillingCycle;
  selectedStaticIpId?: string; // deprecated
  hasStaticIp: boolean; // Static IP checkbox option
  siteId?: string; // Workshop / Project Site for partner
  includeModem?: boolean;
  includeInstallationExpert?: boolean;
  needsB2bInvoice: boolean;
  notes?: string;
}

export type InternetOrderStatus = "PENDING" | "ACTIVE" | "CANCELLED";

export interface InternetOrder {
  id: string;
  trackingCode: string;
  userId: string;
  planId: string;
  siteId?: string | null;
  serviceDurationMonths: number;
  hasStaticIp: boolean;
  includeModem: boolean;
  includeInstallation: boolean;
  baseAmount: number;
  discountAmount: number;
  staticIpAmount: number;
  addonsAmount: number;
  finalAmount: number;
  partnerCommission: number;
  status: InternetOrderStatus;
  fullName: string;
  companyName?: string | null;
  phoneNumber: string;
  nationalCode?: string | null;
  province: string;
  city: string;
  address: string;
  landlineNumber?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  plan?: InternetPlan;
  user?: {
    id: string;
    name: string;
    phone?: string;
    email?: string;
  };
  site?: {
    id: string;
    title: string;
    province: string;
    city: string;
    detailedAddress: string;
  };
}

export interface InternetOrderResult {
  orderTrackingNumber: string;
  submittedAt: string;
  totalMonthlyPrice: number;
  oneTimeSetupTotal: number;
  finalPayableTotal?: number;
  estimatedActivationHours: number;
  orderSummary: {
    planName: string;
    billingCycleLabel: string;
    staticIpLabel: string;
    modemIncluded?: boolean;
    installationIncluded?: boolean;
    siteTitle?: string;
  };
}
