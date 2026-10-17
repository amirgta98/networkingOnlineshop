import { IUserRepository } from '../../../domain/repositories/user.repository.interface.js';
import { User } from '../../../domain/entities/user.entity.js';
import { UserNotFoundException } from '../../../domain/exceptions/user-not-found.exception.js';

export interface UpdateUserStatusCommand {
  userId: string;
  status: string;
}

export class UpdateUserStatusUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  public async execute(command: UpdateUserStatusCommand): Promise<User> {
    const user = await this.userRepository.findById(command.userId);
    if (!user) {
      throw new UserNotFoundException(command.userId);
    }

    const allowedStatuses = ['active', 'suspended', 'pending_verification'];
    const normalizedStatus = command.status ? command.status.toLowerCase().trim() : '';
    if (!allowedStatuses.includes(normalizedStatus)) {
      throw new Error(`Invalid status '${command.status}'. Allowed statuses: active, suspended, pending_verification.`);
    }

    user.setStatus(normalizedStatus);
    user.addActivity({
      id: `act-${Date.now()}`,
      action: command.status.toLowerCase() === 'suspended' ? 'مسدودسازی موقت حساب کاربری' : 'فعال‌سازی مجدد حساب کاربری',
      timestamp: 'هم‌اکنون',
      ip: '127.0.0.1',
    });

    await this.userRepository.save(user);
    return user;
  }
}
