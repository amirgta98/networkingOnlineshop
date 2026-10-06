import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { appConfig } from './infrastructure/config/app.config.js';
import { UsersModule } from './users.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig],
    }),
    UsersModule,
  ],
})
export class AppModule {}
