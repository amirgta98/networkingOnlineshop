export type RfqStatus =
  | "under_review"
  | "quote_ready"
  | "approved"
  | "rejected"
  | "converted_to_order";

export interface RfqItem {
  id: string;
  productName: string;
  brand: string;
  quantity: number;
  unit: string;
  unitPrice?: number;
  totalPrice?: number;
  notes?: string;
}

export interface RfqQuoteDetails {
  quoteNumber: string;
  subtotal: number;
  projectDiscount: number;
  vatTax: number;
  payableTotal: number;
  validUntil: string;
  expertName: string;
  expertPhone: string;
}

export interface DashboardRfq {
  id: string;
  rfqNumber: string;
  projectTitle: string;
  clientName: string;
  projectLocation: string;
  createdAt: string;
  status: RfqStatus;
  statusLabel: string;
  urgency: "normal" | "urgent" | "critical";
  items: RfqItem[];
  attachedFileName?: string;
  quote?: RfqQuoteDetails;
  notes?: string;
}
