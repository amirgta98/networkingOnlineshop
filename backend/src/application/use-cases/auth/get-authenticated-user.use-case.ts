import { IUserRepository } from '../../../domain/repositories/user.repository.interface.js';
import {
  UserNotFoundException,
} from '../../../domain/exceptions/user-not-found.exception.js';
import { UserSuspendedException } from '../../../domain/exceptions/auth.exceptions.js';
import { AuthUserOutputDto } from '../../dto/auth/auth.dto.js';

export class GetAuthenticatedUserUseCase {
  constructor(private readonly userRepo: IUserRepository) {}

  async execute(userId: string): Promise<AuthUserOutputDto> {
    const user = await this.userRepo.findById(userId);
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
      role: user.role,
      twoFactorEnabled: user.isTwoFactorEnabled,
      twoFactorMethod: user.isTwoFactorEnabled ? user.twoFactorMethod.toLowerCase() : undefined,
      email: user.email.value,
      avatarUrl: user.avatarUrl ?? undefined,
      companyName: user.companyName ?? undefined,
      createdAt: user.createdAt.toISOString(),
    };
  }
}
