export type AdminInvoiceType = "type_1" | "type_2";
export type AdminInvoicePaymentStatus = "paid" | "unpaid" | "partial";
export type AdminInvoiceTaxStatus = "synced" | "pending" | "failed";

export interface AdminInvoiceLineItem {
  id: string;
  sku: string;
  title: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  taxRatePercent: number; // typically 10%
  taxAmount: number;
}

export interface AdminInvoice {
  id: string;
  invoiceNumber: string;
  taxSystemId?: string; // 22-character unique tax code (شناسه یکتای مالیاتی سامانه مودیان)
  orderId: string;
  orderTrackingCode: string;
  invoiceType: AdminInvoiceType; // Type 1: B2B with economic code, Type 2: Retail
  clientName: string;
  companyName?: string;
  nationalId: string; // شناسه ملی / کد ملی
  economicCode?: string; // کد اقتصادی ۱۲ رقمی
  issueDate: string;
  dueDate: string;
  subtotal: number;
  vatAmount: number; // 10% VAT
  totalAmount: number;
  paymentStatus: AdminInvoicePaymentStatus;
  paymentMethod: "satna" | "paya" | "cheque" | "online_gateway";
  taxSyncStatus: AdminInvoiceTaxStatus;
  taxSyncedAt?: string;
  items: AdminInvoiceLineItem[];
  notes?: string;
}
