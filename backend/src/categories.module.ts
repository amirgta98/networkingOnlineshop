import { Module } from '@nestjs/common';
import { CategoryController } from './presentation/controllers/category.controller.js';
import { CreateCategoryUseCase } from './application/use-cases/category/create-category.use-case.js';
import { GetCategoriesUseCase } from './application/use-cases/category/get-categories.use-case.js';
import { GetCategoryByIdUseCase } from './application/use-cases/category/get-category-by-id.use-case.js';
import { UpdateCategoryUseCase } from './application/use-cases/category/update-category.use-case.js';
import { DeleteCategoryUseCase } from './application/use-cases/category/delete-category.use-case.js';
import { InMemoryCategoryRepository } from './infrastructure/database/in-memory/in-memory-category.repository.js';
import { PrismaCategoryRepository } from './infrastructure/database/prisma/repositories/prisma-category.repository.js';
import { PrismaService } from './infrastructure/database/prisma/prisma.service.js';
import {
  CATEGORY_REPOSITORY_TOKEN,
  PRODUCT_REPOSITORY_TOKEN,
} from './shared/constants/tokens.js';
import type { ICategoryRepository } from './domain/repositories/category.repository.interface.js';
import type { IProductRepository } from './domain/repositories/product.repository.interface.js';

@Module({
  controllers: [CategoryController],
  providers: [
    PrismaService,
    {
      provide: CATEGORY_REPOSITORY_TOKEN,
      useFactory: (prisma: PrismaService, productRepo?: IProductRepository) => {
        if (process.env.USE_PRISMA_REPO === 'true') {
          return new PrismaCategoryRepository(prisma);
        }
        return new InMemoryCategoryRepository(productRepo);
      },
      inject: [PrismaService, { token: PRODUCT_REPOSITORY_TOKEN, optional: true }],
    },
    {
      provide: CreateCategoryUseCase,
      useFactory: (repo: ICategoryRepository) => new CreateCategoryUseCase(repo),
      inject: [CATEGORY_REPOSITORY_TOKEN],
    },
    {
      provide: GetCategoriesUseCase,
      useFactory: (repo: ICategoryRepository) => new GetCategoriesUseCase(repo),
      inject: [CATEGORY_REPOSITORY_TOKEN],
    },
    {
      provide: GetCategoryByIdUseCase,
      useFactory: (repo: ICategoryRepository) => new GetCategoryByIdUseCase(repo),
      inject: [CATEGORY_REPOSITORY_TOKEN],
    },
    {
      provide: UpdateCategoryUseCase,
      useFactory: (repo: ICategoryRepository) => new UpdateCategoryUseCase(repo),
      inject: [CATEGORY_REPOSITORY_TOKEN],
    },
    {
      provide: DeleteCategoryUseCase,
      useFactory: (repo: ICategoryRepository) => new DeleteCategoryUseCase(repo),
      inject: [CATEGORY_REPOSITORY_TOKEN],
    },
  ],
  exports: [
    CATEGORY_REPOSITORY_TOKEN,
    GetCategoriesUseCase,
    GetCategoryByIdUseCase,
  ],
})
export class CategoriesModule {}
