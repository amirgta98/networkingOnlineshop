import { Module } from '@nestjs/common';
import { UserController } from './presentation/controllers/user.controller.js';
import { FavoritesController } from './presentation/controllers/favorites.controller.js';
import { RfqController } from './presentation/controllers/rfq.controller.js';
import { WarrantyController } from './presentation/controllers/warranty.controller.js';
import { CreditController } from './presentation/controllers/credit.controller.js';
import { CreateUserUseCase } from './application/use-cases/user/create-user.use-case.js';
import { GetUserByIdUseCase } from './application/use-cases/user/get-user-by-id.use-case.js';
import { GetAllUsersUseCase } from './application/use-cases/user/get-all-users.use-case.js';
import { UpdateUserRoleUseCase } from './application/use-cases/user/update-user-role.use-case.js';
import { UpdateUserStatusUseCase } from './application/use-cases/user/update-user-status.use-case.js';
import { UpdateUserUseCase } from './application/use-cases/user/update-user.use-case.js';
import { DeleteUserUseCase } from './application/use-cases/user/delete-user.use-case.js';
import { GetUserAddressesUseCase } from './application/use-cases/user/get-user-addresses.use-case.js';
import { GetUserCartUseCase } from './application/use-cases/user/get-user-cart.use-case.js';
import { GetUserOrdersUseCase } from './application/use-cases/user/get-user-orders.use-case.js';
import { GetUserInvoicesUseCase } from './application/use-cases/user/get-user-invoices.use-case.js';
import { GetUserWalletUseCase } from './application/use-cases/user/get-user-wallet.use-case.js';
import { GetUserFavoritesUseCase } from './application/use-cases/user/get-user-favorites.use-case.js';
import { AddUserFavoriteUseCase } from './application/use-cases/user/add-user-favorite.use-case.js';
import { RemoveUserFavoriteUseCase } from './application/use-cases/user/remove-user-favorite.use-case.js';
import { ToggleUserFavoriteUseCase } from './application/use-cases/user/toggle-user-favorite.use-case.js';
import { CheckUserFavoriteUseCase } from './application/use-cases/user/check-user-favorite.use-case.js';
import { GetUserRfqUseCase } from './application/use-cases/user/get-user-rfq.use-case.js';
import { CreateRfqUseCase } from './application/use-cases/rfq/create-rfq.use-case.js';
import { GetUserAuthenticityUseCase } from './application/use-cases/user/get-user-authenticity.use-case.js';
import { VerifySerialUseCase } from './application/use-cases/warranty/verify-serial.use-case.js';
import { CreateRmaUseCase } from './application/use-cases/warranty/create-rma.use-case.js';
import { GetUserCreditUseCase } from './application/use-cases/credit/get-user-credit.use-case.js';
import { GetUserChequesUseCase, CreateChequeUseCase } from './application/use-cases/credit/cheques.use-case.js';
import { GetUserLoyaltyUseCase } from './application/use-cases/user/get-user-loyalty.use-case.js';
import { GetUserSessionsUseCase } from './application/use-cases/user/get-user-sessions.use-case.js';
import { RevokeUserSessionUseCase } from './application/use-cases/user/revoke-user-session.use-case.js';
import { GetUserProfileUseCase } from './application/use-cases/user/get-user-profile.use-case.js';
import { UpdateUserProfileUseCase } from './application/use-cases/user/update-user-profile.use-case.js';
import { UploadUserAvatarUseCase } from './application/use-cases/user/upload-user-avatar.use-case.js';
import { DeleteUserAvatarUseCase } from './application/use-cases/user/delete-user-avatar.use-case.js';
import { SharpImageProcessingService } from './infrastructure/services/sharp-image-processing.service.js';
import { InMemoryUserRepository } from './infrastructure/database/in-memory/in-memory-user.repository.js';
import { PrismaUserRepository } from './infrastructure/database/prisma/repositories/prisma-user.repository.js';
import { PrismaService } from './infrastructure/database/prisma/prisma.service.js';
import { USER_REPOSITORY_TOKEN, IMAGE_PROCESSING_SERVICE_TOKEN } from './shared/constants/tokens.js';
import type { IUserRepository } from './domain/repositories/user.repository.interface.js';
import { JwtSessionService } from './infrastructure/auth/jwt-session.service.js';
import { AuthGuard } from './presentation/guards/auth.guard.js';
import { OptionalAuthGuard } from './presentation/guards/optional-auth.guard.js';

@Module({
  controllers: [
    UserController,
    FavoritesController,
    RfqController,
    WarrantyController,
    CreditController,
  ],
  providers: [
    PrismaService,
    JwtSessionService,
    AuthGuard,
    OptionalAuthGuard,
    {
      provide: IMAGE_PROCESSING_SERVICE_TOKEN,
      useClass: SharpImageProcessingService,
    },
    GetUserProfileUseCase,
    UpdateUserProfileUseCase,
    UploadUserAvatarUseCase,
    DeleteUserAvatarUseCase,
    // 1. Concrete implementation bound to the domain repository interface token
    {
      provide: USER_REPOSITORY_TOKEN,
      useFactory: (prisma: PrismaService) => {
        if (process.env.USE_PRISMA_REPO === 'true' || (process.env.DATABASE_URL && process.env.NODE_ENV !== 'test')) {
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
    {
      provide: GetUserAddressesUseCase,
      useFactory: (userRepo: IUserRepository) => new GetUserAddressesUseCase(userRepo),
      inject: [USER_REPOSITORY_TOKEN],
    },
    {
      provide: GetUserCartUseCase,
      useFactory: (userRepo: IUserRepository) => new GetUserCartUseCase(userRepo),
      inject: [USER_REPOSITORY_TOKEN],
    },
    {
      provide: GetUserOrdersUseCase,
      useFactory: (userRepo: IUserRepository) => new GetUserOrdersUseCase(userRepo),
      inject: [USER_REPOSITORY_TOKEN],
    },
    {
      provide: GetUserInvoicesUseCase,
      useFactory: (userRepo: IUserRepository) => new GetUserInvoicesUseCase(userRepo),
      inject: [USER_REPOSITORY_TOKEN],
    },
    {
      provide: GetUserWalletUseCase,
      useFactory: (userRepo: IUserRepository) => new GetUserWalletUseCase(userRepo),
      inject: [USER_REPOSITORY_TOKEN],
    },
    {
      provide: GetUserFavoritesUseCase,
      useFactory: (userRepo: IUserRepository) => new GetUserFavoritesUseCase(userRepo),
      inject: [USER_REPOSITORY_TOKEN],
    },
    {
      provide: AddUserFavoriteUseCase,
      useFactory: (userRepo: IUserRepository) => new AddUserFavoriteUseCase(userRepo),
      inject: [USER_REPOSITORY_TOKEN],
    },
    {
      provide: RemoveUserFavoriteUseCase,
      useFactory: (userRepo: IUserRepository) => new RemoveUserFavoriteUseCase(userRepo),
      inject: [USER_REPOSITORY_TOKEN],
    },
    {
      provide: ToggleUserFavoriteUseCase,
      useFactory: (userRepo: IUserRepository) => new ToggleUserFavoriteUseCase(userRepo),
      inject: [USER_REPOSITORY_TOKEN],
    },
    {
      provide: CheckUserFavoriteUseCase,
      useFactory: (userRepo: IUserRepository) => new CheckUserFavoriteUseCase(userRepo),
      inject: [USER_REPOSITORY_TOKEN],
    },
    {
      provide: GetUserRfqUseCase,
      useFactory: (userRepo: IUserRepository) => new GetUserRfqUseCase(userRepo),
      inject: [USER_REPOSITORY_TOKEN],
    },
    {
      provide: GetUserAuthenticityUseCase,
      useFactory: (userRepo: IUserRepository) => new GetUserAuthenticityUseCase(userRepo),
      inject: [USER_REPOSITORY_TOKEN],
    },
    {
      provide: GetUserLoyaltyUseCase,
      useFactory: (userRepo: IUserRepository) => new GetUserLoyaltyUseCase(userRepo),
      inject: [USER_REPOSITORY_TOKEN],
    },
    {
      provide: GetUserSessionsUseCase,
      useFactory: (userRepo: IUserRepository) => new GetUserSessionsUseCase(userRepo),
      inject: [USER_REPOSITORY_TOKEN],
    },
    {
      provide: RevokeUserSessionUseCase,
      useFactory: (userRepo: IUserRepository) => new RevokeUserSessionUseCase(userRepo),
      inject: [USER_REPOSITORY_TOKEN],
    },
    {
      provide: CreateRfqUseCase,
      useFactory: (userRepo: IUserRepository) => new CreateRfqUseCase(userRepo),
      inject: [USER_REPOSITORY_TOKEN],
    },
    {
      provide: VerifySerialUseCase,
      useFactory: (userRepo: IUserRepository) => new VerifySerialUseCase(userRepo),
      inject: [USER_REPOSITORY_TOKEN],
    },
    {
      provide: CreateRmaUseCase,
      useFactory: (userRepo: IUserRepository) => new CreateRmaUseCase(userRepo),
      inject: [USER_REPOSITORY_TOKEN],
    },
    {
      provide: GetUserCreditUseCase,
      useFactory: (userRepo: IUserRepository) => new GetUserCreditUseCase(userRepo),
      inject: [USER_REPOSITORY_TOKEN],
    },
    {
      provide: GetUserChequesUseCase,
      useFactory: (userRepo: IUserRepository) => new GetUserChequesUseCase(userRepo),
      inject: [USER_REPOSITORY_TOKEN],
    },
    {
      provide: CreateChequeUseCase,
      useFactory: (userRepo: IUserRepository) => new CreateChequeUseCase(userRepo),
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
    GetUserAddressesUseCase,
    GetUserCartUseCase,
    GetUserOrdersUseCase,
    GetUserInvoicesUseCase,
    GetUserWalletUseCase,
    GetUserFavoritesUseCase,
    AddUserFavoriteUseCase,
    RemoveUserFavoriteUseCase,
    ToggleUserFavoriteUseCase,
    CheckUserFavoriteUseCase,
    GetUserRfqUseCase,
    CreateRfqUseCase,
    GetUserAuthenticityUseCase,
    VerifySerialUseCase,
    CreateRmaUseCase,
    GetUserCreditUseCase,
    GetUserChequesUseCase,
    CreateChequeUseCase,
    GetUserLoyaltyUseCase,
    GetUserSessionsUseCase,
    RevokeUserSessionUseCase,
  ],
})
export class UsersModule {}
