import type { IUserRepository } from '../../../domain/repositories/user.repository.interface.js';
import type { UserFavoriteDetails } from '../../../domain/entities/user-detail.types.js';
import { UserNotFoundException } from '../../../domain/exceptions/user-not-found.exception.js';

export class AddUserFavoriteUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(userId: string, productId: string): Promise<UserFavoriteDetails> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UserNotFoundException(userId);
    }
    return this.userRepository.addFavorite(userId, productId);
  }
}
