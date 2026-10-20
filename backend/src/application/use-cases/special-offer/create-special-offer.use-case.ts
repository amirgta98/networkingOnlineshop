import { randomUUID } from 'node:crypto';
import type { ISpecialOfferRepository } from '../../../domain/repositories/special-offer.repository.interface.js';
import type { IProductRepository } from '../../../domain/repositories/product.repository.interface.js';
import {
  SpecialOfferCampaignEntity,
  SpecialOfferItemEntity,
} from '../../../domain/entities/special-offer.entity.js';
import { InvalidSpecialOfferException } from '../../../domain/exceptions/special-offer.exceptions.js';
import type { CreateSpecialOfferRequestDto } from '../../../presentation/dto/request/special-offer/special-offer.request.dto.js';

export class CreateSpecialOfferUseCase {
  constructor(
    private readonly specialOfferRepo: ISpecialOfferRepository,
    private readonly productRepo: IProductRepository,
  ) {}

  async execute(dto: CreateSpecialOfferRequestDto): Promise<SpecialOfferCampaignEntity> {
    const startDate = new Date(dto.startDate);
    const endDate = new Date(dto.endDate);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      throw new InvalidSpecialOfferException('تاریخ شروع یا پایان نامعتبر است.');
    }

    if (startDate >= endDate) {
      throw new InvalidSpecialOfferException('تاریخ شروع کمپین باید قبل از تاریخ پایان باشد.');
    }

    if (!dto.items || dto.items.length === 0) {
      throw new InvalidSpecialOfferException('حداقل یک محصول باید برای کمپین فروش ویژه انتخاب شود.');
    }

    const campaignId = randomUUID();
    const items: SpecialOfferItemEntity[] = [];

    // Verify products and calculate special prices
    for (const it of dto.items) {
      const product = await this.productRepo.findById(it.productId);
      if (!product) {
        throw new InvalidSpecialOfferException(`محصول با شناسه ${it.productId} در کاتالوگ یافت نشد.`);
      }

      const prodJson = product.toJSON();
      let originalPrice = prodJson.originalPrice || prodJson.price;
      let specialPrice = prodJson.price;
      let discountType: any = it.discountType || 'PERCENTAGE';
      let discountValue = it.discountValue;

      if (it.discountType && it.discountValue !== undefined && it.discountValue > 0) {
        if (it.discountType === 'PERCENTAGE') {
          if (it.discountValue <= 0 || it.discountValue > 100) {
            throw new InvalidSpecialOfferException('درصد تخفیف باید بین ۱ تا ۱۰۰ باشد.');
          }
          specialPrice = Math.round(originalPrice * (1 - it.discountValue / 100));
        } else {
          specialPrice = Math.max(0, originalPrice - it.discountValue);
        }
      } else {
        // Automatically take discount from the product catalog
        if (originalPrice > specialPrice) {
          discountType = 'PERCENTAGE';
          discountValue = Math.round(((originalPrice - specialPrice) / originalPrice) * 100);
        } else if (prodJson.discountPercent && prodJson.discountPercent > 0) {
          discountType = 'PERCENTAGE';
          discountValue = prodJson.discountPercent;
          originalPrice = Math.round(specialPrice / (1 - discountValue / 100));
        } else {
          discountType = 'PERCENTAGE';
          discountValue = 0;
        }
      }


      items.push(
        new SpecialOfferItemEntity({
          id: randomUUID(),
          campaignId,
          productId: it.productId,
          discountType,
          discountValue: discountValue || 0,
          originalPrice,
          specialPrice,
          stockQuota: it.stockQuota !== undefined ? it.stockQuota : (prodJson.stock ?? 10),
          stockSold: 0,
          maxPerOrder: it.maxPerOrder ?? 5,
          sortOrder: it.sortOrder ?? items.length,
          product: {
            id: prodJson.id,
            name: prodJson.name,
            slug: prodJson.slug,
            sku: prodJson.sku,
            basePrice: prodJson.price,
            stock: prodJson.stock ?? 10,
            images: prodJson.images ?? [],
            brand: prodJson.brand,
            category: prodJson.category,
            shortDescription: prodJson.shortDescription,
            specs: prodJson.specs,
            inStock: (prodJson.stock ?? 1) > 0,
          },
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
      );
    }

    const campaign = new SpecialOfferCampaignEntity({
      id: campaignId,
      title: dto.title.trim(),
      tagline: dto.tagline?.trim(),
      description: dto.description?.trim(),
      bannerUrl: dto.bannerUrl?.trim(),
      startDate,
      endDate,
      status: dto.status || 'ACTIVE',
      priority: dto.priority ?? 0,
      isPublished: dto.isPublished !== undefined ? dto.isPublished : true,
      items,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return await this.specialOfferRepo.create(campaign);
  }
}
