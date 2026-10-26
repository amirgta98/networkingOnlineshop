import type { IUserRepository } from '../../../domain/repositories/user.repository.interface.js';

export interface UserCreditOverview {
  creditLimit: number;
  creditBalance: number;
  creditUsed: number;
  creditPercent: number;
}

export class GetUserCreditUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(userId: string): Promise<UserCreditOverview> {
    const user = await this.userRepository.findById(userId);
    const limit = (user as any)?.creditLimit ?? 200_000_000;
    const balance = (user as any)?.creditBalance ?? 135_000_000;
    const used = Math.max(0, limit - balance);
    const percent = limit > 0 ? Math.round((used / limit) * 100) : 0;

    return {
      creditLimit: limit,
      creditBalance: balance,
      creditUsed: used,
      creditPercent: percent,
    };
  }
}
