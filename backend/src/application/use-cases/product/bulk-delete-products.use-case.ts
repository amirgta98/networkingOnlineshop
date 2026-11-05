import type { IProductRepository } from '../../../domain/repositories/product.repository.interface.js';
import { InvalidProductDataException } from '../../../domain/exceptions/product.exceptions.js';

export interface BulkDeleteProductsInput {
  ids: string[];
}

export interface BulkDeleteProductsResult {
  success: boolean;
  deletedCount: number;
  ids: string[];
}

export class BulkDeleteProductsUseCase {
  constructor(private readonly productRepo: IProductRepository) {}

  public async execute(input: BulkDeleteProductsInput): Promise<BulkDeleteProductsResult> {
    if (!input || !Array.isArray(input.ids) || input.ids.length === 0) {
      throw new InvalidProductDataException('لیست شناسه‌های کالا برای حذف دسته‌ای نمی‌تواند خالی باشد.');
    }

    const deletedIds: string[] = [];

    for (const rawId of input.ids) {
      if (!rawId || typeof rawId !== 'string') continue;
      const id = rawId.trim();
      let product = await this.productRepo.findById(id);
      if (!product) {
        product = await this.productRepo.findBySlug(id);
      }
      if (!product) continue;

      const deleted = await this.productRepo.delete(product.id);
      if (deleted) {
        deletedIds.push(product.id);
      }
    }

    return {
      success: true,
      deletedCount: deletedIds.length,
      ids: deletedIds,
    };
  }
}
