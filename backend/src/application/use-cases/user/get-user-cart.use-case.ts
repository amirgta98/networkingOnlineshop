import type { IUserRepository } from '../../../domain/repositories/user.repository.interface.js';
import type { UserCartDetails } from '../../../domain/entities/user-detail.types.js';
import { UserNotFoundException } from '../../../domain/exceptions/user-not-found.exception.js';

export class GetUserCartUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(userId: string): Promise<UserCartDetails | null> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UserNotFoundException(userId);
    }
    return this.userRepository.getUserCart(userId);
  }
}
