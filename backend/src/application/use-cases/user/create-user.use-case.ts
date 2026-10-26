import { randomUUID } from 'node:crypto';
import { IUserRepository } from '../../../domain/repositories/user.repository.interface.js';
import { User } from '../../../domain/entities/user.entity.js';
import { UserAlreadyExistsException } from '../../../domain/exceptions/user-already-exists.exception.js';
import { CreateUserCommand } from '../../dto/user/create-user.command.js';
import { UserOutputDto, UserOutputMapper } from '../../dto/user/user-output.dto.js';

/**
 * Use Case responsible for creating a new user.
 * Pure business orchestration - no framework decorators.
 */
export class CreateUserUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  public async execute(command: CreateUserCommand): Promise<UserOutputDto> {
    // 1. Business rule: Email and Phone must be unique
    const existingUser = await this.userRepository.findByEmail(command.email);
    if (existingUser) {
      throw new UserAlreadyExistsException(command.email);
    }

    if (command.phone) {
      const existingPhone = await this.userRepository.findByPhone(command.phone);
      if (existingPhone) {
        throw new UserAlreadyExistsException(command.phone);
      }
    }

    // 2. Instantiate Domain Entity
    const id = randomUUID();
    const user = User.create({
      id,
      email: command.email,
      name: command.name,
      phone: command.phone,
      role: command.role,
      status: command.status,
      nationalCode: command.nationalCode,
      companyName: command.companyName,
      notes: command.notes,
      canBuyInternet: command.canBuyInternet,
    });

    // 3. Persist via repository abstraction
    await this.userRepository.save(user);

    // 4. Return mapped presentation-agnostic DTO
    return UserOutputMapper.toDto(user);
  }
}
