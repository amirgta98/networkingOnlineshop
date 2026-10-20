import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SpecialOfferCampaignEntity, SpecialOfferItemEntity } from '../../../../domain/entities/special-offer.entity.js';

export class SpecialOfferProductDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  slug!: string;

  @ApiPropertyOptional()
  sku?: string;

  @ApiProperty()
  price!: number; // Special offer price

  @ApiProperty()
  originalPrice!: number; // Regular catalog price

  @ApiProperty()
  discountPercent!: number;

  @ApiProperty()
  stockRemaining!: number;

  @ApiProperty()
  stockTotal!: number;

  @ApiProperty()
  inStock!: boolean;

  @ApiProperty({ type: [String] })
  images!: string[];

  @ApiPropertyOptional()
  brand?: string;

  @ApiPropertyOptional()
  category?: string;

  @ApiPropertyOptional()
  description?: string;

  @ApiPropertyOptional({ type: [String] })
  specs?: string[];

  @ApiPropertyOptional()
  saleEndsAt?: string;
}

export class SpecialOfferCampaignResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  title!: string;

  @ApiPropertyOptional()
  tagline?: string | null;

  @ApiPropertyOptional()
  description?: string | null;

  @ApiPropertyOptional()
  bannerUrl?: string | null;

  @ApiProperty()
  startDate!: string;

  @ApiPropertyOptional({ description: 'تاریخ و ساعت شروع به تقویم شمسی' })
  startDateJalali?: string;

  @ApiProperty()
  endDate!: string;

  @ApiPropertyOptional({ description: 'تاریخ و ساعت پایان به تقویم شمسی' })
  endDateJalali?: string;

  @ApiProperty()
  status!: string;

  @ApiProperty()
  computedStatus!: string;

  @ApiProperty()
  priority!: number;

  @ApiProperty()
  isPublished!: boolean;

  @ApiProperty()
  itemsCount!: number;

  @ApiProperty({ type: [Object] })
  items!: any[];

  @ApiProperty({ type: [SpecialOfferProductDto] })
  products!: SpecialOfferProductDto[];

  @ApiProperty()
  createdAt!: string;

  @ApiProperty()
  updatedAt!: string;

  static fromEntity(
    entity: SpecialOfferCampaignEntity,
    options?: { onlyAvailable?: boolean },
  ): SpecialOfferCampaignResponseDto {
    const rawItems = options?.onlyAvailable ? entity.getAvailableItems() : entity.items;
    const json = entity.toJSON();
    const products: SpecialOfferProductDto[] = rawItems.map((it: SpecialOfferItemEntity) => {
      const p = it.product;
      const originalPrice = it.originalPrice || (p ? p.basePrice : 0);
      const specialPrice = it.specialPrice;
      const discountPercent = it.getDiscountPercent();
      const stockRemaining = it.getStockRemaining();
      const stockTotal = it.getStockTotal();

      return {
        id: it.productId,
        name: p?.name || 'کالای فروش ویژه',
        slug: p?.slug || `offer-${it.productId}`,
        sku: p?.sku || undefined,
        price: specialPrice,
        originalPrice,
        discountPercent,
        stockRemaining,
        stockTotal,
        inStock: stockRemaining > 0,
        images: p?.images && p.images.length > 0 ? p.images : ['/uploads/products/sample-router-1.webp'],
        brand: p?.brand || undefined,
        category: p?.category || undefined,
        description: p?.shortDescription || undefined,
        specs: p?.specs || [],
        saleEndsAt: entity.endDate.toISOString(),
      };
    });

    const formatJalali = (d: Date) => {
      try {
        return new Intl.DateTimeFormat('fa-IR-u-ca-persian', {
          timeZone: 'Asia/Tehran',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }).format(d);
      } catch {
        return d.toISOString();
      }
    };

    return {
      ...json,
      items: options?.onlyAvailable ? rawItems.map((it) => it.toJSON()) : json.items,
      itemsCount: options?.onlyAvailable ? rawItems.length : json.itemsCount,
      startDateJalali: formatJalali(entity.startDate),
      endDateJalali: formatJalali(entity.endDate),
      products,
    };
  }
}

export class ActiveSpecialOfferResponseDto {
  @ApiPropertyOptional({ type: SpecialOfferCampaignResponseDto })
  campaign!: SpecialOfferCampaignResponseDto | null;

  @ApiPropertyOptional({ type: [SpecialOfferProductDto] })
  products!: SpecialOfferProductDto[];

  @ApiPropertyOptional()
  title?: string;

  @ApiPropertyOptional()
  subtitle?: string;

  @ApiPropertyOptional()
  targetDate?: string;
}
