import type { IUserRepository } from '../../../domain/repositories/user.repository.interface.js';

export interface GetAdminDepositsFilter {
  search?: string;
  skip?: number;
  take?: number;
}

export class GetAdminDepositsUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(filter: GetAdminDepositsFilter) {
    return this.userRepository.getAdminDeposits(filter);
  }
}
