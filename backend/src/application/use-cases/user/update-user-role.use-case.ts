import { IUserRepository } from '../../../domain/repositories/user.repository.interface.js';
import { User } from '../../../domain/entities/user.entity.js';
import { UserNotFoundException } from '../../../domain/exceptions/user-not-found.exception.js';

export interface UpdateUserRoleCommand {
  userId: string;
  role: string;
}

export class UpdateUserRoleUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  public async execute(command: UpdateUserRoleCommand): Promise<User> {
    const user = await this.userRepository.findById(command.userId);
    if (!user) {
      throw new UserNotFoundException(command.userId);
    }

    const allowedRoles = ['admin', 'sales_manager', 'partner_b2b', 'customer', 'partner', 'super_admin', 'staff_manager'];
    const normalizedRole = command.role ? command.role.toLowerCase().trim() : '';
    if (!allowedRoles.includes(normalizedRole)) {
      throw new Error(`Invalid role '${command.role}'. Allowed roles: admin, sales_manager, partner_b2b, customer.`);
    }

    const domainRole = normalizedRole === 'partner_b2b' ? 'partner' : normalizedRole;
    user.setRole(domainRole);
    user.addActivity({
      id: `act-${Date.now()}`,
      action: `تغییر سطح دسترسی کاربر به «${command.role}»`,
      timestamp: 'هم‌اکنون',
      ip: '127.0.0.1',
    });

    await this.userRepository.save(user);
    return user;
  }
}
