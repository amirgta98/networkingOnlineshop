import type { IUserRepository } from '../../../domain/repositories/user.repository.interface.js';

export class CheckUserFavoriteUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(userId: string | null | undefined, productId: string): Promise<boolean> {
    if (!userId) return false;
    return this.userRepository.isFavorite(userId, productId);
  }
}
