import { Injectable } from '@nestjs/common';
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

@Injectable()
export class PrismaProductRepository implements IProductRepository {
  constructor(private readonly prisma: PrismaService) {}

  private async ensureBrandAndCategory(brandName: string, categorySlug: string) {
    const brand = await this.prisma.brand.upsert({
      where: { name: brandName },
      update: {},
      create: {
        name: brandName,
        slug: brandName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      },
    });

    const category = await this.prisma.category.upsert({
      where: { slug: categorySlug },
      update: {},
      create: {
        shortName: categorySlug,
        longName: categorySlug,
        slug: categorySlug,
      },
    });

    return { brandId: brand.id, categoryId: category.id };
  }

  public async save(product: Product): Promise<Product> {
    const json = product.toJSON();
    const { brandId, categoryId } = await this.ensureBrandAndCategory(json.brand, json.category);

    const upserted = await this.prisma.product.upsert({
      where: { id: json.id },
      update: {
        name: json.name,
        slug: json.slug,
        sku: json.sku,
        basePrice: json.price,
        compareAtPrice: json.originalPrice ?? null,
        shortDescription: json.shortDescription,
        fullDescription: json.fullDescription ?? null,
        isFeatured: json.featured,
        brandId,
        categoryId,
        updatedAt: new Date(),
      },
      create: {
        id: json.id,
        name: json.name,
        slug: json.slug,
        sku: json.sku,
        basePrice: json.price,
        compareAtPrice: json.originalPrice ?? null,
        shortDescription: json.shortDescription,
        fullDescription: json.fullDescription ?? null,
        isFeatured: json.featured,
        brandId,
        categoryId,
      },
      include: {
        images: true,
        features: true,
      },
    });

    // Update images if provided
    if (json.images && json.images.length > 0) {
      await this.prisma.productImage.deleteMany({ where: { productId: upserted.id } });
      await this.prisma.productImage.createMany({
        data: json.images.map((url, idx) => ({
          productId: upserted.id,
          url,
          isPrimary: idx === 0,
          sortOrder: idx,
        })),
      });
    }

    // Update features if provided
    if (json.features && json.features.length > 0) {
      await this.prisma.productFeature.deleteMany({ where: { productId: upserted.id } });
      await this.prisma.productFeature.createMany({
        data: json.features.map((f, idx) => ({
          productId: upserted.id,
          title: f.title,
          description: f.description,
          iconUrl: f.iconUrl ?? null,
          iconName: f.iconName ?? null,
          sortOrder: idx,
        })),
      });
    }

    // Update relations if provided
    if (json.relatedProductIds !== undefined) {
      await this.prisma.productRelation.deleteMany({ where: { sourceProductId: upserted.id } });
      if (json.relatedProductIds.length > 0) {
        const validTargetIds = json.relatedProductIds.filter((tid) => tid !== upserted.id);
        for (let idx = 0; idx < validTargetIds.length; idx++) {
          const targetId = validTargetIds[idx];
          try {
            await this.prisma.productRelation.create({
              data: {
                sourceProductId: upserted.id,
                targetProductId: targetId,
                relationType: 'RELATED',
                sortOrder: idx,
              },
            });
          } catch {
            // Ignore if target does not exist in DB
          }
        }
      }
    }

    return this.findById(upserted.id) as Promise<Product>;
  }

  public async findById(id: string): Promise<Product | null> {
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
  }

  public async findBySku(sku: string): Promise<Product | null> {
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
  }

  public async findBySlug(slug: string): Promise<Product | null> {
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
  }

  public async findAll(params?: ProductQueryParams): Promise<PaginatedProductsResult> {
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
  }

  public async delete(id: string): Promise<boolean> {
    try {
      await this.prisma.product.delete({ where: { id } });
      return true;
    } catch {
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

    const stock =
      row.variants?.[0]?.inventory?.quantity ?? 10;

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
      minStockAlert: 5,
      reservedStock: row.variants?.[0]?.inventory?.reservedQuantity ?? 0,
      warehouseLocation: 'انبار مرکزی',
      status: row.status === 'ACTIVE' ? 'active' : 'inactive',
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
