import { AuthTwoFactorChallenge } from '../entities/auth-two-factor-challenge.entity.js';

export interface IAuthTwoFactorChallengeRepository {
  create(challenge: AuthTwoFactorChallenge): Promise<void>;
  findById(id: string): Promise<AuthTwoFactorChallenge | null>;
  update(challenge: AuthTwoFactorChallenge): Promise<void>;
}
