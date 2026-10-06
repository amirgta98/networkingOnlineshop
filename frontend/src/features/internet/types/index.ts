export type InternetPlanType =
  | "adsl"
  | "vdsl"
  | "ftth"
  | "point_to_point"
  | "td_lte"
  | "dedicated_bandwidth";

export type BillingCycle = "1_month" | "3_months" | "6_months" | "12_months";

export interface InternetPlan {
  id: string;
  name: string;
  type: InternetPlanType;
  speed: string; // e.g., "تا ۳۰۰ مگابیت"
  speedMbps: number;
  trafficInternationalGb: number;
  trafficDomesticGb: number;
  nightTrafficFree: boolean;
  basePricePerMonth: number; // in Tomans
  popular?: boolean;
  features: string[];
  recommendedFor: string;
}

export interface StaticIpPackage {
  id: string;
  ipCount: number; // 1, 4, 8, 16
  label: string; // e.g., "۱ عدد IP استاتیک اختصاصی"
  usableIps: number; // usable usable IP addresses
  pricePerMonth: number; // in Tomans
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
  price: number; // one-time or monthly
  isOneTime: boolean;
  iconName: string;
}

export interface InternetOrderFormData {
  fullName: string;
  companyName?: string;
  nationalCode: string;
  phoneNumber: string;
  province: string;
  city: string;
  postalCode: string;
  landlineNumber?: string; // شماره خط تلفن ثابت جهت رانژه
  address: string;
  selectedPlanId: string;
  billingCycle: BillingCycle;
  selectedStaticIpId: string; // "none" or StaticIpPackage id
  includeModem: boolean;
  includeInstallationExpert: boolean;
  needsB2bInvoice: boolean;
  notes?: string;
}

export interface InternetOrderResult {
  orderTrackingNumber: string;
  submittedAt: string;
  totalMonthlyPrice: number;
  oneTimeSetupTotal: number;
  estimatedActivationHours: number;
  orderSummary: {
    planName: string;
    billingCycleLabel: string;
    staticIpLabel: string;
    modemIncluded: boolean;
    installationIncluded: boolean;
  };
}
