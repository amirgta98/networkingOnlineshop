import { IUserSessionRepository } from '../../../domain/repositories/user-session.repository.interface.js';
import { UserSession } from '../../../domain/entities/user-session.entity.js';

export class InMemoryUserSessionRepository implements IUserSessionRepository {
  private readonly sessions = new Map<string, UserSession>();

  public async create(session: UserSession): Promise<void> {
    this.sessions.set(session.id, session);
  }

  public async findById(id: string): Promise<UserSession | null> {
    return this.sessions.get(id) ?? null;
  }

  public async findByRefreshTokenHash(hash: string): Promise<UserSession | null> {
    for (const session of this.sessions.values()) {
      if (session.refreshTokenHash === hash) {
        return session;
      }
    }
    return null;
  }

  public async update(session: UserSession): Promise<void> {
    this.sessions.set(session.id, session);
  }

  public async revokeById(id: string): Promise<void> {
    const session = this.sessions.get(id);
    if (session) {
      session.revoke();
    }
  }

  public async revokeAllForUser(userId: string): Promise<void> {
    for (const session of this.sessions.values()) {
      if (session.userId === userId) {
        session.revoke();
      }
    }
  }

  public clear(): void {
    this.sessions.clear();
  }
}
