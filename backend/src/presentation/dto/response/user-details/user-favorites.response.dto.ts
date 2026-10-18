import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { UserFavoriteDetails } from '../../../../domain/entities/user-detail.types.js';

export class UserFavoriteResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  productId: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  slug: string;

  @ApiPropertyOptional()
  sku?: string;

  @ApiPropertyOptional()
  brand?: string;

  @ApiPropertyOptional()
  category?: string;

  @ApiProperty()
  basePrice: number;

  @ApiProperty()
  ratingAvg: number;

  @ApiProperty()
  inStock: boolean;

  @ApiPropertyOptional()
  imageUrl?: string;

  @ApiProperty()
  addedAt: string;

  static fromDomain(fav: UserFavoriteDetails): UserFavoriteResponseDto {
    return {
      id: fav.id,
      productId: fav.productId,
      title: fav.title,
      slug: fav.slug,
      sku: fav.sku,
      brand: fav.brand,
      category: fav.category,
      basePrice: fav.basePrice,
      ratingAvg: fav.ratingAvg,
      inStock: fav.inStock,
      imageUrl: fav.imageUrl,
      addedAt: fav.addedAt ? new Date(fav.addedAt).toLocaleDateString('fa-IR') : 'نامشخص',
    };
  }
}
