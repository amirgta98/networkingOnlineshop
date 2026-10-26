import type { IUserRepository } from '../../../domain/repositories/user.repository.interface.js';

export interface CreateChequeInput {
  userId: string;
  chequeId: string;
  bank?: string;
  branch?: string;
  dueDate?: string;
  amount: number;
  serialNumber?: string;
}

export class GetUserChequesUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(userId: string): Promise<any[]> {
    return this.userRepository.getUserCheques(userId);
  }
}

export class CreateChequeUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(input: CreateChequeInput): Promise<any> {
    return this.userRepository.addCheque(input.userId, {
      chequeId: input.chequeId,
      bank: input.bank || 'بانک ملت',
      branch: input.branch || 'شعبه مرکزی',
      dueDate: input.dueDate || '۱۴۰۳/۰۸/۳۰',
      amount: input.amount,
      serialNumber: input.serialNumber,
    });
  }
}
