import type { Product } from '../entities/product.entity.js';

export interface ProductQueryParams {
  search?: string;
  category?: string;
  status?: string;
  brand?: string;
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface PaginatedProductsResult {
  products: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface IProductRepository {
  save(product: Product): Promise<Product>;
  findById(id: string): Promise<Product | null>;
  findBySku(sku: string): Promise<Product | null>;
  findBySlug(slug: string): Promise<Product | null>;
  findAll(params?: ProductQueryParams): Promise<PaginatedProductsResult>;
  delete(id: string): Promise<boolean>;
}
