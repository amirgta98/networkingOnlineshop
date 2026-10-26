import type {
  IAffiliateRepository,
  CommissionQueryParams,
  PayoutQueryParams,
} from '../../../domain/repositories/affiliate.repository.interface.js';
import type {
  AffiliateCommissionEntity,
  AffiliatePayoutEntity,
  AffiliateCommissionStatus,
} from '../../../domain/entities/affiliate.entity.js';
import type { CreatePayoutDto } from '../../dto/affiliate/affiliate.dto.js';

export class GetAffiliateCommissionsUseCase {
  constructor(private readonly repository: IAffiliateRepository) {}

  async execute(params: CommissionQueryParams): Promise<{ items: AffiliateCommissionEntity[]; total: number }> {
    return await this.repository.findCommissions(params);
  }
}

export class UpdateCommissionStatusUseCase {
  constructor(private readonly repository: IAffiliateRepository) {}

  async execute(id: string, status: AffiliateCommissionStatus, notes?: string): Promise<AffiliateCommissionEntity> {
    return await this.repository.updateCommissionStatus(id, status, notes);
  }
}

export class CreateAffiliatePayoutUseCase {
  constructor(private readonly repository: IAffiliateRepository) {}

  async execute(dto: CreatePayoutDto): Promise<AffiliatePayoutEntity> {
    const partner = await this.repository.findPartnerById(dto.partnerId);
    if (!partner) {
      throw new Error(`همکار با شناسه ${dto.partnerId} یافت نشد.`);
    }

    const trackingCode = dto.trackingCode || `PAY-${Date.now()}`;
    return await this.repository.createPayout({
      partnerId: dto.partnerId,
      amount: dto.amount,
      trackingCode,
      paymentMethod: dto.paymentMethod || 'SATNA_PAYA',
      description: dto.description || 'تسویه پورسانت همکار',
      status: 'COMPLETED',
      paidAt: new Date(),
      partnerName: partner.user?.name,
    });
  }
}

export class GetAffiliatePayoutsUseCase {
  constructor(private readonly repository: IAffiliateRepository) {}

  async execute(params: PayoutQueryParams): Promise<{ items: AffiliatePayoutEntity[]; total: number }> {
    return await this.repository.findPayouts(params);
  }
}
