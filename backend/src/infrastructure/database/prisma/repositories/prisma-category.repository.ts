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
      const created = await this.prisma.category.create({
        data: {
          id: json.id || crypto.randomUUID(),
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
    } catch (err: unknown) {
      if (this.isPrismaConnectionError(err)) {
        return this.inMemoryFallback.create(category);
      }
      throw err;
    }
  }

  async findById(id: string): Promise<Category | null> {
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
    try {
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
    } catch (err: unknown) {
      if (this.isPrismaConnectionError(err)) {
        return this.inMemoryFallback.update(category);
      }
      throw err;
    }
  }

  async delete(id: string): Promise<boolean> {
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
      return await this.prisma.product.count({
        where: {
          OR: [
            { categoryId: categoryIdOrSlug },
            { category: { slug: categoryIdOrSlug } },
          ],
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
