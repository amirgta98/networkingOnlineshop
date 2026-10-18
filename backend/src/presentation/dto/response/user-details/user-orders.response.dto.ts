import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { UserOrderDetails, UserOrderItem } from '../../../../domain/entities/user-detail.types.js';

export class UserOrderItemResponseDto {
  @ApiProperty()
  id: string;

  @ApiPropertyOptional()
  productId?: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  sku: string;

  @ApiPropertyOptional()
  brand?: string;

  @ApiPropertyOptional()
  model?: string;

  @ApiProperty()
  unitPrice: number;

  @ApiProperty()
  quantity: number;

  @ApiProperty()
  totalPrice: number;

  @ApiPropertyOptional()
  warranty?: string;

  @ApiProperty({ type: [String] })
  serialNumbers: string[];

  static fromDomain(item: UserOrderItem): UserOrderItemResponseDto {
    return {
      id: item.id,
      productId: item.productId,
      title: item.title,
      sku: item.sku,
      brand: item.brand,
      model: item.model,
      unitPrice: item.unitPrice,
      quantity: item.quantity,
      totalPrice: item.totalPrice,
      warranty: item.warranty,
      serialNumbers: item.serialNumbers || [],
    };
  }
}

export class UserOrderResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  orderNumber: string;

  @ApiProperty()
  trackingCode: string;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  status: string;

  @ApiProperty()
  statusLabel: string;

  @ApiProperty()
  customerType: string;

  @ApiProperty()
  customerName: string;

  @ApiProperty()
  phoneNumber: string;

  @ApiPropertyOptional()
  companyName?: string;

  @ApiProperty()
  totalAmount: number;

  @ApiProperty()
  discountAmount: number;

  @ApiProperty()
  vatTaxAmount: number;

  @ApiProperty()
  payableAmount: number;

  @ApiProperty()
  paymentMethod: string;

  @ApiPropertyOptional()
  shippingCarrier?: string;

  @ApiProperty()
  shippingCost: number;

  @ApiPropertyOptional()
  deliveryNotes?: string;

  @ApiProperty()
  createdAt: string;

  @ApiProperty({ type: [UserOrderItemResponseDto] })
  items: UserOrderItemResponseDto[];

  static fromDomain(order: UserOrderDetails): UserOrderResponseDto {
    return {
      id: order.id,
      orderNumber: order.orderNumber,
      trackingCode: order.trackingCode,
      userId: order.userId,
      status: order.status,
      statusLabel: order.statusLabel,
      customerType: order.customerType,
      customerName: order.customerName,
      phoneNumber: order.phoneNumber,
      companyName: order.companyName,
      totalAmount: order.totalAmount,
      discountAmount: order.discountAmount,
      vatTaxAmount: order.vatTaxAmount,
      payableAmount: order.payableAmount,
      paymentMethod: order.paymentMethod,
      shippingCarrier: order.shippingCarrier,
      shippingCost: order.shippingCost,
      deliveryNotes: order.deliveryNotes,
      createdAt: order.createdAt ? new Date(order.createdAt).toLocaleDateString('fa-IR') : 'نامشخص',
      items: (order.items || []).map(UserOrderItemResponseDto.fromDomain),
    };
  }
}
