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

export interface PartnerOrderItem {
  id: string;
  productId?: string;
  sku: string;
  title: string;
  brand?: string;
  model?: string;
  imageUrl?: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
  warranty?: string;
  serialNumbers?: string[];
}

export interface PartnerOrderShippingAddress {
  city: string;
  province: string;
  fullAddress: string;
  postalCode: string;
  recipientName: string;
  recipientPhone: string;
}

export interface PartnerOrder {
  id: string;
  orderNumber: string;
  trackingCode?: string;
  projectTitle: string;
  companyName?: string;
  customerName?: string;
  phoneNumber?: string;
  date: string;
  totalAmount: number;
  discountAmount?: number;
  vatTaxAmount?: number;
  payableAmount?: number;
  itemsCount: number;
  items?: PartnerOrderItem[];
  status:
    | "pending_financial"
    | "processing_warehouse"
    | "shipping"
    | "delivered"
    | "cancelled"
    | "processing"
    | "warehouse_allocated";
  statusLabel: string;
  paymentMethod: "credit_cheque" | "bank_transfer" | "wallet" | "online_gateway" | "credit" | string;
  paymentLabel: string;
  isPaymentVerified?: boolean;
  siteName: string;
  shippingAddress?: PartnerOrderShippingAddress;
  waybillNumber?: string;
  carrier?: string;
  carrierName?: string;
  adminNotes?: string;
}

export interface PartnerRfqItem {
  id: string;
  sku?: string;
  title: string;
  brand?: string;
  category?: string;
  requestedQty: number;
  unitPrice?: number;
  totalPrice?: number;
  stockStatus?: string;
  specsSummary?: string;
}

export interface PartnerRfq {
  id: string;
  rfqNumber: string;
  projectTitle: string;
  clientName?: string;
  clientPhone?: string;
  clientEmail?: string;
  date: string;
  totalEstimated: number;
  finalQuotedAmount?: number;
  discountPercent?: number;
  itemsCount: number;
  items?: PartnerRfqItem[];
  status:
    | "pending_quote"
    | "quoted"
    | "approved"
    | "rejected"
    | "expired"
    | "pending_review"
    | "quote_issued";
  statusLabel: string;
  urgent?: boolean;
  deadlineHours?: number;
  validityDaysRemaining: number;
  validityDays?: number;
  quoteFileUrl?: string;
  assignedEngineer?: string;
  notes?: string;
  projectLocation?: string;
  attachedFileName?: string;
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

export interface PartnerInvoiceItem {
  id: string;
  productId?: string | null;
  title: string;
  sku?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  taxAmount: number;
}

export interface PartnerInvoiceLegalDetails {
  companyName?: string;
  registrationNumber?: string;
  nationalId?: string;
  economicCode?: string;
  postalCode?: string;
  phoneNumber?: string;
  address?: string;
}

export interface PartnerInvoice {
  id: string;
  invoiceNumber: string;
  trackingCode?: string;
  taxUniqueId?: string; // شناسه یکتای مالیاتی سامانه مودیان
  taxSystemId?: string | null;
  date: string;
  projectTitle: string;
  subtotal: number;
  vatAmount: number; // 10%
  taxAmount?: number;
  taxRatePercent?: number;
  discountAmount?: number;
  shippingCost?: number;
  totalAmount: number;
  customerName?: string;
  customerPhone?: string;
  customerAddress?: string;
  customerPostalCode?: string;
  legalDetails?: PartnerInvoiceLegalDetails;
  items?: PartnerInvoiceItem[];
  status:
    | "PENDING_APPROVAL"
    | "APPROVED"
    | "REJECTED"
    | "ISSUED"
    | "CANCELLED"
    | "settled_cheque"
    | "settled_cash"
    | "pending_settlement";
  statusLabel: string;
  paymentStatus?: "PAID" | "UNPAID" | "PARTIAL" | string;
  paymentMethod?: string;
  pdfUrl?: string;
  adminNotes?: string;
  rejectionReason?: string | null;
  officialApprovedAt?: string | null;
  officialApprovedBy?: string | null;
}

export interface PartnerProjectSite {
  id: string;
  userId?: string;
  name: string;
  title?: string;
  projectCode?: string;
  type?: string;
  tag?: string;
  tagLabel?: string;
  province?: string;
  city: string;
  address: string;
  fullAddress?: string;
  detailedAddress?: string;
  plaque?: string;
  buildingNumber?: string;
  unit?: string | null;
  postalCode?: string;
  recipientName?: string;
  supervisorName: string;
  recipientMobile?: string;
  phoneNumber?: string;
  supervisorPhone: string;
  deliveryNotes?: string | null;
  isDefault?: boolean;
  activeOrdersCount: number;
  totalOrdersCount?: number;
  partnerName?: string;
  partnerCompany?: string;
  partnerPhone?: string;
  createdAt?: string;
  updatedAt?: string;
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
