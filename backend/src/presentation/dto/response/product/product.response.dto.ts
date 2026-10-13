import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ProductFeatureResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  description: string;

  @ApiPropertyOptional()
  iconUrl?: string;

  @ApiPropertyOptional()
  iconName?: string;

  @ApiProperty()
  sortOrder: number;
}

export class ProductResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  slug: string;

  @ApiProperty()
  sku: string;

  @ApiProperty()
  category: string;

  @ApiProperty()
  brand: string;

  @ApiProperty()
  price: number;

  @ApiPropertyOptional()
  originalPrice?: number;

  @ApiProperty()
  costPrice: number;

  @ApiProperty()
  stock: number;

  @ApiProperty()
  minStockAlert: number;

  @ApiProperty()
  reservedStock: number;

  @ApiProperty()
  warehouseLocation: string;

  @ApiProperty()
  status: string;

  @ApiProperty()
  featured: boolean;

  @ApiPropertyOptional()
  isSpecialOffer?: boolean;

  @ApiPropertyOptional()
  discountPercent?: number;

  @ApiPropertyOptional()
  inStock?: boolean;

  @ApiProperty()
  rating: number;

  @ApiProperty()
  reviewCount: number;

  @ApiProperty({ type: [String] })
  images: string[];

  @ApiProperty()
  warranty: string;

  @ApiProperty({ type: [String] })
  badges: string[];

  @ApiProperty({ type: [String] })
  specs: string[];

  @ApiPropertyOptional({ type: [ProductFeatureResponseDto] })
  features?: ProductFeatureResponseDto[];

  @ApiPropertyOptional({ type: [String] })
  relatedProductIds?: string[];

  @ApiPropertyOptional({ type: () => [ProductResponseDto] })
  relatedProducts?: any[];

  @ApiProperty()
  shortDescription: string;

  @ApiPropertyOptional()
  fullDescription?: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class PaginatedProductsResponseDto {
  @ApiProperty({ type: [ProductResponseDto] })
  products: ProductResponseDto[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;

  @ApiProperty()
  totalPages: number;
}
