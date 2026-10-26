import type { IUserRepository } from '../../../domain/repositories/user.repository.interface.js';

export interface GetAdminWithdrawalsFilter {
  status?: string;
  search?: string;
  skip?: number;
  take?: number;
}

export class GetAdminWithdrawalsUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(filter: GetAdminWithdrawalsFilter) {
    return this.userRepository.getAdminWithdrawals(filter);
  }
}
