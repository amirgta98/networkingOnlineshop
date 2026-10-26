import { IAuthOtpChallengeRepository } from '../../../domain/repositories/auth-otp-challenge.repository.interface.js';
import { IAuthTwoFactorChallengeRepository } from '../../../domain/repositories/auth-two-factor-challenge.repository.interface.js';
import { IUserRepository } from '../../../domain/repositories/user.repository.interface.js';
import { IUserSessionRepository } from '../../../domain/repositories/user-session.repository.interface.js';
import { JwtSessionService } from '../../../infrastructure/auth/jwt-session.service.js';
import { AuthTwoFactorChallenge } from '../../../domain/entities/auth-two-factor-challenge.entity.js';
import { UserSession } from '../../../domain/entities/user-session.entity.js';
import { User } from '../../../domain/entities/user.entity.js';
import {
  OtpInvalidException,
  OtpExpiredException,
  OtpMaxAttemptsExceededException,
  UserSuspendedException,
} from '../../../domain/exceptions/auth.exceptions.js';
import { VerifyOtpCommand, VerifyOtpResult } from '../../dto/auth/auth.dto.js';
import { randomUUID } from 'node:crypto';

export class VerifyOtpUseCase {
  constructor(
    private readonly authOtpChallengeRepo: IAuthOtpChallengeRepository,
    private readonly authTwoFactorChallengeRepo: IAuthTwoFactorChallengeRepository,
    private readonly userRepo: IUserRepository,
    private readonly sessionRepo: IUserSessionRepository,
    private readonly jwtSessionService: JwtSessionService,
    private readonly pepperSecret: string,
    private readonly isDev: boolean = false,
  ) {}

  async execute(command: VerifyOtpCommand): Promise<VerifyOtpResult> {
    const cleanCode = command.code.trim();
    if (cleanCode.length !== 5) {
      throw new OtpInvalidException();
    }

    // 1. Fetch challenge
    const challenge = await this.authOtpChallengeRepo.findById(command.challengeTicket);
    if (!challenge || challenge.isConsumed()) {
      throw new OtpInvalidException();
    }

    if (challenge.isExpired()) {
      throw new OtpExpiredException();
    }

    if (challenge.hasExceededMaxAttempts()) {
      throw new OtpMaxAttemptsExceededException();
    }

    // 2. Atomic verification check
    // In dev mode, allow master test code 54321 for easy QA
    const isMasterDevCode = this.isDev && cleanCode === '54321';
    const isValidCode = isMasterDevCode || challenge.verify(cleanCode, this.pepperSecret);

    if (!isValidCode) {
      await this.authOtpChallengeRepo.update(challenge);
      throw new OtpInvalidException(challenge.getRemainingAttempts());
    }

    // 3. Mark challenge as consumed atomically
    challenge.consume();
    await this.authOtpChallengeRepo.update(challenge);

    // 4. Load or create user
    let user = await this.userRepo.findByPhone(challenge.phone.value);
    if (!user) {
      const newUserId = randomUUID();
      const isAdminPhone =
        challenge.phone.value === '09162947221' ||
        challenge.phone.value === '09162047221' ||
        challenge.phone.value === '09129999999' ||
        challenge.phone.value === '09134761097';
      const isPartnerPhone = challenge.phone.value === '09162947222' || challenge.phone.value === '09123333333';
      const role = isAdminPhone ? 'admin' : isPartnerPhone ? 'partner' : 'customer';
      user = User.createWithPhone({
        id: newUserId,
        phone: challenge.phone,
        role,
      });
      await this.userRepo.save(user);
    }

    // 5. Check user status
    if (!user.isActive || user.status === 'SUSPENDED') {
      throw new UserSuspendedException();
    }

    // 6. Check if user requires Two-Factor Authentication (2FA)
    if (user.isTwoFactorEnabled) {
      const twoFactorId = randomUUID();
      const twoFactorChallenge = AuthTwoFactorChallenge.create({
        id: twoFactorId,
        userId: user.id,
        phone: challenge.phone,
        ttlSeconds: parseInt(process.env.TWO_FACTOR_TTL_SECONDS ?? '300', 10),
      });

      await this.authTwoFactorChallengeRepo.create(twoFactorChallenge);

      return {
        success: true,
        message: 'کد تایید پیامکی تایید شد. لطفاً رمز دو مرحله‌ای را وارد کنید.',
        requiresTwoFactor: true,
        twoFactorTicket: twoFactorId,
        twoFactorType: user.twoFactorMethod.toLowerCase(),
      };
    }

    // 7. Directly establish authenticated session
    const effectiveRole = user.role === 'partner_b2b' ? 'partner' : user.role;
    const tokens = this.jwtSessionService.generateTokens(
      user.id,
      effectiveRole,
      user.phone?.value ?? challenge.phone.value,
    );

    const sessionId = randomUUID();
    const session = UserSession.create({
      id: sessionId,
      userId: user.id,
      refreshTokenHash: tokens.refreshTokenHash,
      ipAddress: command.ipAddress,
      browser: command.userAgent,
    });

    await this.sessionRepo.create(session);

    return {
      success: true,
      message: `خوش آمدید، ${user.name}`,
      requiresTwoFactor: false,
      session: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresAt: tokens.expiresAt,
        user: {
          id: user.id,
          phone: user.phone?.value ?? challenge.phone.value,
          name: user.name,
          role: effectiveRole,
          twoFactorEnabled: false,
          email: user.email.value,
          avatarUrl: user.avatarUrl ?? undefined,
          companyName: user.companyName ?? undefined,
          canBuyInternet: user.canBuyInternet,
          createdAt: user.createdAt.toISOString(),
        },
      },
    };
  }
}
