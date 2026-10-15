import { Module } from '@nestjs/common';
import { AuthController } from './presentation/controllers/auth.controller.js';
import { UsersModule } from './users.module.js';
import { JwtSessionService } from './infrastructure/auth/jwt-session.service.js';
import { RateLimiterService } from './infrastructure/auth/rate-limiter.service.js';
import { AuthGuard } from './presentation/guards/auth.guard.js';
import { InMemoryAuthOtpChallengeRepository } from './infrastructure/database/in-memory/in-memory-auth-otp-challenge.repository.js';
import { InMemoryAuthTwoFactorChallengeRepository } from './infrastructure/database/in-memory/in-memory-auth-two-factor-challenge.repository.js';
import { InMemoryUserSessionRepository } from './infrastructure/database/in-memory/in-memory-user-session.repository.js';
import { CompositeSmsProvider } from './infrastructure/sms/composite-sms.provider.js';
import { TelegramOtpService } from './infrastructure/sms/telegram-otp.service.js';
import { getSmsDeliveryMode } from './infrastructure/sms/sms-delivery-mode.js';
import { RequestOtpUseCase } from './application/use-cases/auth/request-otp.use-case.js';
import { VerifyOtpUseCase } from './application/use-cases/auth/verify-otp.use-case.js';
import { VerifyTwoFactorUseCase } from './application/use-cases/auth/verify-two-factor.use-case.js';
import { GetAuthenticatedUserUseCase } from './application/use-cases/auth/get-authenticated-user.use-case.js';
import { LogoutUseCase } from './application/use-cases/auth/logout.use-case.js';
import { RefreshSessionUseCase } from './application/use-cases/auth/refresh-session.use-case.js';
import {
  AUTH_OTP_CHALLENGE_REPOSITORY_TOKEN,
  AUTH_TWO_FACTOR_CHALLENGE_REPOSITORY_TOKEN,
  USER_SESSION_REPOSITORY_TOKEN,
  USER_REPOSITORY_TOKEN,
  SMS_PROVIDER_TOKEN,
} from './shared/constants/tokens.js';
import type { IAuthOtpChallengeRepository } from './domain/repositories/auth-otp-challenge.repository.interface.js';
import type { IAuthTwoFactorChallengeRepository } from './domain/repositories/auth-two-factor-challenge.repository.interface.js';
import type { IUserSessionRepository } from './domain/repositories/user-session.repository.interface.js';
import type { IUserRepository } from './domain/repositories/user.repository.interface.js';
import type { ISmsProvider } from './infrastructure/sms/sms-provider.interface.js';

@Module({
  imports: [UsersModule],
  controllers: [AuthController],
  providers: [
    JwtSessionService,
    RateLimiterService,
    AuthGuard,
    {
      provide: AUTH_OTP_CHALLENGE_REPOSITORY_TOKEN,
      useClass: InMemoryAuthOtpChallengeRepository,
    },
    {
      provide: AUTH_TWO_FACTOR_CHALLENGE_REPOSITORY_TOKEN,
      useClass: InMemoryAuthTwoFactorChallengeRepository,
    },
    {
      provide: USER_SESSION_REPOSITORY_TOKEN,
      useClass: InMemoryUserSessionRepository,
    },
    TelegramOtpService,
    {
      provide: SMS_PROVIDER_TOKEN,
      useFactory: (telegramService: TelegramOtpService) => new CompositeSmsProvider(telegramService),
      inject: [TelegramOtpService],
    },
    {
      provide: RequestOtpUseCase,
      useFactory: (
        otpRepo: IAuthOtpChallengeRepository,
        userRepo: IUserRepository,
        smsProvider: ISmsProvider,
        rateLimiter: RateLimiterService,
        jwtService: JwtSessionService,
      ) => {
        const pepper = jwtService.getSecret();
        // `isDev` is derived from the SMS router, not from NODE_ENV: master test
        // codes and `devCode` in API responses are only available when the OTP
        // delivery mode is explicitly the local/dev channel.
        const isDev = getSmsDeliveryMode(smsProvider) !== 'real';
        return new RequestOtpUseCase(otpRepo, userRepo, smsProvider, rateLimiter, pepper, isDev);
      },
      inject: [
        AUTH_OTP_CHALLENGE_REPOSITORY_TOKEN,
        USER_REPOSITORY_TOKEN,
        SMS_PROVIDER_TOKEN,
        RateLimiterService,
        JwtSessionService,
      ],
    },
    {
      provide: VerifyOtpUseCase,
      useFactory: (
        otpRepo: IAuthOtpChallengeRepository,
        twoFactorRepo: IAuthTwoFactorChallengeRepository,
        userRepo: IUserRepository,
        sessionRepo: IUserSessionRepository,
        jwtService: JwtSessionService,
        smsProvider: ISmsProvider,
      ) => {
        const pepper = jwtService.getSecret();
        const isDev = getSmsDeliveryMode(smsProvider) !== 'real';
        return new VerifyOtpUseCase(
          otpRepo,
          twoFactorRepo,
          userRepo,
          sessionRepo,
          jwtService,
          pepper,
          isDev,
        );
      },
      inject: [
        AUTH_OTP_CHALLENGE_REPOSITORY_TOKEN,
        AUTH_TWO_FACTOR_CHALLENGE_REPOSITORY_TOKEN,
        USER_REPOSITORY_TOKEN,
        USER_SESSION_REPOSITORY_TOKEN,
        JwtSessionService,
        SMS_PROVIDER_TOKEN,
      ],
    },
    {
      provide: VerifyTwoFactorUseCase,
      useFactory: (
        twoFactorRepo: IAuthTwoFactorChallengeRepository,
        userRepo: IUserRepository,
        sessionRepo: IUserSessionRepository,
        jwtService: JwtSessionService,
        smsProvider: ISmsProvider,
      ) => {
        const isDev = getSmsDeliveryMode(smsProvider) !== 'real';
        return new VerifyTwoFactorUseCase(
          twoFactorRepo,
          userRepo,
          sessionRepo,
          jwtService,
          isDev,
        );
      },
      inject: [
        AUTH_TWO_FACTOR_CHALLENGE_REPOSITORY_TOKEN,
        USER_REPOSITORY_TOKEN,
        USER_SESSION_REPOSITORY_TOKEN,
        JwtSessionService,
        SMS_PROVIDER_TOKEN,
      ],
    },
    {
      provide: GetAuthenticatedUserUseCase,
      useFactory: (userRepo: IUserRepository) => new GetAuthenticatedUserUseCase(userRepo),
      inject: [USER_REPOSITORY_TOKEN],
    },
    {
      provide: LogoutUseCase,
      useFactory: (sessionRepo: IUserSessionRepository, jwtService: JwtSessionService) =>
        new LogoutUseCase(sessionRepo, jwtService),
      inject: [USER_SESSION_REPOSITORY_TOKEN, JwtSessionService],
    },
    {
      provide: RefreshSessionUseCase,
      useFactory: (
        sessionRepo: IUserSessionRepository,
        userRepo: IUserRepository,
        jwtService: JwtSessionService,
      ) => new RefreshSessionUseCase(sessionRepo, userRepo, jwtService),
      inject: [USER_SESSION_REPOSITORY_TOKEN, USER_REPOSITORY_TOKEN, JwtSessionService],
    },
  ],
  exports: [
    AuthGuard,
    JwtSessionService,
    RequestOtpUseCase,
    VerifyOtpUseCase,
    VerifyTwoFactorUseCase,
    GetAuthenticatedUserUseCase,
    LogoutUseCase,
    RefreshSessionUseCase,
    AUTH_OTP_CHALLENGE_REPOSITORY_TOKEN,
    AUTH_TWO_FACTOR_CHALLENGE_REPOSITORY_TOKEN,
    USER_SESSION_REPOSITORY_TOKEN,
    SMS_PROVIDER_TOKEN,
  ],
})
export class AuthModule {}
