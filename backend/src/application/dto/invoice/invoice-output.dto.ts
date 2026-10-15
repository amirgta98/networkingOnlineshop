import {
  InvoiceEntity,
  InvoiceType,
  InvoiceStatus,
  InvoicePaymentStatus,
  InvoiceLegalDetails,
} from '../../../domain/entities/invoice.entity.js';

export interface InvoiceItemOutputDto {
  id: string;
  productId?: string | null;
  title: string;
  sku?: string | null;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  taxAmount: number;
}

export interface InvoiceOutputDto {
  id: string;
  invoiceNumber: string;
  trackingCode: string;
  userId?: string | null;
  type: InvoiceType;
  typeLabel: string;
  status: InvoiceStatus;
  statusLabel: string;
  paymentStatus: InvoicePaymentStatus;
  paymentMethod?: string | null;

  subtotal: number;
  taxRatePercent: number;
  taxAmount: number;
  discountAmount: number;
  shippingCost: number;
  totalAmount: number;

  customerName?: string | null;
  customerPhone?: string | null;
  customerAddress?: string | null;
  customerPostalCode?: string | null;

  legalDetails?: InvoiceLegalDetails | null;

  taxSystemId?: string | null;
  officialApprovedAt?: string | null;
  officialApprovedBy?: string | null;
  rejectionReason?: string | null;
  adminNotes?: string | null;

  items: InvoiceItemOutputDto[];
  createdAt: string;
  updatedAt: string;
}

export function toInvoiceOutputDto(entity: InvoiceEntity): InvoiceOutputDto {
  const typeLabel = entity.type === 'OFFICIAL' ? 'فاکتور رسمی مالیاتی' : 'فاکتور غیر رسمی';

  let statusLabel = 'صادر شده';
  switch (entity.status) {
    case 'PENDING_APPROVAL':
      statusLabel = 'در انتظار ثبت رسمی';
      break;
    case 'APPROVED':
      statusLabel = 'ثبت شده رسمی';
      break;
    case 'REJECTED':
      statusLabel = 'رد شده';
      break;
    case 'ISSUED':
      statusLabel = 'صادر شده';
      break;
    case 'CANCELLED':
      statusLabel = 'لغو شده';
      break;
  }

  return {
    id: entity.id,
    invoiceNumber: entity.invoiceNumber,
    trackingCode: entity.trackingCode,
    userId: entity.userId ?? null,
    type: entity.type,
    typeLabel,
    status: entity.status,
    statusLabel,
    paymentStatus: entity.paymentStatus,
    paymentMethod: entity.paymentMethod ?? null,
    subtotal: entity.subtotal,
    taxRatePercent: entity.taxRatePercent,
    taxAmount: entity.taxAmount,
    discountAmount: entity.discountAmount,
    shippingCost: entity.shippingCost,
    totalAmount: entity.totalAmount,
    customerName: entity.customerName ?? null,
    customerPhone: entity.customerPhone ?? null,
    customerAddress: entity.customerAddress ?? null,
    customerPostalCode: entity.customerPostalCode ?? null,
    legalDetails: entity.legalDetails ?? null,
    taxSystemId: entity.taxSystemId ?? null,
    officialApprovedAt: entity.officialApprovedAt ? entity.officialApprovedAt.toISOString() : null,
    officialApprovedBy: entity.officialApprovedBy ?? null,
    rejectionReason: entity.rejectionReason ?? null,
    adminNotes: entity.adminNotes ?? null,
    items: entity.items.map((it) => ({
      id: it.id,
      productId: it.productId ?? null,
      title: it.title,
      sku: it.sku ?? null,
      quantity: it.quantity,
      unitPrice: it.unitPrice,
      totalPrice: it.totalPrice,
      taxAmount: it.taxAmount,
    })),
    createdAt: entity.createdAt.toISOString(),
    updatedAt: entity.updatedAt.toISOString(),
  };
}
