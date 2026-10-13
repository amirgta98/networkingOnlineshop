import { IAuthTwoFactorChallengeRepository } from '../../../domain/repositories/auth-two-factor-challenge.repository.interface.js';
import { AuthTwoFactorChallenge } from '../../../domain/entities/auth-two-factor-challenge.entity.js';

export class InMemoryAuthTwoFactorChallengeRepository
  implements IAuthTwoFactorChallengeRepository
{
  private readonly challenges = new Map<string, AuthTwoFactorChallenge>();

  public async create(challenge: AuthTwoFactorChallenge): Promise<void> {
    this.challenges.set(challenge.id, challenge);
  }

  public async findById(id: string): Promise<AuthTwoFactorChallenge | null> {
    return this.challenges.get(id) ?? null;
  }

  public async update(challenge: AuthTwoFactorChallenge): Promise<void> {
    this.challenges.set(challenge.id, challenge);
  }

  public clear(): void {
    this.challenges.clear();
  }
}
