import type { LucideIcon } from "lucide-react";

export type PartnerPageCategory =
  | "overview"
  | "connectivity"
  | "procurement"
  | "finance"
  | "operations"
  | "services"
  | "legal";

export interface PartnerPageDefinition {
  id: string;
  title: string;
  shortDescription: string;
  category: PartnerPageCategory;
  categoryLabel: string;
  iconName: string;
  href: string;
  badge?: string;
  badgeVariant?: "default" | "success" | "warning" | "info" | "purple" | "orange" | "sky";
}

export interface WholesaleProduct {
  id: string;
  code: string;
  title: string;
  brand: string;
  category: string;
  retailPrice: number;
  partnerPrice: number;
  discountPercent: number;
  minOrderQty: number;
  unit: string;
  stockStatus: "in_stock" | "low_stock" | "pre_order";
  stockCount: number;
  datasheetUrl?: string;
}

export interface PartnerOrder {
  id: string;
  orderNumber: string;
  projectTitle: string;
  date: string;
  totalAmount: number;
  itemsCount: number;
  status: "processing" | "warehouse_allocated" | "shipping" | "delivered";
  statusLabel: string;
  paymentMethod: "credit_cheque" | "bank_transfer" | "wallet";
  paymentLabel: string;
  siteName: string;
  waybillNumber?: string;
  carrier?: string;
}

export interface PartnerRfq {
  id: string;
  rfqNumber: string;
  projectTitle: string;
  date: string;
  totalEstimated: number;
  itemsCount: number;
  status: "pending_review" | "quote_issued" | "approved" | "expired";
  statusLabel: string;
  validityDaysRemaining: number;
  quoteFileUrl?: string;
  assignedEngineer: string;
}

export interface PartnerCheque {
  id: string;
  chequeId: string; // 16-digit Sayad ID
  serialNumber: string;
  bank: string;
  branch: string;
  dueDate: string;
  amount: number;
  status: "registered" | "cleared" | "due_soon" | "bounced";
  statusLabel: string;
  sayadStatus: "verified" | "pending_verification";
}

export interface PartnerInvoice {
  id: string;
  invoiceNumber: string;
  taxUniqueId: string; // شناسه یکتای مالیاتی سامانه مودیان
  date: string;
  projectTitle: string;
  subtotal: number;
  vatAmount: number; // 10%
  totalAmount: number;
  status: "settled_cheque" | "settled_cash" | "pending_settlement";
  statusLabel: string;
  pdfUrl?: string;
}

export interface PartnerProjectSite {
  id: string;
  name: string;
  projectCode: string;
  city: string;
  address: string;
  supervisorName: string;
  supervisorPhone: string;
  activeOrdersCount: number;
}

export interface PartnerAgent {
  id: string;
  name: string;
  roleTitle: string;
  phone: string;
  nationalId: string;
  maxOrderLimit: number;
  permissions: string[];
  status: "active" | "suspended";
}

export interface PartnerWarrantyItem {
  id: string;
  rmaNumber: string;
  productTitle: string;
  serialNumber: string;
  brand: string;
  issueDescription: string;
  requestDate: string;
  status: "received_lab" | "replacement_approved" | "shipped_to_client" | "repaired";
  statusLabel: string;
  slaHours: number;
}

export interface PartnerTicket {
  id: string;
  ticketNumber: string;
  subject: string;
  priority: "critical" | "high" | "medium";
  priorityLabel: string;
  department: string;
  lastUpdate: string;
  status: "open" | "in_progress" | "resolved";
  statusLabel: string;
  engineerName: string;
}

export interface PartnerInternetService {
  id: string;
  serviceName: string;
  planType: "ftth" | "point_to_point" | "dedicated" | "vdsl" | "td_lte";
  planTypeLabel: string;
  speedLabel: string;
  siteName: string;
  contractNumber: string;
  ipPool: string;
  ipBlockRange: string;
  usableIpsCount: number;
  assignedTo: string;
  monthlyFee: number;
  partnerDiscountPercent: number;
  billingCycle: string;
  renewalDate: string;
  status: "active" | "provisioning" | "scheduled_survey";
  statusLabel: string;
  slaPercent: string;
}

export interface PartnerInternetOrderRequest {
  planId: string;
  staticIpPackageId: string;
  siteId: string;
  billingCycle: "1_month" | "3_months" | "6_months" | "12_months";
  paymentMethod: "credit_cheque" | "bank_transfer" | "wallet";
  needsTaxInvoice: boolean;
  notes?: string;
}

export interface P2PInternetPlan {
  id: string;
  name: string;
  speedMbps: number;
  speedLabel: string;
  trafficGb: number; // 0 for unlimited
  trafficLabel: string;
  ratio: "1:1";
  sla: string;
  baseMonthlyRetailPrice: number;
  partnerMonthlyPrice: number;
  pingGuarantee: string;
  recommendedFor: string;
  features: string[];
  isPopular?: boolean;
}

export interface StaticIpPackageDefinition {
  id: string;
  ipCount: number;
  usableIps: number;
  subnetMask: string;
  label: string;
  baseMonthlyRetailPrice: number;
  partnerMonthlyPrice: number;
  setupFee: number;
  features: string[];
  recommendedFor: string;
  isPopular?: boolean;
}

export interface PartnerStaticIpSubscription {
  id: string;
  packageLabel: string;
  ipCount: number;
  usableCount: number;
  subnet: string;
  allocatedIps: string[];
  assignedSite: string;
  assignedEquipment: string;
  billingCycle: string;
  monthlyFee: number;
  status: "active" | "provisioning";
  statusLabel: string;
  rdnsConfigured: boolean;
  rdnsDomain?: string;
  renewalDate: string;
}
