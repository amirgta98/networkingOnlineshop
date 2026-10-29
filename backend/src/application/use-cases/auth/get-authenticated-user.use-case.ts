import { IUserRepository } from '../../../domain/repositories/user.repository.interface.js';
import {
  UserNotFoundException,
} from '../../../domain/exceptions/user-not-found.exception.js';
import { UserSuspendedException } from '../../../domain/exceptions/auth.exceptions.js';
import { AuthUserOutputDto } from '../../dto/auth/auth.dto.js';

export class GetAuthenticatedUserUseCase {
  constructor(private readonly userRepo: IUserRepository) {}

  async execute(userId: string, phone?: string): Promise<AuthUserOutputDto> {
    let user = await this.userRepo.findById(userId);
    if (!user && phone) {
      user = await this.userRepo.findByPhone(phone);
    }
    if (!user && (userId.startsWith('09') || /^\d{11}$/.test(userId))) {
      user = await this.userRepo.findByPhone(userId);
    }
    if (!user) {
      throw new UserNotFoundException(userId);
    }

    if (!user.isActive || user.status === 'SUSPENDED') {
      throw new UserSuspendedException();
    }

    return {
      id: user.id,
      phone: user.phone?.value ?? '',
      name: user.name,
      role: (user.role === 'partner_b2b' ? 'partner' : user.role),
      twoFactorEnabled: user.isTwoFactorEnabled,
      twoFactorMethod: user.isTwoFactorEnabled ? user.twoFactorMethod.toLowerCase() : undefined,
      email: user.email.value,
      avatarUrl: user.avatarUrl ?? undefined,
      companyName: user.companyName ?? undefined,
      canBuyInternet: user.canBuyInternet,
      createdAt: user.createdAt.toISOString(),
    };
  }
}
