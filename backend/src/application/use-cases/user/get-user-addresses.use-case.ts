import type { IUserRepository } from '../../../domain/repositories/user.repository.interface.js';
import type { UserAddressEntity } from '../../../domain/entities/user-address.entity.js';
import { UserNotFoundException } from '../../../domain/exceptions/user-not-found.exception.js';

export class GetUserAddressesUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(userId: string): Promise<UserAddressEntity[]> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UserNotFoundException(userId);
    }
    return this.userRepository.getUserAddresses(userId);
  }
}
