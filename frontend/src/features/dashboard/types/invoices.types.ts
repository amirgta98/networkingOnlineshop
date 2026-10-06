export type InvoiceStatus = "paid" | "unpaid" | "cancelled";
export type InvoiceType = "official_legal" | "personal_standard";

export interface InvoicePartyInfo {
  name: string;
  nationalIdOrEconomicCode: string;
  registrationNumber?: string;
  phone: string;
  address: string;
  postalCode: string;
}

export interface InvoiceItem {
  id: string;
  rowNumber: number;
  productCode: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  discount: number;
  netPrice: number;
  taxRate: number; // e.g. 0.10 for 10% VAT
  taxAmount: number;
  totalWithTax: number;
}

export interface DashboardInvoice {
  id: string;
  invoiceNumber: string;
  moaddianTaxId?: string; // 22-digit electronic tax fiscal memory ID
  orderId: string;
  orderNumber: string;
  createdAt: string;
  dueDate?: string;
  status: InvoiceStatus;
  statusLabel: string;
  type: InvoiceType;
  typeLabel: string;
  sellerInfo: InvoicePartyInfo;
  buyerInfo: InvoicePartyInfo;
  items: InvoiceItem[];
  subtotal: number;
  totalDiscount: number;
  totalTax: number; // 10% VAT
  payableTotal: number;
  paymentMethodTitle: string;
  paymentTrackingCode?: string;
}
