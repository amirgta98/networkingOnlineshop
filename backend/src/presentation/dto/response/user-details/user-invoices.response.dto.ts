import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UserInvoiceItemResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  quantity: number;

  @ApiProperty()
  unitPrice: number;

  @ApiProperty()
  totalPrice: number;

  @ApiProperty()
  taxAmount: number;

  static fromDomain(item: any): UserInvoiceItemResponseDto {
    return {
      id: item.id,
      title: item.title,
      quantity: Number(item.quantity),
      unitPrice: Number(item.unitPrice),
      totalPrice: Number(item.totalPrice),
      taxAmount: Number(item.taxAmount || 0),
    };
  }
}

export class UserInvoiceResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  invoiceNumber: string;

  @ApiProperty()
  trackingCode: string;

  @ApiProperty()
  type: string;

  @ApiProperty()
  typeLabel: string;

  @ApiProperty()
  status: string;

  @ApiProperty()
  statusLabel: string;

  @ApiProperty()
  paymentStatus: string;

  @ApiProperty()
  paymentStatusLabel: string;

  @ApiProperty()
  subtotal: number;

  @ApiProperty()
  taxAmount: number;

  @ApiProperty()
  discountAmount: number;

  @ApiProperty()
  shippingCost: number;

  @ApiProperty()
  totalAmount: number;

  @ApiProperty()
  customerName: string;

  @ApiProperty()
  customerPhone: string;

  @ApiPropertyOptional()
  companyName?: string;

  @ApiProperty()
  createdAt: string;

  @ApiProperty({ type: [UserInvoiceItemResponseDto] })
  items: UserInvoiceItemResponseDto[];

  static fromDomain(inv: any): UserInvoiceResponseDto {
    return {
      id: inv.id,
      invoiceNumber: inv.invoiceNumber,
      trackingCode: inv.trackingCode,
      type: inv.type,
      typeLabel: inv.typeLabel || (inv.type === 'OFFICIAL' ? 'فاکتور رسمی مالیاتی' : 'پیش‌فاکتور / غیررسمی'),
      status: inv.status,
      statusLabel: inv.statusLabel || (inv.status === 'ISSUED' ? 'صادر شده' : inv.status),
      paymentStatus: inv.paymentStatus,
      paymentStatusLabel: inv.paymentStatusLabel || (inv.paymentStatus === 'PAID' ? 'پرداخت شده' : 'پرداخت نشده'),
      subtotal: Number(inv.subtotal),
      taxAmount: Number(inv.taxAmount),
      discountAmount: Number(inv.discountAmount || 0),
      shippingCost: Number(inv.shippingCost || 0),
      totalAmount: Number(inv.totalAmount),
      customerName: inv.customerName || '',
      customerPhone: inv.customerPhone || '',
      companyName: inv.companyName || undefined,
      createdAt: typeof inv.createdAt === 'string' ? inv.createdAt : new Date(inv.createdAt).toLocaleDateString('fa-IR'),
      items: (inv.items || []).map((it: any) => UserInvoiceItemResponseDto.fromDomain(it)),
    };
  }
}
