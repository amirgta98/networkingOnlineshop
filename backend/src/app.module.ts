import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { appConfig } from './infrastructure/config/app.config.js';
import { UsersModule } from './users.module.js';
import { AuthModule } from './auth.module.js';
import { ProductsModule } from './products.module.js';
import { CategoriesModule } from './categories.module.js';
import { AddressesModule } from './addresses.module.js';
import { InvoicesModule } from './invoices.module.js';
import { ShippingModule } from './shipping.module.js';
import { OrdersModule } from './orders.module.js';
import { SystemController } from './presentation/controllers/system.controller.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig],
    }),
    UsersModule,
    AuthModule,
    ProductsModule,
    CategoriesModule,
    AddressesModule,
    InvoicesModule,
    ShippingModule,
    OrdersModule,
  ],
  controllers: [SystemController],
})
export class AppModule {}
