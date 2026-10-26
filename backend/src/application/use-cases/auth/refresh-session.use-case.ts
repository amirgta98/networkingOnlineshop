import { IUserSessionRepository } from '../../../domain/repositories/user-session.repository.interface.js';
import { IUserRepository } from '../../../domain/repositories/user.repository.interface.js';
import { JwtSessionService } from '../../../infrastructure/auth/jwt-session.service.js';
import {
  SessionRevokedException,
  UserSuspendedException,
} from '../../../domain/exceptions/auth.exceptions.js';
import { AuthSessionOutputDto } from '../../dto/auth/auth.dto.js';
import { randomUUID } from 'node:crypto';
import { UserSession } from '../../../domain/entities/user-session.entity.js';

export class RefreshSessionUseCase {
  constructor(
    private readonly sessionRepo: IUserSessionRepository,
    private readonly userRepo: IUserRepository,
    private readonly jwtSessionService: JwtSessionService,
  ) {}

  async execute(
    refreshToken: string,
    ipAddress?: string | null,
    userAgent?: string | null,
  ): Promise<AuthSessionOutputDto> {
    const hash = this.jwtSessionService.hashToken(refreshToken);
    const existingSession = await this.sessionRepo.findByRefreshTokenHash(hash);

    if (!existingSession || !existingSession.isValid()) {
      throw new SessionRevokedException();
    }

    // Revoke old session (token rotation)
    await this.sessionRepo.revokeById(existingSession.id);

    const user = await this.userRepo.findById(existingSession.userId);
    if (!user || !user.isActive || user.status === 'SUSPENDED') {
      throw new UserSuspendedException();
    }

    // Issue new tokens
    const effectiveRole = user.role === 'partner_b2b' ? 'partner' : user.role;
    const tokens = this.jwtSessionService.generateTokens(
      user.id,
      effectiveRole,
      user.phone?.value ?? '',
    );

    const newSession = UserSession.create({
      id: randomUUID(),
      userId: user.id,
      refreshTokenHash: tokens.refreshTokenHash,
      ipAddress: ipAddress ?? existingSession.ipAddress,
      browser: userAgent ?? existingSession.browser,
    });

    await this.sessionRepo.create(newSession);

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresAt: tokens.expiresAt,
      user: {
        id: user.id,
        phone: user.phone?.value ?? '',
        name: user.name,
        role: effectiveRole,
        twoFactorEnabled: user.isTwoFactorEnabled,
        twoFactorMethod: user.isTwoFactorEnabled ? user.twoFactorMethod.toLowerCase() : undefined,
        email: user.email.value,
        createdAt: user.createdAt.toISOString(),
      },
    };
  }
}
