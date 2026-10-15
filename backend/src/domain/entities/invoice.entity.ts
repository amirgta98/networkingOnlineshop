export type InvoiceType = 'UNOFFICIAL' | 'OFFICIAL';

export type InvoiceStatus =
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'REJECTED'
  | 'ISSUED'
  | 'CANCELLED';

export type InvoicePaymentStatus = 'UNPAID' | 'PAID';

export interface InvoiceLegalDetails {
  companyName: string;
  registrationNumber: string;
  nationalId: string;
  economicCode: string;
  postalCode: string;
  phoneNumber: string;
  address: string;
}

export interface InvoiceItemProps {
  id?: string;
  invoiceId?: string;
  productId?: string | null;
  title: string;
  sku?: string | null;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  taxAmount?: number;
  createdAt?: Date;
}

export class InvoiceItemEntity {
  public readonly id: string;
  public readonly invoiceId?: string;
  public readonly productId?: string | null;
  public readonly title: string;
  public readonly sku?: string | null;
  public readonly quantity: number;
  public readonly unitPrice: number;
  public readonly totalPrice: number;
  public readonly taxAmount: number;
  public readonly createdAt: Date;

  constructor(props: InvoiceItemProps) {
    this.id = props.id || crypto.randomUUID();
    this.invoiceId = props.invoiceId;
    this.productId = props.productId ?? null;
    this.title = props.title;
    this.sku = props.sku ?? null;
    this.quantity = props.quantity > 0 ? props.quantity : 1;
    this.unitPrice = Number(props.unitPrice) || 0;
    this.totalPrice = props.totalPrice !== undefined ? Number(props.totalPrice) : this.unitPrice * this.quantity;
    this.taxAmount = Number(props.taxAmount) || 0;
    this.createdAt = props.createdAt ?? new Date();
  }
}

export interface InvoiceProps {
  id: string;
  invoiceNumber: string;
  trackingCode: string;
  userId?: string | null;
  type: InvoiceType;
  status: InvoiceStatus;
  paymentStatus?: InvoicePaymentStatus;
  paymentMethod?: string | null;

  // Financials
  subtotal: number;
  taxRatePercent?: number; // 0 for unofficial, 10 for official
  taxAmount: number;
  discountAmount?: number;
  shippingCost?: number;
  totalAmount: number;

  // Customer snapshot
  customerName?: string | null;
  customerPhone?: string | null;
  customerAddress?: string | null;
  customerPostalCode?: string | null;

  // Official Legal Organization Data
  legalDetails?: InvoiceLegalDetails | null;

  // Tax System & Approval
  taxSystemId?: string | null;
  officialApprovedAt?: Date | null;
  officialApprovedBy?: string | null;
  rejectionReason?: string | null;
  adminNotes?: string | null;

  items?: InvoiceItemProps[] | InvoiceItemEntity[];

  createdAt?: Date;
  updatedAt?: Date;
}

export class InvoiceEntity {
  public readonly id: string;
  public readonly invoiceNumber: string;
  public readonly trackingCode: string;
  public readonly userId?: string | null;
  public readonly type: InvoiceType;
  public status: InvoiceStatus;
  public paymentStatus: InvoicePaymentStatus;
  public paymentMethod?: string | null;

  // Financials
  public readonly subtotal: number;
  public readonly taxRatePercent: number;
  public readonly taxAmount: number;
  public readonly discountAmount: number;
  public readonly shippingCost: number;
  public readonly totalAmount: number;

  // Customer snapshot
  public readonly customerName?: string | null;
  public readonly customerPhone?: string | null;
  public readonly customerAddress?: string | null;
  public readonly customerPostalCode?: string | null;

  // Official Legal Details
  public readonly legalDetails?: InvoiceLegalDetails | null;

  // Official Tax System & Approval
  public taxSystemId?: string | null;
  public officialApprovedAt?: Date | null;
  public officialApprovedBy?: string | null;
  public rejectionReason?: string | null;
  public adminNotes?: string | null;

  public readonly items: InvoiceItemEntity[];

  public readonly createdAt: Date;
  public updatedAt: Date;

  constructor(props: InvoiceProps) {
    this.id = props.id;
    this.invoiceNumber = props.invoiceNumber;
    this.trackingCode = props.trackingCode;
    this.userId = props.userId ?? null;
    this.type = props.type;
    this.status = props.status;
    this.paymentStatus = props.paymentStatus ?? 'UNPAID';
    this.paymentMethod = props.paymentMethod ?? null;

    this.subtotal = Number(props.subtotal) || 0;
    this.taxRatePercent = props.taxRatePercent !== undefined ? Number(props.taxRatePercent) : props.type === 'OFFICIAL' ? 10 : 0;
    this.taxAmount = Number(props.taxAmount) || 0;
    this.discountAmount = Number(props.discountAmount) || 0;
    this.shippingCost = Number(props.shippingCost) || 0;
    this.totalAmount = Number(props.totalAmount) || 0;

    this.customerName = props.customerName ?? null;
    this.customerPhone = props.customerPhone ?? null;
    this.customerAddress = props.customerAddress ?? null;
    this.customerPostalCode = props.customerPostalCode ?? null;

    this.legalDetails = props.legalDetails ?? null;

    this.taxSystemId = props.taxSystemId ?? null;
    this.officialApprovedAt = props.officialApprovedAt ?? null;
    this.officialApprovedBy = props.officialApprovedBy ?? null;
    this.rejectionReason = props.rejectionReason ?? null;
    this.adminNotes = props.adminNotes ?? null;

    this.items = (props.items || []).map((it) =>
      it instanceof InvoiceItemEntity ? it : new InvoiceItemEntity(it),
    );

    this.createdAt = props.createdAt ?? new Date();
    this.updatedAt = props.updatedAt ?? new Date();
  }

  public get isOfficial(): boolean {
    return this.type === 'OFFICIAL';
  }

  public get isPendingApproval(): boolean {
    return this.status === 'PENDING_APPROVAL';
  }

  public get isApproved(): boolean {
    return this.status === 'APPROVED' || this.status === 'ISSUED';
  }

  /**
   * Admin officially approves and issues the official invoice (ثبت رسمی)
   */
  public approveOfficial(taxSystemId: string, approvedBy?: string): void {
    if (this.type !== 'OFFICIAL') {
      throw new Error('فقط فاکتورهای رسمی امکان تایید و ثبت در سامانه مودیان را دارند.');
    }
    this.status = 'APPROVED';
    this.taxSystemId = taxSystemId;
    this.officialApprovedAt = new Date();
    this.officialApprovedBy = approvedBy || 'سیستم مدیریت';
    this.rejectionReason = null;
    this.updatedAt = new Date();
  }

  /**
   * Admin rejects official invoice request
   */
  public rejectOfficial(reason: string, rejectedBy?: string): void {
    if (this.type !== 'OFFICIAL') {
      throw new Error('فقط فاکتورهای رسمی قابلیت رد درخواست را دارند.');
    }
    this.status = 'REJECTED';
    this.rejectionReason = reason;
    this.adminNotes = rejectedBy ? `رد شده توسط: ${rejectedBy}` : null;
    this.updatedAt = new Date();
  }

  public markAsPaid(): void {
    this.paymentStatus = 'PAID';
    this.updatedAt = new Date();
  }
}
