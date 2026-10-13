import { Injectable, Inject } from '@nestjs/common';
import { CATEGORY_REPOSITORY_TOKEN } from '../../../shared/constants/tokens.js';
import type { ICategoryRepository } from '../../../domain/repositories/category.repository.interface.js';
import {
  CategoryNotFoundException,
  CategoryHasProductsException,
} from '../../../domain/exceptions/category.exceptions.js';

@Injectable()
export class DeleteCategoryUseCase {
  constructor(
    @Inject(CATEGORY_REPOSITORY_TOKEN)
    private readonly categoryRepository: ICategoryRepository,
  ) {}

  async execute(id: string, force: boolean = false): Promise<boolean> {
    const category = await this.categoryRepository.findById(id);
    if (!category) {
      throw new CategoryNotFoundException(id);
    }

    const productCount = await this.categoryRepository.getProductCount(category.slug);
    if (productCount > 0 && !force) {
      throw new CategoryHasProductsException(category.shortName, productCount);
    }

    return await this.categoryRepository.delete(id);
  }
}
