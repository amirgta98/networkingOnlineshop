import { IUserRepository } from '../../../domain/repositories/user.repository.interface.js';
import { User } from '../../../domain/entities/user.entity.js';
import { UserNotFoundException } from '../../../domain/exceptions/user-not-found.exception.js';
import { UserAlreadyExistsException } from '../../../domain/exceptions/user-already-exists.exception.js';
import { Email } from '../../../domain/value-objects/email.vo.js';
import { PhoneNumber } from '../../../domain/value-objects/phone-number.vo.js';

export interface UpdateUserCommand {
  userId: string;
  name?: string;
  email?: string;
  phone?: string;
  role?: string;
  status?: string;
  nationalCode?: string;
  nationalCodeVerified?: boolean;
  companyName?: string;
  userTier?: 'gold' | 'silver' | 'bronze';
  notes?: string;
  canBuyInternet?: boolean;
  walletBalance?: number;
  totalSpent?: number;
  ordersCount?: number;
}

export class UpdateUserUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  public async execute(command: UpdateUserCommand): Promise<User> {
    const user = await this.userRepository.findById(command.userId);
    if (!user) {
      throw new UserNotFoundException(command.userId);
    }

    if (command.email && command.email.trim().toLowerCase() !== user.email.value) {
      const existingEmail = await this.userRepository.findByEmail(command.email);
      if (existingEmail && existingEmail.id !== user.id) {
        throw new UserAlreadyExistsException(command.email);
      }
    }

    if (command.phone) {
      const normalizedPhone = PhoneNumber.normalize(command.phone);
      if (user.phone?.value !== normalizedPhone) {
        const existingPhone = await this.userRepository.findByPhone(command.phone);
        if (existingPhone && existingPhone.id !== user.id) {
          throw new UserAlreadyExistsException(command.phone);
        }
      }
    }

    const resolvedName = command.name || (command as any).fullName;

    user.updateDetails({
      name: resolvedName,
      email: command.email ? Email.create(command.email) : undefined,
      phone: command.phone ? PhoneNumber.create(command.phone) : undefined,
      role: command.role,
      status: command.status,
      nationalCode: command.nationalCode,
      nationalCodeVerified: command.nationalCodeVerified,
      companyName: command.companyName,
      userTier: command.userTier,
      notes: command.notes,
      canBuyInternet: command.canBuyInternet,
      walletBalance: command.walletBalance,
      totalSpent: command.totalSpent,
      ordersCount: command.ordersCount,
    });

    user.addActivity({
      id: `act-${Date.now()}`,
      action: 'بروزرسانی مشخصات و پروفایل کاربر توسط مدیر',
      timestamp: 'هم‌اکنون',
      ip: '127.0.0.1',
    });

    await this.userRepository.save(user);
    return user;
  }
}
