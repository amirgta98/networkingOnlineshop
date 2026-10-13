import type { IProductRepository } from '../../../domain/repositories/product.repository.interface.js';
import type { ProductProps } from '../../../domain/entities/product.entity.js';
import { ProductNotFoundException } from '../../../domain/exceptions/product.exceptions.js';

export class GetProductByIdUseCase {
  constructor(private readonly productRepo: IProductRepository) {}

  public async execute(idOrSlug: string): Promise<ProductProps> {
    let product = await this.productRepo.findById(idOrSlug);
    if (!product) {
      product = await this.productRepo.findBySlug(idOrSlug);
    }
    if (!product) {
      throw new ProductNotFoundException(idOrSlug);
    }
    const json = product.toJSON();
    if (
      json.relatedProductIds &&
      json.relatedProductIds.length > 0 &&
      (!json.relatedProducts || json.relatedProducts.length === 0)
    ) {
      const resolved: ProductProps[] = [];
      for (const relId of json.relatedProductIds) {
        if (relId === json.id || relId === json.slug) continue;
        const found =
          (await this.productRepo.findById(relId)) ||
          (await this.productRepo.findBySlug(relId)) ||
          (await this.productRepo.findBySku(relId));
        if (found) {
          resolved.push(found.toJSON());
        }
      }
      json.relatedProducts = resolved;
    }
    return json;
  }
}
