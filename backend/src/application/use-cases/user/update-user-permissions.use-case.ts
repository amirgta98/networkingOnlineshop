import { IUserRepository } from '../../../domain/repositories/user.repository.interface.js';
import { User } from '../../../domain/entities/user.entity.js';
import { UserNotFoundException } from '../../../domain/exceptions/user-not-found.exception.js';

export interface UpdateUserPermissionsCommand {
  userId: string;
  permissions: string[];
}

export class UpdateUserPermissionsUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  public async execute(command: UpdateUserPermissionsCommand): Promise<User> {
    const user = await this.userRepository.findById(command.userId);
    if (!user) {
      throw new UserNotFoundException(command.userId);
    }

    // Set the permissions for the user
    user.setPermissions(command.permissions || []);
    user.addActivity({
      id: `act-${Date.now()}`,
      action: `بروزرسانی مجوزهای اختصاصی کاربر (${(command.permissions || []).length} بخش)`,
      timestamp: 'هم‌اکنون',
      ip: '127.0.0.1',
    });

    await this.userRepository.save(user);
    return user;
  }
}
