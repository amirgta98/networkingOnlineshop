import type { IUserRepository } from '../../../domain/repositories/user.repository.interface.js';
import { UserNotFoundException } from '../../../domain/exceptions/user-not-found.exception.js';

export class RemoveUserFavoriteUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(userId: string, productId: string): Promise<boolean> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UserNotFoundException(userId);
    }
    return this.userRepository.removeFavorite(userId, productId);
  }
}
