import crypto from 'node:crypto';
import {
  Product,
  type ProductProps,
  type ProductFeatureProps,
} from '../../../domain/entities/product.entity.js';
import type { IProductRepository } from '../../../domain/repositories/product.repository.interface.js';
import type { CreateProductInput } from '../../dto/product/create-product.dto.js';
import {
  DuplicateSkuException,
  InvalidProductDataException,
} from '../../../domain/exceptions/product.exceptions.js';

export class CreateProductUseCase {
  constructor(private readonly productRepo: IProductRepository) {}

  public async execute(input: CreateProductInput): Promise<ProductProps> {
    if (!input.name || input.name.trim() === '') {
      throw new InvalidProductDataException('نام محصول الزامی است.');
    }
    if (!input.sku || input.sku.trim() === '') {
      throw new InvalidProductDataException('شناسه انبار (SKU) محصول الزامی است.');
    }
    if (input.price <= 0) {
      throw new InvalidProductDataException('قیمت فروش محصول باید بزرگتر از صفر باشد.');
    }
    if (input.stock < 0) {
      throw new InvalidProductDataException('تعداد موجودی انبار نمی‌تواند منفی باشد.');
    }

    // Check SKU uniqueness
    const existing = await this.productRepo.findBySku(input.sku.trim());
    if (existing) {
      throw new DuplicateSkuException(input.sku.trim());
    }

    const id = crypto.randomUUID();
    let rawSlug =
      input.slug?.trim() ||
      input.name
        .trim()
        .toLowerCase()
        .replace(/[\u200C\u200D]/g, '')
        .replace(/[^a-zA-Z0-9\u0600-\u06FF]+/g, '-')
        .replace(/^-+|-+$/g, '') ||
      `prod-${Date.now()}`;

    let slug = rawSlug;
    // Ensure slug uniqueness
    while (await this.productRepo.findBySlug(slug)) {
      slug = `${rawSlug}-${crypto.randomBytes(3).toString('hex')}`;
    }

    const costPrice = input.costPrice ?? Math.round(input.price * 0.8);
    const minStockAlert = input.minStockAlert ?? 5;
    const warehouseLocation = input.warehouseLocation || 'انبار مرکزی';
    const status = input.status || (input.stock === 0 ? 'out_of_stock' : 'active');
    const featured = input.featured ?? false;
    const warranty = input.warranty || 'گارانتی طلایی ۳۶ ماهه تعویض درجا ققنوس';
    const badges = input.badges || ['گارانتی اصلی'];
    const shortDescription = input.shortDescription || '';
    const fullDescription = input.fullDescription || '';

    const features: ProductFeatureProps[] = (input.features || [])
      .filter((f) => f && f.title?.trim() && f.description?.trim())
      .map((f, idx) => ({
      id: f.id || crypto.randomUUID(),
      title: f.title.trim(),
      description: f.description.trim(),
      iconUrl: f.iconUrl,
      iconName: f.iconName || 'network',
      sortOrder: f.sortOrder ?? idx,
    }));

    const specs =
      input.specs && input.specs.length > 0
        ? input.specs
        : features.map((f) => `${f.title}: ${f.description}`);

    const product = new Product({
      id,
      name: input.name.trim(),
      slug,
      sku: input.sku.trim(),
      category: input.category || 'switches',
      brand: input.brand || 'Cisco',
      price: input.price,
      originalPrice: input.originalPrice,
      costPrice,
      stock: input.stock,
      minStockAlert,
      reservedStock: input.reservedStock ?? 0,
      warehouseLocation,
      status,
      featured,
      isSpecialOffer: input.isSpecialOffer ?? false,
      discountPercent: input.discountPercent,
      rating: input.rating ?? 5,
      reviewCount: input.reviewCount ?? 0,
      images: input.images || [],
      warranty,
      badges,
      specs,
      features,
      relatedProductIds: input.relatedProductIds || [],
      shortDescription,
      fullDescription,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const saved = await this.productRepo.save(product);
    return saved.toJSON();
  }
}
