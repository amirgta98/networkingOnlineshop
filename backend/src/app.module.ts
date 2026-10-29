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
import { SpecialOffersModule } from './special-offers.module.js';
import { TicketsModule } from './tickets.module.js';
import { SecurityModule } from './security.module.js';
import { ArticlesModule } from './articles.module.js';
import { PortfolioModule } from './portfolio.module.js';
import { PaymentsModule } from './payments.module.js';
import { AffiliateModule } from './affiliate.module.js';
import { InstallationModule } from './installation.module.js';
import { CareersModule } from './careers.module.js';
import { InternetModule } from './internet.module.js';
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
    SpecialOffersModule,
    TicketsModule,
    SecurityModule,
    ArticlesModule,
    PortfolioModule,
    PaymentsModule,
    AffiliateModule,
    InstallationModule,
    CareersModule,
    InternetModule,
  ],
  controllers: [SystemController],
})
export class AppModule {}
