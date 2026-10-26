import type { IUserRepository } from '../../../domain/repositories/user.repository.interface.js';
import type { UserWalletWithdrawal } from '../../../domain/entities/user-detail.types.js';

export interface UpdateWithdrawalStatusInput {
  withdrawalId: string;
  status: 'PROCESSING' | 'COMPLETED' | 'REJECTED' | 'CANCELLED';
  payoutReference?: string;
  rejectionReason?: string;
  adminUserId?: string;
}

export class UpdateWithdrawalStatusUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(input: UpdateWithdrawalStatusInput): Promise<UserWalletWithdrawal> {
    return this.userRepository.updateWithdrawalStatus(
      input.withdrawalId,
      input.status,
      input.payoutReference,
      input.rejectionReason,
      input.adminUserId,
    );
  }
}
