import { IUserRepository } from '../../../domain/repositories/user.repository.interface.js';
import { UserNotFoundException } from '../../../domain/exceptions/user-not-found.exception.js';

export class DeleteUserUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  public async execute(userId: string): Promise<{ success: boolean }> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UserNotFoundException(userId);
    }

    await this.userRepository.delete(userId);
    return { success: true };
  }
}
