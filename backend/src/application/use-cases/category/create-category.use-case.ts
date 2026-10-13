import { Injectable, Inject } from '@nestjs/common';
import { CATEGORY_REPOSITORY_TOKEN } from '../../../shared/constants/tokens.js';
import type { ICategoryRepository } from '../../../domain/repositories/category.repository.interface.js';
import { Category } from '../../../domain/entities/category.entity.js';
import { DuplicateCategorySlugException } from '../../../domain/exceptions/category.exceptions.js';
import crypto from 'node:crypto';

export interface CreateCategoryCommand {
  shortName: string;
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
export class CreateCategoryUseCase {
  constructor(
    @Inject(CATEGORY_REPOSITORY_TOKEN)
    private readonly categoryRepository: ICategoryRepository,
  ) {}

  async execute(command: CreateCategoryCommand): Promise<Category> {
    const rawSlug =
      command.slug?.trim() ||
      command.shortName
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9\u0600-\u06FF]+/g, '-')
        .replace(/^-+|-+$/g, '') ||
      `category-${Date.now()}`;

    const existing = await this.categoryRepository.findBySlug(rawSlug);
    if (existing) {
      throw new DuplicateCategorySlugException(rawSlug);
    }

    const category = new Category({
      id: `cat-${crypto.randomUUID()}`,
      shortName: command.shortName.trim(),
      longName: command.longName?.trim() || command.shortName.trim(),
      slug: rawSlug,
      description: command.description?.trim(),
      icon: command.icon?.trim() || 'FolderTree',
      badge: command.badge?.trim(),
      parentId: command.parentId || null,
      sortOrder: typeof command.sortOrder === 'number' ? command.sortOrder : 0,
      isActive: command.isActive ?? true,
      productCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return await this.categoryRepository.create(category);
  }
}
