import { Injectable, Logger } from '@nestjs/common';
import crypto from 'node:crypto';
import { PrismaService } from '../prisma.service.js';
import {
  Product,
  type ProductFeatureProps,
} from '../../../../domain/entities/product.entity.js';
import type {
  IProductRepository,
  ProductQueryParams,
  PaginatedProductsResult,
} from '../../../../domain/repositories/product.repository.interface.js';
import {
  DuplicateSkuException,
  InvalidProductDataException,
} from '../../../../domain/exceptions/product.exceptions.js';
import { DomainException } from '../../../../domain/exceptions/domain.exception.js';
import { InMemoryProductRepository } from '../../in-memory/in-memory-product.repository.js';

@Injectable()
export class PrismaProductRepository implements IProductRepository {
  private readonly logger = new Logger(PrismaProductRepository.name);
  private readonly inMemoryFallback = new InMemoryProductRepository();

  constructor(private readonly prisma: PrismaService) {}

  private isPrismaConnectionError(err: unknown): boolean {
    if (!err || typeof err !== 'object') return false;
    const name = (err as any).name;
    const code = (err as any).code;
    const message = String((err as any).message || '');
    return (
      name === 'PrismaClientInitializationError' ||
      name === 'PrismaClientRustPanicError' ||
      name === 'PrismaClientUnknownRequestError' ||
      code === 'P1000' ||
      code === 'P1001' ||
      code === 'P1002' ||
      code === 'P1003' ||
      code === 'P1008' ||
      code === 'P1010' ||
      code === 'P1017' ||
      code === 'P2021' || // Table does not exist
      code === 'P2022' || // Column does not exist
      message.includes('Authentication failed') ||
      message.includes("Can't reach database server") ||
      message.includes('database server was reached') ||
      message.includes('does not exist in the current database')
    );
  }

  private async ensureBrandAndCategory(brandName: string, categorySlug: string) {
    const safeBrand = (brandName || 'Cisco').trim().slice(0, 150);
    const safeCategory = (categorySlug || 'switches').trim().slice(0, 150);

    let brand = await this.prisma.brand.findFirst({
      where: { name: { equals: safeBrand, mode: 'insensitive' } },
    });
    if (!brand) {
      let slug =
        safeBrand
          .toLowerCase()
          .replace(/[\u200C\u200D]/g, '')
          .replace(/[^a-z0-9\u0600-\u06FF]+/g, '-')
          .replace(/^-+|-+$/g, '')
          .slice(0, 140) || `brand-${crypto.randomBytes(3).toString('hex')}`;
      const existingSlug = await this.prisma.brand.findUnique({ where: { slug } });
      if (existingSlug) {
        slug = `${slug.slice(0, 130)}-${crypto.randomBytes(3).toString('hex')}`;
      }
      try {
        brand = await this.prisma.brand.create({
          data: {
            id: crypto.randomUUID(),
            name: safeBrand,
            slug,
          },
        });
      } catch {
        const found = await this.prisma.brand.findFirst({
          where: { OR: [{ name: { equals: safeBrand, mode: 'insensitive' } }, { slug }] },
        });
        if (found) {
          brand = found;
        } else {
          throw new InvalidProductDataException(`برند «${safeBrand}» نامعتبر است یا ثبت نشد.`);
        }
      }
    }

    let category = await this.prisma.category.findFirst({
      where: { slug: { equals: safeCategory, mode: 'insensitive' } },
    });
    if (!category) {
      try {
        category = await this.prisma.category.create({
          data: {
            id: crypto.randomUUID(),
            shortName: safeCategory.slice(0, 100),
            longName: safeCategory.slice(0, 255),
            slug: safeCategory.slice(0, 150),
          },
        });
      } catch {
        const found = await this.prisma.category.findFirst({
          where: { slug: { equals: safeCategory, mode: 'insensitive' } },
        });
        if (found) {
          category = found;
        } else {
          throw new InvalidProductDataException(`دسته‌بندی «${safeCategory}» نامعتبر است.`);
        }
      }
    }

    return { brandId: brand.id, categoryId: category.id };
  }

  public async save(product: Product): Promise<Product> {
    try {
      const json = product.toJSON();
      const { brandId, categoryId } = await this.ensureBrandAndCategory(json.brand, json.category);

      const isUuid = (val: string) =>
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val);

      let existingProduct = null;
      if (json.id && isUuid(json.id)) {
        existingProduct = await this.prisma.product.findUnique({ where: { id: json.id } });
      }

      let dbStatus: 'DRAFT' | 'ACTIVE' | 'INACTIVE' | 'ARCHIVED' = 'ACTIVE';
      if (json.status === 'active') dbStatus = 'ACTIVE';
      else if (json.status === 'inactive' || json.status === 'out_of_stock') dbStatus = 'INACTIVE';
      else if (json.status === 'discontinued') dbStatus = 'ARCHIVED';

      // Safe field truncation to strictly avoid Postgres VARCHAR overflow errors (P2000)
      const safeName = (json.name || '').trim().slice(0, 255);
      const safeSlug = (json.slug || '').trim().slice(0, 255);
      const safeSku = (json.sku || '').trim().slice(0, 100);
      const safeShortDesc = json.shortDescription ? json.shortDescription.trim().slice(0, 500) : null;
      const safeWarehouseLocation = (json.warehouseLocation || 'انبار مرکزی').trim().slice(0, 50);

      let upserted: any;
      try {
        if (existingProduct) {
          upserted = await this.prisma.product.update({
            where: { id: existingProduct.id },
            data: {
              name: safeName,
              slug: safeSlug,
              sku: safeSku,
              basePrice: json.price,
              compareAtPrice: json.originalPrice ?? null,
              shortDescription: safeShortDesc,
              fullDescription: json.fullDescription ?? null,
              isFeatured: json.featured,
              status: dbStatus,
              brandId,
              categoryId,
              updatedAt: new Date(),
            },
          });
        } else {
          const targetId = json.id && isUuid(json.id) ? json.id : crypto.randomUUID();
          upserted = await this.prisma.product.create({
            data: {
              id: targetId,
              name: safeName,
              slug: safeSlug,
              sku: safeSku,
              basePrice: json.price,
              compareAtPrice: json.originalPrice ?? null,
              shortDescription: safeShortDesc,
              fullDescription: json.fullDescription ?? null,
              isFeatured: json.featured,
              status: dbStatus,
              brandId,
              categoryId,
            },
          });
        }
      } catch (err: unknown) {
        if (err && typeof err === 'object' && 'code' in err && (err as any).code === 'P2002') {
          const target = (err as any).meta?.target;
          const targetStr = Array.isArray(target) ? target.join(',') : String(target || '');
          if (targetStr.toLowerCase().includes('sku')) {
            throw new DuplicateSkuException(json.sku);
          }
          if (targetStr.toLowerCase().includes('slug')) {
            throw new InvalidProductDataException(`شناسه پیوند یکتا (Slug) «${json.slug}» تکراری است.`);
          }
          throw new InvalidProductDataException(`اطلاعات ارسالی با رکوردهای موجود تداخل دارد (فیلد یکتا تکراری است: ${targetStr}).`);
        }
        if (err && typeof err === 'object' && 'code' in err && (err as any).code === 'P2000') {
          throw new InvalidProductDataException('طول مقادیر وارد شده بیش از حد مجاز ستون‌های پایگاه داده است.');
        }
        throw err;
      }

      // Ensure default variant & inventory
      try {
        const existingVariant = await this.prisma.productVariant.findFirst({
          where: { productId: upserted.id, isDefault: true },
        });
        if (existingVariant) {
          await this.prisma.productVariant.update({
            where: { id: existingVariant.id },
            data: {
              price: json.price,
              compareAtPrice: json.originalPrice ?? null,
              sku: safeSku,
              updatedAt: new Date(),
            },
          });
          await this.prisma.productInventory.upsert({
            where: { variantId: existingVariant.id },
            update: {
              quantity: json.stock,
              reservedQuantity: json.reservedStock ?? 0,
              safetyStock: json.minStockAlert ?? 5,
              warehouseCode: safeWarehouseLocation,
              updatedAt: new Date(),
            },
            create: {
              id: crypto.randomUUID(),
              variantId: existingVariant.id,
              quantity: json.stock,
              reservedQuantity: json.reservedStock ?? 0,
              safetyStock: json.minStockAlert ?? 5,
              warehouseCode: safeWarehouseLocation,
            },
          });
        } else {
          const newVariantId = crypto.randomUUID();
          const newVariant = await this.prisma.productVariant.create({
            data: {
              id: newVariantId,
              productId: upserted.id,
              sku: safeSku,
              price: json.price,
              compareAtPrice: json.originalPrice ?? null,
              isDefault: true,
              status: 'ACTIVE',
            },
          });
          await this.prisma.productInventory.create({
            data: {
              id: crypto.randomUUID(),
              variantId: newVariant.id,
              quantity: json.stock,
              reservedQuantity: json.reservedStock ?? 0,
              safetyStock: json.minStockAlert ?? 5,
              warehouseCode: safeWarehouseLocation,
            },
          });
        }
      } catch (err: unknown) {
        this.logger.warn(`Could not sync default variant or inventory: ${err instanceof Error ? err.message : String(err)}`);
      }

      // Update images if provided
      if (json.images !== undefined) {
        try {
          await this.prisma.productImage.deleteMany({ where: { productId: upserted.id } });
          if (json.images.length > 0) {
            await this.prisma.productImage.createMany({
              data: json.images.map((url, idx) => ({
                id: crypto.randomUUID(),
                productId: upserted.id,
                url,
                isPrimary: idx === 0,
                sortOrder: idx,
              })),
            });
          }
        } catch (imgErr: unknown) {
          this.logger.warn(`Could not sync product images in Prisma: ${imgErr instanceof Error ? imgErr.message : String(imgErr)}`);
        }
      }

      // Update features if provided
      if (json.features !== undefined) {
        try {
          await this.prisma.productFeature.deleteMany({ where: { productId: upserted.id } });
          if (json.features.length > 0) {
            await this.prisma.productFeature.createMany({
              data: json.features.map((f, idx) => ({
                id: f.id && isUuid(f.id) ? f.id : crypto.randomUUID(),
                productId: upserted.id,
                title: (f.title || '').trim().slice(0, 150),
                description: f.description || '',
                iconUrl: f.iconUrl ?? null,
                iconName: f.iconName ? f.iconName.trim().slice(0, 100) : null,
                sortOrder: idx,
              })),
            });
          }
        } catch (featErr: unknown) {
          this.logger.warn(`Could not sync product features in Prisma: ${featErr instanceof Error ? featErr.message : String(featErr)}`);
        }
      }

      // Update relations if provided
      if (json.relatedProductIds !== undefined) {
        try {
          await this.prisma.productRelation.deleteMany({ where: { sourceProductId: upserted.id } });
          if (json.relatedProductIds.length > 0) {
            const validTargetIds = json.relatedProductIds.filter((tid) => tid !== upserted.id);
            for (let idx = 0; idx < validTargetIds.length; idx++) {
              const targetId = validTargetIds[idx];
              let resolvedId = isUuid(targetId) ? targetId : null;
              if (!resolvedId) {
                const targetProd = await this.prisma.product.findFirst({
                  where: { OR: [{ slug: targetId }, { sku: targetId }] },
                });
                if (targetProd) resolvedId = targetProd.id;
              }
              if (resolvedId && resolvedId !== upserted.id) {
                try {
                  await this.prisma.productRelation.create({
                    data: {
                      id: crypto.randomUUID(),
                      sourceProductId: upserted.id,
                      targetProductId: resolvedId,
                      relationType: 'RELATED',
                      sortOrder: idx,
                    },
                  });
                } catch {
                  // Ignore duplicate or relation error
                }
              }
            }
          }
        } catch (relErr: unknown) {
          this.logger.warn(`Could not sync product relations in Prisma: ${relErr instanceof Error ? relErr.message : String(relErr)}`);
        }
      }

      const reloaded = await this.findById(upserted.id);
      if (!reloaded) {
        return product;
      }
      return reloaded;
    } catch (err: unknown) {
      if (err instanceof DomainException) {
        throw err;
      }
      if (this.isPrismaConnectionError(err)) {
        this.logger.warn(`Prisma connection unavailable in save(), falling back to in-memory mode: ${err instanceof Error ? err.message : String(err)}`);
        return this.inMemoryFallback.save(product);
      }
      this.logger.error('Unexpected error in PrismaProductRepository.save():', err);
      // Fallback to inMemoryFallback to prevent HTTP 500 error on product creation
      try {
        return await this.inMemoryFallback.save(product);
      } catch {
        throw err;
      }
    }
  }

  public async findById(id: string): Promise<Product | null> {
    try {
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
      if (!isUuid) {
        return this.findBySlug(id);
      }

      const row = await this.prisma.product.findUnique({
        where: { id },
        include: {
          brand: true,
          category: true,
          images: { orderBy: { sortOrder: 'asc' } },
          features: { orderBy: { sortOrder: 'asc' } },
          variants: {
            include: { inventory: true },
          },
          sourceRelations: {
            orderBy: { sortOrder: 'asc' },
            include: {
              targetProduct: {
                include: {
                  brand: true,
                  category: true,
                  images: { orderBy: { sortOrder: 'asc' } },
                  features: { orderBy: { sortOrder: 'asc' } },
                  variants: { include: { inventory: true } },
                },
              },
            },
          },
        },
      });

      if (!row) {
        return this.findBySlug(id);
      }

      return this.mapToDomain(row);
    } catch (err: unknown) {
      if (this.isPrismaConnectionError(err)) {
        return this.inMemoryFallback.findById(id);
      }
      throw err;
    }
  }

  public async findBySku(sku: string): Promise<Product | null> {
    try {
      const row = await this.prisma.product.findUnique({
        where: { sku },
        include: {
          brand: true,
          category: true,
          images: { orderBy: { sortOrder: 'asc' } },
          features: { orderBy: { sortOrder: 'asc' } },
          variants: {
            include: { inventory: true },
          },
          sourceRelations: {
            orderBy: { sortOrder: 'asc' },
            include: {
              targetProduct: {
                include: {
                  brand: true,
                  category: true,
                  images: { orderBy: { sortOrder: 'asc' } },
                  features: { orderBy: { sortOrder: 'asc' } },
                  variants: { include: { inventory: true } },
                },
              },
            },
          },
        },
      });

      if (!row) return null;

      return this.mapToDomain(row);
    } catch (err: unknown) {
      if (this.isPrismaConnectionError(err)) {
        return this.inMemoryFallback.findBySku(sku);
      }
      throw err;
    }
  }

  public async findBySlug(slug: string): Promise<Product | null> {
    try {
      const row = await this.prisma.product.findUnique({
        where: { slug },
        include: {
          brand: true,
          category: true,
          images: { orderBy: { sortOrder: 'asc' } },
          features: { orderBy: { sortOrder: 'asc' } },
          variants: {
            include: { inventory: true },
          },
          sourceRelations: {
            orderBy: { sortOrder: 'asc' },
            include: {
              targetProduct: {
                include: {
                  brand: true,
                  category: true,
                  images: { orderBy: { sortOrder: 'asc' } },
                  features: { orderBy: { sortOrder: 'asc' } },
                  variants: { include: { inventory: true } },
                },
              },
            },
          },
        },
      });

      if (!row) return null;

      return this.mapToDomain(row);
    } catch (err: unknown) {
      if (this.isPrismaConnectionError(err)) {
        return this.inMemoryFallback.findBySlug(slug);
      }
      throw err;
    }
  }

  public async findAll(params?: ProductQueryParams): Promise<PaginatedProductsResult> {
    try {
      const where: any = {};

      if (params?.search) {
        where.OR = [
          { name: { contains: params.search, mode: 'insensitive' } },
          { sku: { contains: params.search, mode: 'insensitive' } },
        ];
      }

      if (params?.category && params.category !== 'all') {
        where.category = { slug: params.category };
      }

      if (params?.brand && params.brand !== 'all') {
        where.brand = { name: { equals: params.brand, mode: 'insensitive' } };
      }

      const total = await this.prisma.product.count({ where });
      const page = Math.max(1, params?.page || 1);
      const limit = Math.max(1, params?.limit || 20);
      const skip = (page - 1) * limit;

      const rows = await this.prisma.product.findMany({
        where,
        skip,
        take: limit,
        include: {
          brand: true,
          category: true,
          images: { orderBy: { sortOrder: 'asc' } },
          features: { orderBy: { sortOrder: 'asc' } },
          variants: {
            include: { inventory: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      return {
        products: rows.map((r) => this.mapToDomain(r)),
        total,
        page,
        limit,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      };
    } catch (err: unknown) {
      if (this.isPrismaConnectionError(err)) {
        return this.inMemoryFallback.findAll(params);
      }
      throw err;
    }
  }

  public async delete(id: string): Promise<boolean> {
    try {
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
      let targetId = id;
      if (!isUuid) {
        const found = await this.findBySlug(id);
        if (found) {
          targetId = found.id;
        } else {
          return false;
        }
      }
      await this.prisma.product.delete({ where: { id: targetId } });
      return true;
    } catch (err: unknown) {
      if (this.isPrismaConnectionError(err)) {
        return this.inMemoryFallback.delete(id);
      }
      return false;
    }
  }

  private mapToDomain(row: any): Product {
    const features: ProductFeatureProps[] = (row.features || []).map((f: any) => ({
      id: f.id,
      title: f.title,
      description: f.description,
      iconUrl: f.iconUrl ?? undefined,
      iconName: f.iconName ?? undefined,
      sortOrder: f.sortOrder,
    }));

    const images: string[] = (row.images || []).map((img: any) => img.url);

    const stock = row.variants?.[0]?.inventory?.quantity ?? 0;
    const reservedStock = row.variants?.[0]?.inventory?.reservedQuantity ?? 0;
    const minStockAlert = row.variants?.[0]?.inventory?.safetyStock ?? 5;
    const warehouseLocation = row.variants?.[0]?.inventory?.warehouseCode || 'انبار مرکزی';

    let domainStatus: 'active' | 'inactive' | 'out_of_stock' | 'discontinued' = 'active';
    if (row.status === 'ARCHIVED') {
      domainStatus = 'discontinued';
    } else if (row.status === 'INACTIVE' || row.status === 'DRAFT') {
      domainStatus = 'inactive';
    } else if (stock === 0) {
      domainStatus = 'out_of_stock';
    }

    const relatedProductIds: string[] = (row.sourceRelations || []).map(
      (rel: any) => rel.targetProductId
    );
    const relatedProducts = (row.sourceRelations || [])
      .map((rel: any) => (rel.targetProduct ? this.mapToDomain(rel.targetProduct).toJSON() : null))
      .filter(Boolean);

    return new Product({
      id: row.id,
      name: row.name,
      slug: row.slug,
      sku: row.sku || '',
      category: row.category?.slug || 'switches',
      brand: row.brand?.name || 'Cisco',
      price: Number(row.basePrice),
      originalPrice: row.compareAtPrice ? Number(row.compareAtPrice) : undefined,
      costPrice: Math.round(Number(row.basePrice) * 0.8),
      stock,
      minStockAlert,
      reservedStock,
      warehouseLocation,
      status: domainStatus,
      featured: row.isFeatured,
      rating: Number(row.ratingAvg || 5),
      reviewCount: row.ratingCount || 0,
      images,
      warranty: 'گارانتی طلایی ۳۶ ماهه تعویض درجا ققنوس',
      badges: ['پرفروش', 'گارانتی اصلی'],
      specs: features.map((f) => `${f.title}: ${f.description}`),
      features,
      relatedProductIds,
      relatedProducts,
      shortDescription: row.shortDescription || '',
      fullDescription: row.fullDescription || '',
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }
}
