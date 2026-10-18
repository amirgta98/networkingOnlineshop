import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Order } from '../../../../domain/entities/order.entity.js';

export class OrderItemResponseDto {
  @ApiProperty({ example: 'item-uuid' })
  id!: string;

  @ApiPropertyOptional({ example: 'd0000000-0000-0000-0000-000000000001' })
  productId?: string;

  @ApiProperty({ example: 'WS-C2960X-24PS-L' })
  sku!: string;

  @ApiProperty({ example: 'سوئیچ ۲۴ پورت سیسکو مدل WS-C2960X-24PS-L' })
  title!: string;

  @ApiPropertyOptional({ example: 'Cisco' })
  brand?: string;

  @ApiPropertyOptional({ example: 'Catalyst 2960-X' })
  model?: string;

  @ApiProperty({ example: 18200000 })
  unitPrice!: number;

  @ApiProperty({ example: 2 })
  quantity!: number;

  @ApiProperty({ example: 36400000 })
  totalPrice!: number;

  @ApiPropertyOptional({ example: 'گارانتی طلایی ۳۶ ماهه تعویض درجا ققنوس' })
  warranty?: string;

  @ApiProperty({ type: [String], example: [] })
  serialNumbers!: string[];
}

export class OrderShippingAddressResponseDto {
  @ApiProperty({ example: 'تهران' })
  city!: string;

  @ApiProperty({ example: 'تهران' })
  province!: string;

  @ApiProperty({ example: 'خیابان ولیعصر، پلاک ۳۴' })
  fullAddress!: string;

  @ApiProperty({ example: '1998765432' })
  postalCode!: string;

  @ApiProperty({ example: 'مهندس عرفان رضایی' })
  recipientName!: string;

  @ApiProperty({ example: '09121234567' })
  recipientPhone!: string;
}

export class AdminOrderResponseDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  id!: string;

  @ApiProperty({ example: 'VX-9421' })
  orderNumber!: string;

  @ApiProperty({ example: 'NET-18492041' })
  trackingCode!: string;

  @ApiProperty({ example: 'مهندس عرفان رضایی' })
  customerName!: string;

  @ApiProperty({ example: 'retail', enum: ['retail', 'b2b'] })
  customerType!: 'retail' | 'b2b';

  @ApiPropertyOptional({ example: 'شرکت فناوران شبکه' })
  companyName?: string;

  @ApiPropertyOptional({ example: '10103567890' })
  nationalCode?: string;

  @ApiProperty({ example: '09121234567' })
  phoneNumber!: string;

  @ApiProperty({ example: '۱۴۰۵/۰۷/۲۷ - ۲۱:۳۰' })
  createdAt!: string;

  @ApiProperty({ example: 'pending_financial' })
  status!: string;

  @ApiProperty({ example: 'در انتظار تایید مالی' })
  statusLabel!: string;

  @ApiProperty({ example: 36400000 })
  totalAmount!: number;

  @ApiProperty({ example: 500000 })
  discountAmount!: number;

  @ApiProperty({ example: 3590000 })
  vatTaxAmount!: number;

  @ApiProperty({ example: 39490000 })
  payableAmount!: number;

  @ApiProperty({ example: 'online_gateway' })
  paymentMethod!: string;

  @ApiPropertyOptional({ example: 'SHP-918241' })
  paymentReceiptNumber?: string;

  @ApiPropertyOptional({ example: '' })
  paymentReceiptUrl?: string;

  @ApiProperty({ example: false })
  isPaymentVerified!: boolean;

  @ApiPropertyOptional({ example: 'tipax' })
  carrier?: string;

  @ApiPropertyOptional({ example: 'تیپاکس اکسپرس' })
  carrierName?: string;

  @ApiPropertyOptional({ example: 'TPX-9482104' })
  carrierTrackingCode?: string;

  @ApiPropertyOptional({ example: '' })
  carrierTrackingUrl?: string;

  @ApiProperty({ type: OrderShippingAddressResponseDto })
  shippingAddress!: OrderShippingAddressResponseDto;

  @ApiProperty({ type: [OrderItemResponseDto] })
  items!: OrderItemResponseDto[];

  @ApiPropertyOptional({ example: 'هماهنگی قبلی انجام شود' })
  adminNotes?: string;

  public static fromDomain(order: Order): AdminOrderResponseDto {
    const statusMap: Record<string, { key: string; label: string }> = {
      PENDING_FINANCIAL: { key: 'pending_financial', label: 'در انتظار تایید مالی' },
      PROCESSING_WAREHOUSE: { key: 'processing_warehouse', label: 'بسته‌بندی و انبار' },
      SHIPPING: { key: 'shipping', label: 'ناوگان ارسال' },
      DELIVERED: { key: 'delivered', label: 'تحویل موفق' },
      CANCELLED: { key: 'cancelled', label: 'لغو شده' },
    };

    const mappedStatus = statusMap[order.status] || {
      key: order.status.toLowerCase(),
      label: order.status,
    };

    const addr = order.shippingAddress || {};
    const fullAddr =
      addr.fullAddress ||
      addr.address ||
      `${addr.province || ''}، ${addr.city || ''}، ${addr.address || ''}`;

    const carrierNames: Record<string, string> = {
      tipax: 'تیپاکس اکسپرس',
      chapar: 'چاپار هوایی',
      freight: 'باربری و ناوگان سنگین',
      express: 'پیک اختصاصی ققنوس',
      express_courier: 'پیک اختصاصی ققنوس',
      tipax_express: 'تیپاکس اکسپرس',
      heavy_freight: 'باربری و ناوگان سنگین',
      post_pishtaz: 'پست پیشتاز',
      warehouse_pickup: 'تحویل حضوری در انبار مرکزی',
    };

    return {
      id: order.id,
      orderNumber: order.orderNumber,
      trackingCode: order.trackingCode,
      customerName: order.customerName,
      customerType: order.customerType,
      companyName: order.companyName ?? undefined,
      nationalCode: order.nationalCode ?? undefined,
      phoneNumber: order.phoneNumber,
      createdAt: order.createdAt
        ? new Date(order.createdAt).toLocaleDateString('fa-IR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
          })
        : 'نامشخص',
      status: mappedStatus.key,
      statusLabel: mappedStatus.label,
      totalAmount: order.totalAmount,
      discountAmount: order.discountAmount,
      vatTaxAmount: order.vatTaxAmount,
      payableAmount: order.payableAmount,
      paymentMethod: order.paymentMethod,
      isPaymentVerified: order.status !== 'PENDING_FINANCIAL' && order.status !== 'CANCELLED',
      carrier: order.shippingCarrier ?? undefined,
      carrierName: order.shippingCarrier ? carrierNames[order.shippingCarrier] || order.shippingCarrier : undefined,
      carrierTrackingCode: order.shippingCarrier ? order.trackingCode : undefined,
      shippingAddress: {
        city: addr.city || 'تهران',
        province: addr.province || 'تهران',
        fullAddress: fullAddr,
        postalCode: addr.postalCode || '',
        recipientName: addr.recipientName || order.customerName,
        recipientPhone: addr.phoneNumber || order.phoneNumber,
      },
      items: order.items.map((it) => ({
        id: it.id,
        productId: it.productId ?? undefined,
        sku: it.sku,
        title: it.title,
        brand: it.brand ?? 'Cisco',
        model: it.model ?? it.sku,
        unitPrice: it.unitPrice,
        quantity: it.quantity,
        totalPrice: it.totalPrice,
        warranty: it.warranty ?? 'گارانتی طلایی ۳۶ ماهه تعویض درجا ققنوس',
        serialNumbers: it.serialNumbers || [],
      })),
      adminNotes: order.deliveryNotes ?? undefined,
    };
  }
}

export class OrderFinancialSummaryResponseDto {
  @ApiProperty({ example: 36400000 })
  subtotal!: number;

  @ApiProperty({ example: 0 })
  discountTotal!: number;

  @ApiProperty({ example: 0 })
  couponDiscount!: number;

  @ApiProperty({ example: 45000 })
  shippingCost!: number;

  @ApiProperty({ example: 0 })
  vatTax!: number;

  @ApiProperty({ example: 36445000 })
  payableTotal!: number;

  @ApiProperty({ example: false })
  isFreeShipping!: boolean;
}

export class PlacedOrderResponseDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  orderId!: string;

  @ApiProperty({ example: 'VX-9421' })
  orderNumber!: string;

  @ApiProperty({ example: 'NET-18492041' })
  trackingCode!: string;

  @ApiProperty({ example: '2026-10-19T02:00:00.000Z' })
  createdAt!: string;

  @ApiProperty({ example: 'pending_financial' })
  status!: string;

  @ApiProperty({ example: 'در انتظار تایید مالی' })
  statusLabel!: string;

  @ApiProperty({ type: [OrderItemResponseDto] })
  items!: OrderItemResponseDto[];

  @ApiProperty()
  shippingAddress!: any;

  @ApiProperty({ type: OrderFinancialSummaryResponseDto })
  financialSummary!: OrderFinancialSummaryResponseDto;

  @ApiProperty()
  paymentMethod!: {
    id: string;
    type: string;
    title: string;
  };

  @ApiProperty({ example: 'pending_transfer' })
  paymentStatus!: string;
}
