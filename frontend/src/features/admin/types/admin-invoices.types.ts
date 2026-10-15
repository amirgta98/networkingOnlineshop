export type AdminInvoiceType = "type_1" | "type_2";
export type AdminInvoicePaymentStatus = "paid" | "unpaid" | "partial";
export type AdminInvoiceTaxStatus = "synced" | "pending" | "failed" | "rejected";

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
  invoiceType: AdminInvoiceType; // Type 1: B2B with economic code (Official), Type 2: Retail (Unofficial)
  rawType?: string; // OFFICIAL | UNOFFICIAL
  clientName: string;
  companyName?: string;
  registrationNumber?: string;
  nationalId: string; // شناسه ملی / کد ملی
  economicCode?: string; // کد اقتصادی ۱۲ رقمی
  postalCode?: string; // کد پستی ۱۰ رقمی دفتر مرکزی
  phone?: string; // شماره تلفن ثابت شرکت با پیش‌شماره
  address?: string; // نشانی کامل دفتر مرکزی مطابق روزنامه رسمی
  issueDate: string;
  dueDate: string;
  subtotal: number;
  vatAmount: number; // 10% VAT
  totalAmount: number;
  paymentStatus: AdminInvoicePaymentStatus;
  paymentMethod: "satna" | "paya" | "cheque" | "online_gateway" | string;
  taxSyncStatus: AdminInvoiceTaxStatus;
  taxSyncedAt?: string;
  rejectionReason?: string;
  items: AdminInvoiceLineItem[];
  notes?: string;
}
