import { randomUUID } from 'node:crypto';
import type { ISpecialOfferRepository } from '../../../domain/repositories/special-offer.repository.interface.js';
import type { IProductRepository } from '../../../domain/repositories/product.repository.interface.js';
import {
  SpecialOfferCampaignEntity,
  SpecialOfferItemEntity,
} from '../../../domain/entities/special-offer.entity.js';
import {
  SpecialOfferNotFoundException,
  InvalidSpecialOfferException,
} from '../../../domain/exceptions/special-offer.exceptions.js';
import type { UpdateSpecialOfferRequestDto } from '../../../presentation/dto/request/special-offer/special-offer.request.dto.js';

export class UpdateSpecialOfferUseCase {
  constructor(
    private readonly specialOfferRepo: ISpecialOfferRepository,
    private readonly productRepo: IProductRepository,
  ) {}

  async execute(id: string, dto: UpdateSpecialOfferRequestDto): Promise<SpecialOfferCampaignEntity> {
    const existing = await this.specialOfferRepo.findById(id);
    if (!existing) {
      throw new SpecialOfferNotFoundException(id);
    }

    const startDate = dto.startDate ? new Date(dto.startDate) : existing.startDate;
    const endDate = dto.endDate ? new Date(dto.endDate) : existing.endDate;

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      throw new InvalidSpecialOfferException('تاریخ شروع یا پایان نامعتبر است.');
    }

    if (startDate >= endDate) {
      throw new InvalidSpecialOfferException('تاریخ شروع کمپین باید قبل از تاریخ پایان باشد.');
    }

    let items = existing.items;

    // If new items provided, re-verify and calculate prices
    if (dto.items && dto.items.length > 0) {
      const newItems: SpecialOfferItemEntity[] = [];

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

        // Preserve previous sold count if item existed
        const oldItem = existing.items.find((item) => item.productId === it.productId);
        const stockSold = oldItem ? oldItem.stockSold : 0;

        newItems.push(
          new SpecialOfferItemEntity({
            id: oldItem ? oldItem.id : randomUUID(),
            campaignId: existing.id,
            productId: it.productId,
            discountType,
            discountValue: discountValue || 0,
            originalPrice,
            specialPrice,
            stockQuota: it.stockQuota !== undefined ? it.stockQuota : (prodJson.stock ?? 10),
            stockSold,
            maxPerOrder: it.maxPerOrder ?? 5,
            sortOrder: it.sortOrder ?? newItems.length,
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
            createdAt: oldItem ? oldItem.createdAt : new Date(),
            updatedAt: new Date(),
          }),
        );
      }

      items = newItems;
    }

    const updated = new SpecialOfferCampaignEntity({
      id: existing.id,
      title: dto.title ? dto.title.trim() : existing.title,
      tagline: dto.tagline !== undefined ? dto.tagline?.trim() ?? null : existing.tagline,
      description: dto.description !== undefined ? dto.description?.trim() ?? null : existing.description,
      bannerUrl: dto.bannerUrl !== undefined ? dto.bannerUrl?.trim() ?? null : existing.bannerUrl,
      startDate,
      endDate,
      status: dto.status || existing.status,
      priority: dto.priority !== undefined ? dto.priority : existing.priority,
      isPublished: dto.isPublished !== undefined ? dto.isPublished : existing.isPublished,
      items,
      createdAt: existing.createdAt,
      updatedAt: new Date(),
    });

    return await this.specialOfferRepo.update(updated);
  }
}
