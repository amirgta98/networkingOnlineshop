import type { IUserRepository } from '../../../domain/repositories/user.repository.interface.js';
import { UserNotFoundException } from '../../../domain/exceptions/user-not-found.exception.js';

export class ClearUserCartUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(userId: string): Promise<void> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UserNotFoundException(userId);
    }
    return this.userRepository.clearUserCart(userId);
  }
}
