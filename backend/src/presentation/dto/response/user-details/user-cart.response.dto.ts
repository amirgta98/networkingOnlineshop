import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { UserCartDetails, UserCartItem } from '../../../../domain/entities/user-detail.types.js';

export class UserCartItemResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  productId: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  sku: string;

  @ApiProperty()
  unitPrice: number;

  @ApiProperty()
  quantity: number;

  @ApiProperty()
  totalPrice: number;

  @ApiPropertyOptional()
  imageUrl?: string;

  @ApiProperty()
  inStock: boolean;

  static fromDomain(item: UserCartItem): UserCartItemResponseDto {
    return {
      id: item.id,
      productId: item.productId,
      title: item.title,
      sku: item.sku,
      unitPrice: item.unitPrice,
      quantity: item.quantity,
      totalPrice: item.totalPrice,
      imageUrl: item.imageUrl,
      inStock: item.inStock,
    };
  }
}

export class UserCartResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  totalItems: number;

  @ApiProperty()
  totalAmount: number;

  @ApiProperty()
  updatedAt: string;

  @ApiProperty({ type: [UserCartItemResponseDto] })
  items: UserCartItemResponseDto[];

  static fromDomain(cart: UserCartDetails | null): UserCartResponseDto | null {
    if (!cart) return null;
    return {
      id: cart.id,
      userId: cart.userId,
      totalItems: cart.totalItems,
      totalAmount: cart.totalAmount,
      updatedAt: cart.updatedAt ? new Date(cart.updatedAt).toLocaleDateString('fa-IR') : 'نامشخص',
      items: (cart.items || []).map(UserCartItemResponseDto.fromDomain),
    };
  }
}
