import type { IProductRepository } from '../../../domain/repositories/product.repository.interface.js';
import { InvalidProductDataException } from '../../../domain/exceptions/product.exceptions.js';

export interface BulkUpdateProductStatusInput {
  ids: string[];
  status: 'active' | 'inactive' | 'out_of_stock' | 'discontinued';
}

export interface BulkUpdateProductStatusResult {
  success: boolean;
  updatedCount: number;
  ids: string[];
}

export class BulkUpdateProductStatusUseCase {
  constructor(private readonly productRepo: IProductRepository) {}

  public async execute(input: BulkUpdateProductStatusInput): Promise<BulkUpdateProductStatusResult> {
    if (!input || !Array.isArray(input.ids) || input.ids.length === 0) {
      throw new InvalidProductDataException('لیست شناسه‌های کالا نمی‌تواند خالی باشد.');
    }

    const validStatuses = ['active', 'inactive', 'out_of_stock', 'discontinued'];
    if (!validStatuses.includes(input.status)) {
      throw new InvalidProductDataException('وضعیت درخواستی برای بروزرسانی دسته‌ای نامعتبر است.');
    }

    const updatedIds: string[] = [];

    for (const rawId of input.ids) {
      if (!rawId || typeof rawId !== 'string') continue;
      const id = rawId.trim();
      let product = await this.productRepo.findById(id);
      if (!product) {
        product = await this.productRepo.findBySlug(id);
      }
      if (!product) continue;

      if (input.status === 'out_of_stock') {
        product.updateDetails({ status: 'out_of_stock', stock: 0 });
      } else {
        product.updateDetails({ status: input.status });
      }

      await this.productRepo.save(product);
      updatedIds.push(product.id);
    }

    return {
      success: true,
      updatedCount: updatedIds.length,
      ids: updatedIds,
    };
  }
}
