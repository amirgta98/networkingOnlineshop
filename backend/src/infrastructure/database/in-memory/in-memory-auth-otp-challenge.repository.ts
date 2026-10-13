import { IAuthOtpChallengeRepository } from '../../../domain/repositories/auth-otp-challenge.repository.interface.js';
import { AuthOtpChallenge } from '../../../domain/entities/auth-otp-challenge.entity.js';

export class InMemoryAuthOtpChallengeRepository implements IAuthOtpChallengeRepository {
  private readonly challenges = new Map<string, AuthOtpChallenge>();

  public async create(challenge: AuthOtpChallenge): Promise<void> {
    this.challenges.set(challenge.id, challenge);
  }

  public async findById(id: string): Promise<AuthOtpChallenge | null> {
    const item = this.challenges.get(id);
    return item ?? null;
  }

  public async findLatestActiveByPhone(phone: string): Promise<AuthOtpChallenge | null> {
    const now = new Date();
    let latest: AuthOtpChallenge | null = null;

    for (const challenge of this.challenges.values()) {
      if (
        challenge.phone.value === phone &&
        !challenge.isConsumed() &&
        !challenge.isExpired(now)
      ) {
        if (!latest || challenge.createdAt > latest.createdAt) {
          latest = challenge;
        }
      }
    }

    return latest;
  }

  public async update(challenge: AuthOtpChallenge): Promise<void> {
    this.challenges.set(challenge.id, challenge);
  }

  public async countRecentRequests(phone: string, windowSeconds: number): Promise<number> {
    const threshold = new Date(Date.now() - windowSeconds * 1000);
    let count = 0;
    for (const challenge of this.challenges.values()) {
      if (challenge.phone.value === phone && challenge.createdAt >= threshold) {
        count++;
      }
    }
    return count;
  }

  public async countRecentRequestsByIp(ipAddress: string, windowSeconds: number): Promise<number> {
    const threshold = new Date(Date.now() - windowSeconds * 1000);
    let count = 0;
    for (const challenge of this.challenges.values()) {
      if (challenge.ipAddress === ipAddress && challenge.createdAt >= threshold) {
        count++;
      }
    }
    return count;
  }

  public clear(): void {
    this.challenges.clear();
  }
}
