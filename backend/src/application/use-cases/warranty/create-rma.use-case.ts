import type { IUserRepository } from '../../../domain/repositories/user.repository.interface.js';
import type { UserAuthenticityDetails } from '../../../domain/entities/user-detail.types.js';

export interface CreateRmaInput {
  userId?: string;
  serialNumber: string;
  productName: string;
  faultDescription: string;
  deliveryMethod?: 'courier' | 'tipax' | 'in_person' | string;
  brand?: string;
}

export class CreateRmaUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(input: CreateRmaInput): Promise<UserAuthenticityDetails> {
    const rma = await this.userRepository.addAuthenticityInquiry({
      userId: input.userId,
      serialNumber: input.serialNumber.trim().toUpperCase(),
      productName: input.productName,
      brand: input.brand || 'Cisco',
      warrantyType: 'گارانتی تعویض درجا طلایی ققنوس',
      status: 'active',
      statusLabel: 'دریافت در لابراتوار گارانتی — در حال تست سلامت',
      isAuthentic: true,
      notes: `شرح نقص: ${input.faultDescription} | نحوه تحویل: ${input.deliveryMethod || 'پیک اختصاصی'}`,
      startDate: new Date(),
      endDate: new Date(Date.now() + 365 * 24 * 3600 * 1000 * 3),
      daysRemaining: 1095,
    });
    return rma;
  }
}
