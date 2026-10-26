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
  name: string;

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
  price: number;

  @ApiPropertyOptional()
  originalPrice?: number;

  @ApiPropertyOptional()
  discountPercent?: number;

  @ApiProperty()
  ratingAvg: number;

  @ApiProperty()
  rating: number;

  @ApiProperty()
  inStock: boolean;

  @ApiPropertyOptional()
  imageUrl?: string;

  @ApiPropertyOptional({ type: [String] })
  images?: string[];

  @ApiProperty()
  addedAt: string;

  @ApiPropertyOptional()
  product?: any;

  static fromDomain(fav: UserFavoriteDetails): UserFavoriteResponseDto {
    const images = fav.images && fav.images.length > 0
      ? fav.images
      : (fav.imageUrl ? [fav.imageUrl] : []);

    const price = fav.basePrice;
    const originalPrice = fav.originalPrice;
    const discountPercent =
      fav.discountPercent !== undefined
        ? fav.discountPercent
        : originalPrice && originalPrice > price
        ? Math.round(((originalPrice - price) / originalPrice) * 100)
        : undefined;

    return {
      id: fav.id,
      productId: fav.productId,
      title: fav.title,
      name: fav.title,
      slug: fav.slug,
      sku: fav.sku,
      brand: fav.brand || 'تجهیزات شبکه',
      category: fav.category || 'switches',
      basePrice: fav.basePrice,
      price: fav.basePrice,
      originalPrice,
      discountPercent,
      ratingAvg: fav.ratingAvg,
      rating: fav.ratingAvg,
      inStock: fav.inStock,
      imageUrl: fav.imageUrl || images[0],
      images,
      addedAt: fav.addedAt
        ? (fav.addedAt instanceof Date ? fav.addedAt.toISOString() : String(fav.addedAt))
        : new Date().toISOString(),
      product: {
        id: fav.productId,
        name: fav.title,
        slug: fav.slug,
        sku: fav.sku,
        brand: fav.brand || 'تجهیزات شبکه',
        category: fav.category || 'switches',
        price: fav.basePrice,
        originalPrice,
        discountPercent,
        rating: fav.ratingAvg,
        reviewCount: 0,
        inStock: fav.inStock,
        images,
        featured: false,
        specs: [],
        badges: [],
        description: '',
      },
    };
  }
}
