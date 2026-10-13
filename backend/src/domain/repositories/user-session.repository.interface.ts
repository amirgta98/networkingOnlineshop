import { UserSession } from '../entities/user-session.entity.js';

export interface IUserSessionRepository {
  create(session: UserSession): Promise<void>;
  findById(id: string): Promise<UserSession | null>;
  findByRefreshTokenHash(hash: string): Promise<UserSession | null>;
  update(session: UserSession): Promise<void>;
  revokeById(id: string): Promise<void>;
  revokeAllForUser(userId: string): Promise<void>;
}
