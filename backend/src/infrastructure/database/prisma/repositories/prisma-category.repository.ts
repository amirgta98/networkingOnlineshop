import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service.js';
import { Category } from '../../../../domain/entities/category.entity.js';
import type {
  ICategoryRepository,
  CategoryQueryOptions,
} from '../../../../domain/repositories/category.repository.interface.js';

@Injectable()
export class PrismaCategoryRepository implements ICategoryRepository {
  constructor(private readonly prisma: PrismaService) {}

  private toDomain(record: any, productCount: number = 0): Category {
    const cat = new Category({
      id: record.id,
      shortName: record.shortName,
      longName: record.longName,
      slug: record.slug,
      description: record.description ?? undefined,
      icon: record.icon ?? undefined,
      badge: record.badge ?? undefined,
      parentId: record.parentId ?? null,
      sortOrder: record.sortOrder,
      isActive: record.isActive,
      productCount,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
    return cat;
  }

  async create(category: Category): Promise<Category> {
    const json = category.toJSON();
    const created = await this.prisma.category.create({
      data: {
        shortName: json.shortName,
        longName: json.longName,
        slug: json.slug,
        description: json.description,
        icon: json.icon,
        badge: json.badge,
        parentId: json.parentId,
        sortOrder: json.sortOrder,
        isActive: json.isActive,
      },
    });
    return this.toDomain(created, 0);
  }

  async findById(id: string): Promise<Category | null> {
    const found = await this.prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });
    if (!found) return null;
    return this.toDomain(found, found._count?.products ?? 0);
  }

  async findBySlug(slug: string): Promise<Category | null> {
    const found = await this.prisma.category.findUnique({
      where: { slug },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });
    if (!found) return null;
    return this.toDomain(found, found._count?.products ?? 0);
  }

  async findAll(options?: CategoryQueryOptions): Promise<Category[]> {
    const where: any = {};
    if (options?.isActive !== undefined) {
      where.isActive = options.isActive;
    }
    if (options?.parentId !== undefined) {
      where.parentId = options.parentId;
    }
    if (options?.search) {
      const q = options.search.trim();
      where.OR = [
        { shortName: { contains: q, mode: 'insensitive' } },
        { longName: { contains: q, mode: 'insensitive' } },
        { slug: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
      ];
    }

    const records = await this.prisma.category.findMany({
      where,
      orderBy: { sortOrder: 'asc' },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    return records.map((r: any) => this.toDomain(r, r._count?.products ?? 0));
  }

  async update(category: Category): Promise<Category> {
    const json = category.toJSON();
    const updated = await this.prisma.category.update({
      where: { id: json.id },
      data: {
        shortName: json.shortName,
        longName: json.longName,
        slug: json.slug,
        description: json.description,
        icon: json.icon,
        badge: json.badge,
        parentId: json.parentId,
        sortOrder: json.sortOrder,
        isActive: json.isActive,
      },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });
    return this.toDomain(updated, updated._count?.products ?? 0);
  }

  async delete(id: string): Promise<boolean> {
    try {
      await this.prisma.category.delete({ where: { id } });
      return true;
    } catch {
      return false;
    }
  }

  async count(): Promise<number> {
    return this.prisma.category.count();
  }

  async getProductCount(categoryIdOrSlug: string): Promise<number> {
    return this.prisma.product.count({
      where: {
        OR: [
          { categoryId: categoryIdOrSlug },
          { category: { slug: categoryIdOrSlug } },
        ],
      },
    });
  }
}
