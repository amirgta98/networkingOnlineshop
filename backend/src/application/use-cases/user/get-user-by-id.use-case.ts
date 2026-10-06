import { IUserRepository } from '../../../domain/repositories/user.repository.interface.js';
import { UserNotFoundException } from '../../../domain/exceptions/user-not-found.exception.js';
import { UserOutputDto, UserOutputMapper } from '../../dto/user/user-output.dto.js';

/**
 * Use Case responsible for retrieving a user by identifier.
 */
export class GetUserByIdUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  public async execute(id: string): Promise<UserOutputDto> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new UserNotFoundException(id);
    }

    return UserOutputMapper.toDto(user);
  }
}
