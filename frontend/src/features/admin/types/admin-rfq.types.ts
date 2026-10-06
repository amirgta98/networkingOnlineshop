export type AdminRfqStatus = "pending_quote" | "quoted" | "expired" | "converted";

export interface AdminRfqEquipmentItem {
  id: string;
  sku: string;
  title: string;
  brand: string;
  category: string;
  requestedQty: number;
  unitPrice: number;
  stockStatus: "available" | "custom_order" | "low_stock";
  suggestedAlternative?: string;
  specsSummary?: string;
}

export interface AdminRfq {
  id: string;
  rfqNumber: string;
  projectTitle: string;
  clientName: string;
  companyName: string;
  clientPhone: string;
  clientEmail?: string;
  submittedDate: string;
  deadlineHours: number;
  urgent: boolean;
  status: AdminRfqStatus;
  items: AdminRfqEquipmentItem[];
  discountPercent: number;
  validityDays: number;
  estimatedValue: number;
  finalQuotedAmount?: number;
  quotationIssuedAt?: string;
  projectLocation?: string;
  notes?: string;
}
