import { Module } from '@nestjs/common';
import { UserController } from './presentation/controllers/user.controller.js';
import { CreateUserUseCase } from './application/use-cases/user/create-user.use-case.js';
import { GetUserByIdUseCase } from './application/use-cases/user/get-user-by-id.use-case.js';
import { GetAllUsersUseCase } from './application/use-cases/user/get-all-users.use-case.js';
import { UpdateUserRoleUseCase } from './application/use-cases/user/update-user-role.use-case.js';
import { UpdateUserStatusUseCase } from './application/use-cases/user/update-user-status.use-case.js';
import { UpdateUserUseCase } from './application/use-cases/user/update-user.use-case.js';
import { DeleteUserUseCase } from './application/use-cases/user/delete-user.use-case.js';
import { InMemoryUserRepository } from './infrastructure/database/in-memory/in-memory-user.repository.js';
import { PrismaUserRepository } from './infrastructure/database/prisma/repositories/prisma-user.repository.js';
import { PrismaService } from './infrastructure/database/prisma/prisma.service.js';
import { USER_REPOSITORY_TOKEN } from './shared/constants/tokens.js';
import type { IUserRepository } from './domain/repositories/user.repository.interface.js';

@Module({
  controllers: [UserController],
  providers: [
    PrismaService,
    // 1. Concrete implementation bound to the domain repository interface token
    {
      provide: USER_REPOSITORY_TOKEN,
      useFactory: (prisma: PrismaService) => {
        if (process.env.USE_PRISMA_REPO === 'true') {
          return new PrismaUserRepository(prisma);
        }
        return new InMemoryUserRepository();
      },
      inject: [PrismaService],
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
    {
      provide: GetAllUsersUseCase,
      useFactory: (userRepo: IUserRepository) => new GetAllUsersUseCase(userRepo),
      inject: [USER_REPOSITORY_TOKEN],
    },
    {
      provide: UpdateUserRoleUseCase,
      useFactory: (userRepo: IUserRepository) => new UpdateUserRoleUseCase(userRepo),
      inject: [USER_REPOSITORY_TOKEN],
    },
    {
      provide: UpdateUserStatusUseCase,
      useFactory: (userRepo: IUserRepository) => new UpdateUserStatusUseCase(userRepo),
      inject: [USER_REPOSITORY_TOKEN],
    },
    {
      provide: UpdateUserUseCase,
      useFactory: (userRepo: IUserRepository) => new UpdateUserUseCase(userRepo),
      inject: [USER_REPOSITORY_TOKEN],
    },
    {
      provide: DeleteUserUseCase,
      useFactory: (userRepo: IUserRepository) => new DeleteUserUseCase(userRepo),
      inject: [USER_REPOSITORY_TOKEN],
    },
  ],
  exports: [
    USER_REPOSITORY_TOKEN,
    CreateUserUseCase,
    GetUserByIdUseCase,
    GetAllUsersUseCase,
    UpdateUserRoleUseCase,
    UpdateUserStatusUseCase,
    UpdateUserUseCase,
    DeleteUserUseCase,
  ],
})
export class UsersModule {}
