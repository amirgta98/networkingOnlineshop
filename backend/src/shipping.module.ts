import { Module } from '@nestjs/common';
import { ShippingController } from './presentation/controllers/shipping.controller.js';
import { GetShippingMethodsUseCase } from './application/use-cases/shipping/get-shipping-methods.use-case.js';
import { GetDeliveryScheduleUseCase } from './application/use-cases/shipping/get-delivery-schedule.use-case.js';
import { CalculateShippingUseCase } from './application/use-cases/shipping/calculate-shipping.use-case.js';
import { ManageShippingMethodsUseCase } from './application/use-cases/shipping/manage-shipping-methods.use-case.js';
import { ManageShippingConfigUseCase } from './application/use-cases/shipping/manage-shipping-config.use-case.js';
import { InMemoryShippingRepository } from './infrastructure/database/in-memory/in-memory-shipping.repository.js';
import { SharpImageProcessingService } from './infrastructure/services/sharp-image-processing.service.js';
import {
  SHIPPING_REPOSITORY_TOKEN,
  IMAGE_PROCESSING_SERVICE_TOKEN,
} from './shared/constants/tokens.js';
import type { IShippingRepository } from './domain/repositories/shipping.repository.interface.js';

@Module({
  controllers: [ShippingController],
  providers: [
    {
      provide: IMAGE_PROCESSING_SERVICE_TOKEN,
      useClass: SharpImageProcessingService,
    },
    {
      provide: SHIPPING_REPOSITORY_TOKEN,
      useClass: InMemoryShippingRepository,
    },
    {
      provide: GetShippingMethodsUseCase,
      useFactory: (repo: IShippingRepository) => new GetShippingMethodsUseCase(repo),
      inject: [SHIPPING_REPOSITORY_TOKEN],
    },
    {
      provide: GetDeliveryScheduleUseCase,
      useFactory: (repo: IShippingRepository) => new GetDeliveryScheduleUseCase(repo),
      inject: [SHIPPING_REPOSITORY_TOKEN],
    },
    {
      provide: CalculateShippingUseCase,
      useFactory: (repo: IShippingRepository) => new CalculateShippingUseCase(repo),
      inject: [SHIPPING_REPOSITORY_TOKEN],
    },
    {
      provide: ManageShippingMethodsUseCase,
      useFactory: (repo: IShippingRepository) => new ManageShippingMethodsUseCase(repo),
      inject: [SHIPPING_REPOSITORY_TOKEN],
    },
    {
      provide: ManageShippingConfigUseCase,
      useFactory: (repo: IShippingRepository) => new ManageShippingConfigUseCase(repo),
      inject: [SHIPPING_REPOSITORY_TOKEN],
    },
  ],
  exports: [
    SHIPPING_REPOSITORY_TOKEN,
    GetShippingMethodsUseCase,
    GetDeliveryScheduleUseCase,
    CalculateShippingUseCase,
    ManageShippingMethodsUseCase,
    ManageShippingConfigUseCase,
  ],
})
export class ShippingModule {}
