import type {
  IProductRepository,
  ProductQueryParams,
} from '../../../domain/repositories/product.repository.interface.js';
import type { ProductProps } from '../../../domain/entities/product.entity.js';

export interface PaginatedProductsResponseDto {
  products: ProductProps[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export class GetProductsUseCase {
  constructor(private readonly productRepo: IProductRepository) {}

  public async execute(params?: ProductQueryParams): Promise<PaginatedProductsResponseDto> {
    const result = await this.productRepo.findAll(params);
    return {
      products: result.products.map((p) => p.toJSON()),
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    };
  }
}
