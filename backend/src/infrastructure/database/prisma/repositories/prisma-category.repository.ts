import { Injectable, Logger } from '@nestjs/common';
import crypto from 'node:crypto';
import { PrismaService } from '../prisma.service.js';
import { Category } from '../../../../domain/entities/category.entity.js';
import type {
  ICategoryRepository,
  CategoryQueryOptions,
} from '../../../../domain/repositories/category.repository.interface.js';
import type { IProductRepository } from '../../../../domain/repositories/product.repository.interface.js';
import { InMemoryCategoryRepository } from '../../in-memory/in-memory-category.repository.js';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
function isUuid(val?: string | null): boolean {
  return typeof val === 'string' && UUID_REGEX.test(val.trim());
}

@Injectable()
export class PrismaCategoryRepository implements ICategoryRepository {
  private readonly logger = new Logger(PrismaCategoryRepository.name);
  private readonly inMemoryFallback: InMemoryCategoryRepository;

  constructor(
    private readonly prisma: PrismaService,
    productRepo?: IProductRepository,
  ) {
    this.inMemoryFallback = new InMemoryCategoryRepository(productRepo);
  }

  private isPrismaConnectionError(err: unknown): boolean {
    if (!err || typeof err !== 'object') return false;
    const name = (err as any).name;
    const code = (err as any).code;
    return (
      name === 'PrismaClientInitializationError' ||
      name === 'PrismaClientRustPanicError' ||
      code === 'P1000' ||
      code === 'P1001' ||
      code === 'P1002' ||
      code === 'P1003' ||
      code === 'P1017'
    );
  }

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
    try {
      const json = category.toJSON();
      const parentId = json.parentId && isUuid(json.parentId) ? json.parentId.trim() : null;
      const id = json.id && isUuid(json.id) ? json.id.trim() : crypto.randomUUID();

      const created = await this.prisma.category.create({
        data: {
          id,
          shortName: json.shortName,
          longName: json.longName,
          slug: json.slug,
          description: json.description,
          icon: json.icon,
          badge: json.badge,
          parentId,
          sortOrder: json.sortOrder,
          isActive: json.isActive,
        },
      });
      return this.toDomain(created, 0);
    } catch (err: unknown) {
      if (this.isPrismaConnectionError(err)) {
        return this.inMemoryFallback.create(category);
      }
      throw err;
    }
  }

  async findById(id: string): Promise<Category | null> {
    if (!isUuid(id)) return null;
    try {
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
    } catch (err: unknown) {
      if (this.isPrismaConnectionError(err)) {
        return this.inMemoryFallback.findById(id);
      }
      throw err;
    }
  }

  async findBySlug(slug: string): Promise<Category | null> {
    try {
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
    } catch (err: unknown) {
      if (this.isPrismaConnectionError(err)) {
        return this.inMemoryFallback.findBySlug(slug);
      }
      throw err;
    }
  }

  async findAll(options?: CategoryQueryOptions): Promise<Category[]> {
    try {
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
    } catch (err: unknown) {
      if (this.isPrismaConnectionError(err)) {
        return this.inMemoryFallback.findAll(options);
      }
      throw err;
    }
  }

  async update(category: Category): Promise<Category> {
    const json = category.toJSON();
    if (!isUuid(json.id)) {
      throw new Error(`Invalid category ID format: ${json.id}`);
    }
    try {
      const data: any = {
        shortName: json.shortName,
        longName: json.longName,
        slug: json.slug,
        description: json.description,
        icon: json.icon,
        badge: json.badge,
        sortOrder: json.sortOrder,
        isActive: json.isActive,
      };
      if (json.parentId !== undefined) {
        data.parentId = json.parentId && isUuid(json.parentId) ? json.parentId.trim() : null;
      }
      const updated = await this.prisma.category.update({
        where: { id: json.id },
        data,
        include: {
          _count: {
            select: { products: true },
          },
        },
      });
      return this.toDomain(updated, updated._count?.products ?? 0);
    } catch (err: unknown) {
      if (this.isPrismaConnectionError(err)) {
        return this.inMemoryFallback.update(category);
      }
      throw err;
    }
  }

  async delete(id: string): Promise<boolean> {
    if (!isUuid(id)) return false;
    try {
      await this.prisma.category.delete({ where: { id } });
      return true;
    } catch (err: unknown) {
      if (this.isPrismaConnectionError(err)) {
        return this.inMemoryFallback.delete(id);
      }
      return false;
    }
  }

  async count(): Promise<number> {
    try {
      return await this.prisma.category.count();
    } catch (err: unknown) {
      if (this.isPrismaConnectionError(err)) {
        return this.inMemoryFallback.count();
      }
      throw err;
    }
  }

  async getProductCount(categoryIdOrSlug: string): Promise<number> {
    try {
      const orConditions: any[] = [{ category: { slug: categoryIdOrSlug } }];
      if (isUuid(categoryIdOrSlug)) {
        orConditions.push({ categoryId: categoryIdOrSlug });
      }
      return await this.prisma.product.count({
        where: {
          OR: orConditions,
        },
      });
    } catch (err: unknown) {
      if (this.isPrismaConnectionError(err)) {
        return this.inMemoryFallback.getProductCount(categoryIdOrSlug);
      }
      throw err;
    }
  }
}
