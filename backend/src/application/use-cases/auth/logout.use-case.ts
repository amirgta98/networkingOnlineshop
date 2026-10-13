import { IUserSessionRepository } from '../../../domain/repositories/user-session.repository.interface.js';
import { JwtSessionService } from '../../../infrastructure/auth/jwt-session.service.js';

export class LogoutUseCase {
  constructor(
    private readonly sessionRepo: IUserSessionRepository,
    private readonly jwtSessionService: JwtSessionService,
  ) {}

  async execute(refreshToken?: string, userId?: string): Promise<void> {
    if (refreshToken) {
      const hash = this.jwtSessionService.hashToken(refreshToken);
      const session = await this.sessionRepo.findByRefreshTokenHash(hash);
      if (session) {
        await this.sessionRepo.revokeById(session.id);
        return;
      }
    }

    if (userId) {
      await this.sessionRepo.revokeAllForUser(userId);
    }
  }
}
