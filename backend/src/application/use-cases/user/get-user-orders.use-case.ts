import type { IUserRepository } from '../../../domain/repositories/user.repository.interface.js';
import type { UserOrderDetails } from '../../../domain/entities/user-detail.types.js';
import { UserNotFoundException } from '../../../domain/exceptions/user-not-found.exception.js';

export class GetUserOrdersUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(userId: string): Promise<UserOrderDetails[]> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UserNotFoundException(userId);
    }
    return this.userRepository.getUserOrders(userId);
  }
}
