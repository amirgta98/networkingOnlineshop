import { Module } from '@nestjs/common';
import { ProductController } from './presentation/controllers/product.controller.js';
import { CreateProductUseCase } from './application/use-cases/product/create-product.use-case.js';
import { GetProductsUseCase } from './application/use-cases/product/get-products.use-case.js';
import { GetProductByIdUseCase } from './application/use-cases/product/get-product-by-id.use-case.js';
import { UpdateProductUseCase } from './application/use-cases/product/update-product.use-case.js';
import { DeleteProductUseCase } from './application/use-cases/product/delete-product.use-case.js';
import { UpdateProductStockUseCase } from './application/use-cases/product/update-product-stock.use-case.js';
import { InMemoryProductRepository } from './infrastructure/database/in-memory/in-memory-product.repository.js';
import { SharpImageProcessingService } from './infrastructure/services/sharp-image-processing.service.js';
import {
  PRODUCT_REPOSITORY_TOKEN,
  IMAGE_PROCESSING_SERVICE_TOKEN,
} from './shared/constants/tokens.js';
import type { IProductRepository } from './domain/repositories/product.repository.interface.js';

@Module({
  controllers: [ProductController],
  providers: [
    // 1. Image processing service with Sharp
    {
      provide: IMAGE_PROCESSING_SERVICE_TOKEN,
      useClass: SharpImageProcessingService,
    },

    // 2. Product Repository implementation bound to domain token
    {
      provide: PRODUCT_REPOSITORY_TOKEN,
      useClass: InMemoryProductRepository,
    },

    // 3. Factory providers for clean use cases
    {
      provide: CreateProductUseCase,
      useFactory: (repo: IProductRepository) => new CreateProductUseCase(repo),
      inject: [PRODUCT_REPOSITORY_TOKEN],
    },
    {
      provide: GetProductsUseCase,
      useFactory: (repo: IProductRepository) => new GetProductsUseCase(repo),
      inject: [PRODUCT_REPOSITORY_TOKEN],
    },
    {
      provide: GetProductByIdUseCase,
      useFactory: (repo: IProductRepository) => new GetProductByIdUseCase(repo),
      inject: [PRODUCT_REPOSITORY_TOKEN],
    },
    {
      provide: UpdateProductUseCase,
      useFactory: (repo: IProductRepository) => new UpdateProductUseCase(repo),
      inject: [PRODUCT_REPOSITORY_TOKEN],
    },
    {
      provide: DeleteProductUseCase,
      useFactory: (repo: IProductRepository) => new DeleteProductUseCase(repo),
      inject: [PRODUCT_REPOSITORY_TOKEN],
    },
    {
      provide: UpdateProductStockUseCase,
      useFactory: (repo: IProductRepository) => new UpdateProductStockUseCase(repo),
      inject: [PRODUCT_REPOSITORY_TOKEN],
    },
  ],
  exports: [
    CreateProductUseCase,
    GetProductsUseCase,
    GetProductByIdUseCase,
    UpdateProductUseCase,
    DeleteProductUseCase,
    UpdateProductStockUseCase,
    PRODUCT_REPOSITORY_TOKEN,
    IMAGE_PROCESSING_SERVICE_TOKEN,
  ],
})
export class ProductsModule {}
