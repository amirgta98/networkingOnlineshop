import type { IUserRepository } from '../../../domain/repositories/user.repository.interface.js';
import { UserNotFoundException } from '../../../domain/exceptions/user-not-found.exception.js';

export class GetUserInvoicesUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(userId: string): Promise<any[]> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UserNotFoundException(userId);
    }
    return this.userRepository.getUserInvoices(userId);
  }
}
