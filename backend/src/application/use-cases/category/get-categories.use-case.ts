import { Injectable, Inject } from '@nestjs/common';
import { CATEGORY_REPOSITORY_TOKEN } from '../../../shared/constants/tokens.js';
import type {
  ICategoryRepository,
  CategoryQueryOptions,
} from '../../../domain/repositories/category.repository.interface.js';
import type { Category } from '../../../domain/entities/category.entity.js';

@Injectable()
export class GetCategoriesUseCase {
  constructor(
    @Inject(CATEGORY_REPOSITORY_TOKEN)
    private readonly categoryRepository: ICategoryRepository,
  ) {}

  async execute(options?: CategoryQueryOptions): Promise<Category[]> {
    return await this.categoryRepository.findAll(options);
  }
}
