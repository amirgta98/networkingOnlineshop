import { Module } from '@nestjs/common';
import { AffiliateController } from './presentation/controllers/affiliate.controller.js';
import { PrismaService } from './infrastructure/database/prisma/prisma.service.js';
import { PrismaAffiliateRepository } from './infrastructure/database/prisma/repositories/prisma-affiliate.repository.js';
import { InMemoryAffiliateRepository } from './infrastructure/database/in-memory/in-memory-affiliate.repository.js';
import {
  AFFILIATE_REPOSITORY_TOKEN,
  USER_REPOSITORY_TOKEN,
} from './shared/constants/tokens.js';
import type { IAffiliateRepository } from './domain/repositories/affiliate.repository.interface.js';
import type { IUserRepository } from './domain/repositories/user.repository.interface.js';
import {
  GetAffiliateSettingsUseCase,
  UpdateAffiliateSettingsUseCase,
} from './application/use-cases/affiliate/affiliate-settings.use-case.js';
import {
  GetAffiliatePartnersUseCase,
  GetAffiliatePartnerByIdUseCase,
  GetAffiliatePartnerByUserIdUseCase,
  UpdateAffiliatePartnerUseCase,
  ResetPartnerDefaultsUseCase,
  RegisterAffiliatePartnerUseCase,
} from './application/use-cases/affiliate/affiliate-partners.use-case.js';
import {
  GetAffiliateCommissionsUseCase,
  UpdateCommissionStatusUseCase,
  CreateAffiliatePayoutUseCase,
  GetAffiliatePayoutsUseCase,
} from './application/use-cases/affiliate/affiliate-commissions.use-case.js';
import { AffiliateCalculationService } from './application/use-cases/affiliate/affiliate-calculation.use-case.js';
import { AuthModule } from './auth.module.js';
import { UsersModule } from './users.module.js';

@Module({
  imports: [AuthModule, UsersModule],
  controllers: [AffiliateController],
  providers: [
    PrismaService,
    {
      provide: AFFILIATE_REPOSITORY_TOKEN,
      useFactory: (prisma: PrismaService) => {
        if (
          process.env.USE_PRISMA_REPO === 'true' ||
          (process.env.DATABASE_URL && process.env.NODE_ENV !== 'test')
        ) {
          return new PrismaAffiliateRepository(prisma);
        }
        return new InMemoryAffiliateRepository();
      },
      inject: [PrismaService],
    },
    {
      provide: GetAffiliateSettingsUseCase,
      useFactory: (repo: IAffiliateRepository) => new GetAffiliateSettingsUseCase(repo),
      inject: [AFFILIATE_REPOSITORY_TOKEN],
    },
    {
      provide: UpdateAffiliateSettingsUseCase,
      useFactory: (repo: IAffiliateRepository) => new UpdateAffiliateSettingsUseCase(repo),
      inject: [AFFILIATE_REPOSITORY_TOKEN],
    },
    {
      provide: GetAffiliatePartnersUseCase,
      useFactory: (repo: IAffiliateRepository) => new GetAffiliatePartnersUseCase(repo),
      inject: [AFFILIATE_REPOSITORY_TOKEN],
    },
    {
      provide: GetAffiliatePartnerByIdUseCase,
      useFactory: (repo: IAffiliateRepository) => new GetAffiliatePartnerByIdUseCase(repo),
      inject: [AFFILIATE_REPOSITORY_TOKEN],
    },
    {
      provide: GetAffiliatePartnerByUserIdUseCase,
      useFactory: (repo: IAffiliateRepository) => new GetAffiliatePartnerByUserIdUseCase(repo),
      inject: [AFFILIATE_REPOSITORY_TOKEN],
    },
    {
      provide: UpdateAffiliatePartnerUseCase,
      useFactory: (repo: IAffiliateRepository) => new UpdateAffiliatePartnerUseCase(repo),
      inject: [AFFILIATE_REPOSITORY_TOKEN],
    },
    {
      provide: ResetPartnerDefaultsUseCase,
      useFactory: (repo: IAffiliateRepository) => new ResetPartnerDefaultsUseCase(repo),
      inject: [AFFILIATE_REPOSITORY_TOKEN],
    },
    {
      provide: RegisterAffiliatePartnerUseCase,
      useFactory: (repo: IAffiliateRepository, userRepo?: IUserRepository) =>
        new RegisterAffiliatePartnerUseCase(repo, userRepo),
      inject: [AFFILIATE_REPOSITORY_TOKEN, USER_REPOSITORY_TOKEN],
    },
    {
      provide: GetAffiliateCommissionsUseCase,
      useFactory: (repo: IAffiliateRepository) => new GetAffiliateCommissionsUseCase(repo),
      inject: [AFFILIATE_REPOSITORY_TOKEN],
    },
    {
      provide: UpdateCommissionStatusUseCase,
      useFactory: (repo: IAffiliateRepository) => new UpdateCommissionStatusUseCase(repo),
      inject: [AFFILIATE_REPOSITORY_TOKEN],
    },
    {
      provide: CreateAffiliatePayoutUseCase,
      useFactory: (repo: IAffiliateRepository) => new CreateAffiliatePayoutUseCase(repo),
      inject: [AFFILIATE_REPOSITORY_TOKEN],
    },
    {
      provide: GetAffiliatePayoutsUseCase,
      useFactory: (repo: IAffiliateRepository) => new GetAffiliatePayoutsUseCase(repo),
      inject: [AFFILIATE_REPOSITORY_TOKEN],
    },
    {
      provide: AffiliateCalculationService,
      useFactory: (repo: IAffiliateRepository) => new AffiliateCalculationService(repo),
      inject: [AFFILIATE_REPOSITORY_TOKEN],
    },
  ],
  exports: [
    AFFILIATE_REPOSITORY_TOKEN,
    AffiliateCalculationService,
    GetAffiliateSettingsUseCase,
    GetAffiliatePartnerByIdUseCase,
    GetAffiliatePartnerByUserIdUseCase,
  ],
})
export class AffiliateModule {}
