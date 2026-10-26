import { Module } from '@nestjs/common';
import { AddressController } from './presentation/controllers/address.controller.js';
import { ProjectsController } from './presentation/controllers/projects.controller.js';
import { GetUserAddressesUseCase } from './application/use-cases/address/get-user-addresses.use-case.js';
import { GetAddressByIdUseCase } from './application/use-cases/address/get-address-by-id.use-case.js';
import { CreateAddressUseCase } from './application/use-cases/address/create-address.use-case.js';
import { UpdateAddressUseCase } from './application/use-cases/address/update-address.use-case.js';
import { DeleteAddressUseCase } from './application/use-cases/address/delete-address.use-case.js';
import { SetDefaultAddressUseCase } from './application/use-cases/address/set-default-address.use-case.js';
import { InMemoryUserAddressRepository } from './infrastructure/database/in-memory/in-memory-user-address.repository.js';
import { PrismaUserAddressRepository } from './infrastructure/database/prisma/repositories/prisma-user-address.repository.js';
import { PrismaService } from './infrastructure/database/prisma/prisma.service.js';
import { AuthModule } from './auth.module.js';
import { UsersModule } from './users.module.js';
import { ADDRESS_REPOSITORY_TOKEN } from './shared/constants/tokens.js';
import type { IUserAddressRepository } from './domain/repositories/user-address.repository.interface.js';

@Module({
  imports: [AuthModule, UsersModule],
  controllers: [AddressController, ProjectsController],
  providers: [
    PrismaService,
    {
      provide: ADDRESS_REPOSITORY_TOKEN,
      useFactory: (prisma: PrismaService) => {
        if (process.env.USE_PRISMA_REPO === 'true' || (process.env.DATABASE_URL && process.env.NODE_ENV !== 'test')) {
          return new PrismaUserAddressRepository(prisma);
        }
        return new InMemoryUserAddressRepository();
      },
      inject: [PrismaService],
    },
    {
      provide: GetUserAddressesUseCase,
      useFactory: (repo: IUserAddressRepository) => new GetUserAddressesUseCase(repo),
      inject: [ADDRESS_REPOSITORY_TOKEN],
    },
    {
      provide: GetAddressByIdUseCase,
      useFactory: (repo: IUserAddressRepository) => new GetAddressByIdUseCase(repo),
      inject: [ADDRESS_REPOSITORY_TOKEN],
    },
    {
      provide: CreateAddressUseCase,
      useFactory: (repo: IUserAddressRepository) => new CreateAddressUseCase(repo),
      inject: [ADDRESS_REPOSITORY_TOKEN],
    },
    {
      provide: UpdateAddressUseCase,
      useFactory: (repo: IUserAddressRepository) => new UpdateAddressUseCase(repo),
      inject: [ADDRESS_REPOSITORY_TOKEN],
    },
    {
      provide: DeleteAddressUseCase,
      useFactory: (repo: IUserAddressRepository) => new DeleteAddressUseCase(repo),
      inject: [ADDRESS_REPOSITORY_TOKEN],
    },
    {
      provide: SetDefaultAddressUseCase,
      useFactory: (repo: IUserAddressRepository) => new SetDefaultAddressUseCase(repo),
      inject: [ADDRESS_REPOSITORY_TOKEN],
    },
  ],
  exports: [
    ADDRESS_REPOSITORY_TOKEN,
    GetUserAddressesUseCase,
    GetAddressByIdUseCase,
    CreateAddressUseCase,
    UpdateAddressUseCase,
    DeleteAddressUseCase,
    SetDefaultAddressUseCase,
  ],
})
export class AddressesModule {}
