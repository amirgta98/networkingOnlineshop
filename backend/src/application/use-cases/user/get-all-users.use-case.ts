import { IUserRepository, UserFilterOptions } from '../../../domain/repositories/user.repository.interface.js';
import { User } from '../../../domain/entities/user.entity.js';

export class GetAllUsersUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  public async execute(filter?: UserFilterOptions): Promise<User[]> {
    return await this.userRepository.findAll(filter);
  }
}
