import { Module } from '@nestjs/common';
import { SpecialOffersController } from './presentation/controllers/special-offers.controller.js';
import { CreateSpecialOfferUseCase } from './application/use-cases/special-offer/create-special-offer.use-case.js';
import { GetSpecialOffersUseCase } from './application/use-cases/special-offer/get-special-offers.use-case.js';
import { GetActiveSpecialOfferUseCase } from './application/use-cases/special-offer/get-active-special-offer.use-case.js';
import { GetSpecialOfferByIdUseCase } from './application/use-cases/special-offer/get-special-offer-by-id.use-case.js';
import { UpdateSpecialOfferUseCase } from './application/use-cases/special-offer/update-special-offer.use-case.js';
import { UpdateSpecialOfferStatusUseCase } from './application/use-cases/special-offer/update-special-offer-status.use-case.js';
import { DeleteSpecialOfferUseCase } from './application/use-cases/special-offer/delete-special-offer.use-case.js';

import { GetDiscountedProductsUseCase } from './application/use-cases/special-offer/get-discounted-products.use-case.js';
import { StopActiveSpecialOfferUseCase } from './application/use-cases/special-offer/stop-active-special-offer.use-case.js';

import { PrismaService } from './infrastructure/database/prisma/prisma.service.js';
import { PrismaSpecialOfferRepository } from './infrastructure/database/prisma/repositories/prisma-special-offer.repository.js';
import { InMemorySpecialOfferRepository } from './infrastructure/database/in-memory/in-memory-special-offer.repository.js';
import {
  SPECIAL_OFFER_REPOSITORY_TOKEN,
  PRODUCT_REPOSITORY_TOKEN,
} from './shared/constants/tokens.js';
import type { ISpecialOfferRepository } from './domain/repositories/special-offer.repository.interface.js';
import type { IProductRepository } from './domain/repositories/product.repository.interface.js';

import { AuthModule } from './auth.module.js';
import { ProductsModule } from './products.module.js';

@Module({
  imports: [AuthModule, ProductsModule],
  controllers: [SpecialOffersController],
  providers: [
    PrismaService,
    {
      provide: SPECIAL_OFFER_REPOSITORY_TOKEN,
      useFactory: (prisma: PrismaService) => {
        if (
          process.env.USE_PRISMA_REPO === 'true' ||
          (process.env.DATABASE_URL && process.env.NODE_ENV !== 'test')
        ) {
          return new PrismaSpecialOfferRepository(prisma);
        }
        return new InMemorySpecialOfferRepository();
      },
      inject: [PrismaService],
    },
    {
      provide: CreateSpecialOfferUseCase,
      useFactory: (
        specialOfferRepo: ISpecialOfferRepository,
        productRepo: IProductRepository,
      ) => new CreateSpecialOfferUseCase(specialOfferRepo, productRepo),
      inject: [SPECIAL_OFFER_REPOSITORY_TOKEN, PRODUCT_REPOSITORY_TOKEN],
    },
    {
      provide: GetSpecialOffersUseCase,
      useFactory: (specialOfferRepo: ISpecialOfferRepository) =>
        new GetSpecialOffersUseCase(specialOfferRepo),
      inject: [SPECIAL_OFFER_REPOSITORY_TOKEN],
    },
    {
      provide: GetActiveSpecialOfferUseCase,
      useFactory: (specialOfferRepo: ISpecialOfferRepository) =>
        new GetActiveSpecialOfferUseCase(specialOfferRepo),
      inject: [SPECIAL_OFFER_REPOSITORY_TOKEN],
    },
    {
      provide: GetSpecialOfferByIdUseCase,
      useFactory: (specialOfferRepo: ISpecialOfferRepository) =>
        new GetSpecialOfferByIdUseCase(specialOfferRepo),
      inject: [SPECIAL_OFFER_REPOSITORY_TOKEN],
    },
    {
      provide: UpdateSpecialOfferUseCase,
      useFactory: (
        specialOfferRepo: ISpecialOfferRepository,
        productRepo: IProductRepository,
      ) => new UpdateSpecialOfferUseCase(specialOfferRepo, productRepo),
      inject: [SPECIAL_OFFER_REPOSITORY_TOKEN, PRODUCT_REPOSITORY_TOKEN],
    },
    {
      provide: UpdateSpecialOfferStatusUseCase,
      useFactory: (specialOfferRepo: ISpecialOfferRepository) =>
        new UpdateSpecialOfferStatusUseCase(specialOfferRepo),
      inject: [SPECIAL_OFFER_REPOSITORY_TOKEN],
    },
    {
      provide: DeleteSpecialOfferUseCase,
      useFactory: (specialOfferRepo: ISpecialOfferRepository) =>
        new DeleteSpecialOfferUseCase(specialOfferRepo),
      inject: [SPECIAL_OFFER_REPOSITORY_TOKEN],
    },
    {
      provide: GetDiscountedProductsUseCase,
      useFactory: (specialOfferRepo: ISpecialOfferRepository) =>
        new GetDiscountedProductsUseCase(specialOfferRepo),
      inject: [SPECIAL_OFFER_REPOSITORY_TOKEN],
    },
    {
      provide: StopActiveSpecialOfferUseCase,
      useFactory: (specialOfferRepo: ISpecialOfferRepository) =>
        new StopActiveSpecialOfferUseCase(specialOfferRepo),
      inject: [SPECIAL_OFFER_REPOSITORY_TOKEN],
    },
  ],
  exports: [
    SPECIAL_OFFER_REPOSITORY_TOKEN,
    CreateSpecialOfferUseCase,
    GetSpecialOffersUseCase,
    GetActiveSpecialOfferUseCase,
    GetSpecialOfferByIdUseCase,
    UpdateSpecialOfferUseCase,
    UpdateSpecialOfferStatusUseCase,
    DeleteSpecialOfferUseCase,
    GetDiscountedProductsUseCase,
    StopActiveSpecialOfferUseCase,
  ],
})
export class SpecialOffersModule {}
