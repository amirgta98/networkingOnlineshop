import type { Category } from '../entities/category.entity.js';

export interface CategoryQueryOptions {
  search?: string;
  isActive?: boolean;
  parentId?: string | null;
}

export interface ICategoryRepository {
  create(category: Category): Promise<Category>;
  findById(id: string): Promise<Category | null>;
  findBySlug(slug: string): Promise<Category | null>;
  findAll(options?: CategoryQueryOptions): Promise<Category[]>;
  update(category: Category): Promise<Category>;
  delete(id: string): Promise<boolean>;
  count(): Promise<number>;
  getProductCount(categoryIdOrSlug: string): Promise<number>;
}
