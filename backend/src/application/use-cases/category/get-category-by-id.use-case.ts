import { Injectable, Inject } from '@nestjs/common';
import { CATEGORY_REPOSITORY_TOKEN } from '../../../shared/constants/tokens.js';
import type { ICategoryRepository } from '../../../domain/repositories/category.repository.interface.js';
import type { Category } from '../../../domain/entities/category.entity.js';
import { CategoryNotFoundException } from '../../../domain/exceptions/category.exceptions.js';

@Injectable()
export class GetCategoryByIdUseCase {
  constructor(
    @Inject(CATEGORY_REPOSITORY_TOKEN)
    private readonly categoryRepository: ICategoryRepository,
  ) {}

  async execute(idOrSlug: string): Promise<Category> {
    let found = await this.categoryRepository.findById(idOrSlug);
    if (!found) {
      found = await this.categoryRepository.findBySlug(idOrSlug);
    }
    if (!found) {
      throw new CategoryNotFoundException(idOrSlug);
    }
    return found;
  }
}
