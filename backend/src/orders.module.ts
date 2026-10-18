import { Module } from '@nestjs/common';
import { OrdersController } from './presentation/controllers/orders.controller.js';
import { CreateOrderUseCase } from './application/use-cases/order/create-order.use-case.js';
import { GetAllOrdersUseCase } from './application/use-cases/order/get-all-orders.use-case.js';
import { GetOrderByIdUseCase } from './application/use-cases/order/get-order-by-id.use-case.js';
import { GetUserOrdersUseCase } from './application/use-cases/order/get-user-orders.use-case.js';
import { UpdateOrderStatusUseCase } from './application/use-cases/order/update-order-status.use-case.js';
import { AssignOrderCarrierUseCase } from './application/use-cases/order/assign-order-carrier.use-case.js';
import { InMemoryOrderRepository } from './infrastructure/database/in-memory/in-memory-order.repository.js';
import { PrismaOrderRepository } from './infrastructure/database/prisma/repositories/prisma-order.repository.js';
import { PrismaService } from './infrastructure/database/prisma/prisma.service.js';
import {
  ORDER_REPOSITORY_TOKEN,
  PRODUCT_REPOSITORY_TOKEN,
  USER_REPOSITORY_TOKEN,
} from './shared/constants/tokens.js';
import type { IOrderRepository } from './domain/repositories/order.repository.interface.js';
import type { IProductRepository } from './domain/repositories/product.repository.interface.js';
import type { IUserRepository } from './domain/repositories/user.repository.interface.js';
import { AuthModule } from './auth.module.js';
import { UsersModule } from './users.module.js';
import { ProductsModule } from './products.module.js';

@Module({
  imports: [AuthModule, UsersModule, ProductsModule],
  controllers: [OrdersController],
  providers: [
    PrismaService,
    {
      provide: ORDER_REPOSITORY_TOKEN,
      useFactory: (prisma: PrismaService) => {
        if (
          process.env.USE_PRISMA_REPO === 'true' ||
          (process.env.DATABASE_URL && process.env.NODE_ENV !== 'test')
        ) {
          return new PrismaOrderRepository(prisma);
        }
        return new InMemoryOrderRepository();
      },
      inject: [PrismaService],
    },
    {
      provide: CreateOrderUseCase,
      useFactory: (
        orderRepo: IOrderRepository,
        productRepo: IProductRepository,
        userRepo: IUserRepository,
      ) => new CreateOrderUseCase(orderRepo, productRepo, userRepo),
      inject: [ORDER_REPOSITORY_TOKEN, PRODUCT_REPOSITORY_TOKEN, USER_REPOSITORY_TOKEN],
    },
    {
      provide: GetAllOrdersUseCase,
      useFactory: (orderRepo: IOrderRepository) => new GetAllOrdersUseCase(orderRepo),
      inject: [ORDER_REPOSITORY_TOKEN],
    },
    {
      provide: GetOrderByIdUseCase,
      useFactory: (orderRepo: IOrderRepository) => new GetOrderByIdUseCase(orderRepo),
      inject: [ORDER_REPOSITORY_TOKEN],
    },
    {
      provide: GetUserOrdersUseCase,
      useFactory: (orderRepo: IOrderRepository) => new GetUserOrdersUseCase(orderRepo),
      inject: [ORDER_REPOSITORY_TOKEN],
    },
    {
      provide: UpdateOrderStatusUseCase,
      useFactory: (orderRepo: IOrderRepository) => new UpdateOrderStatusUseCase(orderRepo),
      inject: [ORDER_REPOSITORY_TOKEN],
    },
    {
      provide: AssignOrderCarrierUseCase,
      useFactory: (orderRepo: IOrderRepository) => new AssignOrderCarrierUseCase(orderRepo),
      inject: [ORDER_REPOSITORY_TOKEN],
    },
  ],
  exports: [
    ORDER_REPOSITORY_TOKEN,
    CreateOrderUseCase,
    GetAllOrdersUseCase,
    GetOrderByIdUseCase,
    GetUserOrdersUseCase,
    UpdateOrderStatusUseCase,
    AssignOrderCarrierUseCase,
  ],
})
export class OrdersModule {}
