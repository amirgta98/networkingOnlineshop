import type { IProductRepository } from '../../../domain/repositories/product.repository.interface.js';
import type { ProductProps } from '../../../domain/entities/product.entity.js';
import {
  ProductNotFoundException,
  InvalidProductDataException,
} from '../../../domain/exceptions/product.exceptions.js';

export interface UpdateProductStockInput {
  stock: number;
  price?: number;
  note?: string;
}

export class UpdateProductStockUseCase {
  constructor(private readonly productRepo: IProductRepository) {}

  public async execute(id: string, input: UpdateProductStockInput): Promise<ProductProps> {
    let existing = await this.productRepo.findById(id);
    if (!existing) {
      existing = await this.productRepo.findBySlug(id);
    }
    if (!existing) {
      throw new ProductNotFoundException(id);
    }

    if (input.stock < 0) {
      throw new InvalidProductDataException('موجودی انبار نمی‌تواند کمتر از صفر باشد.');
    }
    if (input.price !== undefined && input.price <= 0) {
      throw new InvalidProductDataException('قیمت فروش باید بزرگتر از صفر تومان باشد.');
    }

    existing.updateStock(input.stock, input.price);
    const saved = await this.productRepo.save(existing);
    return saved.toJSON();
  }
}
