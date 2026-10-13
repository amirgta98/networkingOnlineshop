import { Injectable, Inject } from '@nestjs/common';
import { CATEGORY_REPOSITORY_TOKEN } from '../../../shared/constants/tokens.js';
import type { ICategoryRepository } from '../../../domain/repositories/category.repository.interface.js';
import type { Category } from '../../../domain/entities/category.entity.js';
import {
  CategoryNotFoundException,
  DuplicateCategorySlugException,
} from '../../../domain/exceptions/category.exceptions.js';

export interface UpdateCategoryCommand {
  id: string;
  shortName?: string;
  longName?: string;
  slug?: string;
  description?: string;
  icon?: string;
  badge?: string;
  parentId?: string | null;
  sortOrder?: number;
  isActive?: boolean;
}

@Injectable()
export class UpdateCategoryUseCase {
  constructor(
    @Inject(CATEGORY_REPOSITORY_TOKEN)
    private readonly categoryRepository: ICategoryRepository,
  ) {}

  async execute(command: UpdateCategoryCommand): Promise<Category> {
    const category = await this.categoryRepository.findById(command.id);
    if (!category) {
      throw new CategoryNotFoundException(command.id);
    }

    if (command.slug && command.slug !== category.slug) {
      const existing = await this.categoryRepository.findBySlug(command.slug);
      if (existing && existing.id !== category.id) {
        throw new DuplicateCategorySlugException(command.slug);
      }
    }

    category.update({
      shortName: command.shortName?.trim(),
      longName: command.longName?.trim(),
      slug: command.slug?.trim(),
      description: command.description?.trim(),
      icon: command.icon?.trim(),
      badge: command.badge?.trim(),
      parentId: command.parentId,
      sortOrder: command.sortOrder,
      isActive: command.isActive,
    });

    return await this.categoryRepository.update(category);
  }
}
