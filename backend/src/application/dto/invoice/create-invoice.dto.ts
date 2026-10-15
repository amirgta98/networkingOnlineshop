import { InvoiceType, InvoiceLegalDetails } from '../../../domain/entities/invoice.entity.js';

export interface CreateInvoiceItemDto {
  productId?: string;
  title: string;
  sku?: string;
  quantity: number;
  unitPrice: number;
}

export interface CreateInvoiceCommand {
  userId?: string | null;
  type: InvoiceType | 'personal' | 'legal';
  items: CreateInvoiceItemDto[];
  customerName?: string;
  customerPhone?: string;
  customerAddress?: string;
  customerPostalCode?: string;
  shippingCost?: number;
  discountAmount?: number;
  paymentMethod?: string;
  notes?: string;
  legalDetails?: InvoiceLegalDetails;
}
