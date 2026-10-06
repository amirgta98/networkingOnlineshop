import { Module } from '@nestjs/common';
import { UserController } from './presentation/controllers/user.controller.js';
import { CreateUserUseCase } from './application/use-cases/user/create-user.use-case.js';
import { GetUserByIdUseCase } from './application/use-cases/user/get-user-by-id.use-case.js';
import { InMemoryUserRepository } from './infrastructure/database/in-memory/in-memory-user.repository.js';
import { USER_REPOSITORY_TOKEN } from './shared/constants/tokens.js';
import type { IUserRepository } from './domain/repositories/user.repository.interface.js';

@Module({
  controllers: [UserController],
  providers: [
    // 1. Concrete implementation bound to the domain repository interface token
    {
      provide: USER_REPOSITORY_TOKEN,
      useClass: InMemoryUserRepository,
    },

    // 2. Factory providers instantiate pure use cases with repository dependency injected
    {
      provide: CreateUserUseCase,
      useFactory: (userRepo: IUserRepository) => new CreateUserUseCase(userRepo),
      inject: [USER_REPOSITORY_TOKEN],
    },
    {
      provide: GetUserByIdUseCase,
      useFactory: (userRepo: IUserRepository) => new GetUserByIdUseCase(userRepo),
      inject: [USER_REPOSITORY_TOKEN],
    },
  ],
  exports: [CreateUserUseCase, GetUserByIdUseCase],
})
export class UsersModule {}
