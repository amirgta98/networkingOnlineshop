import type { IProductRepository } from '../../../domain/repositories/product.repository.interface.js';
import { ProductNotFoundException } from '../../../domain/exceptions/product.exceptions.js';

export class DeleteProductUseCase {
  constructor(private readonly productRepo: IProductRepository) {}

  public async execute(id: string): Promise<{ success: boolean; id: string }> {
    let existing = await this.productRepo.findById(id);
    if (!existing) {
      existing = await this.productRepo.findBySlug(id);
    }
    if (!existing) {
      throw new ProductNotFoundException(id);
    }

    const deleted = await this.productRepo.delete(existing.id);
    return { success: deleted, id: existing.id };
  }
}
