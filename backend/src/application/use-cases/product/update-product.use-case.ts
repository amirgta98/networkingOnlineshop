import crypto from 'node:crypto';
import type { IProductRepository } from '../../../domain/repositories/product.repository.interface.js';
import type { UpdateProductInput } from '../../dto/product/update-product.dto.js';
import type {
  ProductProps,
  ProductFeatureProps,
} from '../../../domain/entities/product.entity.js';
import {
  ProductNotFoundException,
  DuplicateSkuException,
  InvalidProductDataException,
} from '../../../domain/exceptions/product.exceptions.js';

export class UpdateProductUseCase {
  constructor(private readonly productRepo: IProductRepository) {}

  public async execute(id: string, input: UpdateProductInput): Promise<ProductProps> {
    let existing = await this.productRepo.findById(id);
    if (!existing) {
      existing = await this.productRepo.findBySlug(id);
    }
    if (!existing) {
      throw new ProductNotFoundException(id);
    }

    if (input.price !== undefined && input.price <= 0) {
      throw new InvalidProductDataException('قیمت فروش محصول باید بزرگتر از صفر باشد.');
    }
    if (input.stock !== undefined && input.stock < 0) {
      throw new InvalidProductDataException('تعداد موجودی انبار نمی‌تواند منفی باشد.');
    }

    // Check SKU if changing
    if (input.sku && input.sku.trim() !== existing.sku) {
      const skuConflict = await this.productRepo.findBySku(input.sku.trim());
      if (skuConflict && skuConflict.id !== existing.id) {
        throw new DuplicateSkuException(input.sku.trim());
      }
    }

    // Check slug if changing
    if (input.slug && input.slug.trim() !== existing.slug) {
      const slugConflict = await this.productRepo.findBySlug(input.slug.trim());
      if (slugConflict && slugConflict.id !== existing.id) {
        throw new InvalidProductDataException(`شناسه پیوند یکتا (Slug) «${input.slug.trim()}» قبلاً ثبت شده است.`);
      }
    }

    const updates: Partial<ProductProps> = {};

    if (input.name !== undefined) updates.name = input.name.trim();
    if (input.slug !== undefined) updates.slug = input.slug.trim();
    if (input.sku !== undefined) updates.sku = input.sku.trim();
    if (input.category !== undefined) updates.category = input.category;
    if (input.brand !== undefined) updates.brand = input.brand;
    if (input.price !== undefined) updates.price = input.price;
    if (input.originalPrice !== undefined) updates.originalPrice = input.originalPrice;
    if (input.costPrice !== undefined) updates.costPrice = input.costPrice;
    if (input.stock !== undefined) updates.stock = input.stock;
    if (input.minStockAlert !== undefined) updates.minStockAlert = input.minStockAlert;
    if (input.reservedStock !== undefined) updates.reservedStock = input.reservedStock;
    if (input.warehouseLocation !== undefined) updates.warehouseLocation = input.warehouseLocation;
    if (input.status !== undefined) updates.status = input.status;
    if (input.featured !== undefined) updates.featured = input.featured;
    if (input.isSpecialOffer !== undefined) updates.isSpecialOffer = input.isSpecialOffer;
    if (input.discountPercent !== undefined) updates.discountPercent = input.discountPercent;
    if (input.rating !== undefined) updates.rating = input.rating;
    if (input.reviewCount !== undefined) updates.reviewCount = input.reviewCount;
    if (input.images !== undefined) updates.images = input.images;
    if (input.warranty !== undefined) updates.warranty = input.warranty;
    if (input.badges !== undefined) updates.badges = input.badges;
    if (input.relatedProductIds !== undefined) updates.relatedProductIds = input.relatedProductIds;
    if (input.shortDescription !== undefined) updates.shortDescription = input.shortDescription;
    if (input.fullDescription !== undefined) updates.fullDescription = input.fullDescription;

    if (input.features !== undefined) {
      const features: ProductFeatureProps[] = input.features.map((f, idx) => ({
        id: f.id || crypto.randomUUID(),
        title: f.title.trim(),
        description: f.description.trim(),
        iconUrl: f.iconUrl,
        iconName: f.iconName || 'network',
        sortOrder: f.sortOrder ?? idx,
      }));
      updates.features = features;

      if (input.specs === undefined) {
        updates.specs = features.map((f) => `${f.title}: ${f.description}`);
      }
    }

    if (input.specs !== undefined) {
      updates.specs = input.specs;
    }

    existing.updateDetails(updates);
    const saved = await this.productRepo.save(existing);
    return saved.toJSON();
  }
}
