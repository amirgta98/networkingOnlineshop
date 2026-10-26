import type { IAffiliateRepository, PartnerQueryParams } from '../../../domain/repositories/affiliate.repository.interface.js';
import type { IUserRepository } from '../../../domain/repositories/user.repository.interface.js';
import type { AffiliatePartnerEntity } from '../../../domain/entities/affiliate.entity.js';
import type { UpdatePartnerDto, RegisterPartnerDto } from '../../dto/affiliate/affiliate.dto.js';

export class GetAffiliatePartnersUseCase {
  constructor(private readonly repository: IAffiliateRepository) {}

  async execute(params: PartnerQueryParams): Promise<{ items: AffiliatePartnerEntity[]; total: number }> {
    return await this.repository.findPartners(params);
  }
}

export class GetAffiliatePartnerByIdUseCase {
  constructor(private readonly repository: IAffiliateRepository) {}

  async execute(id: string): Promise<AffiliatePartnerEntity | null> {
    return await this.repository.findPartnerById(id);
  }
}

export class GetAffiliatePartnerByUserIdUseCase {
  constructor(private readonly repository: IAffiliateRepository) {}

  async execute(userId: string): Promise<AffiliatePartnerEntity | null> {
    return await this.repository.findPartnerByUserId(userId);
  }
}

export class UpdateAffiliatePartnerUseCase {
  constructor(private readonly repository: IAffiliateRepository) {}

  async execute(id: string, dto: UpdatePartnerDto): Promise<AffiliatePartnerEntity> {
    return await this.repository.updatePartner(id, dto);
  }
}

export class ResetPartnerDefaultsUseCase {
  constructor(private readonly repository: IAffiliateRepository) {}

  async execute(id: string): Promise<AffiliatePartnerEntity> {
    return await this.repository.resetPartnerDefaults(id);
  }
}

export class RegisterAffiliatePartnerUseCase {
  constructor(
    private readonly repository: IAffiliateRepository,
    private readonly userRepository?: IUserRepository,
  ) {}

  async execute(dto: RegisterPartnerDto): Promise<AffiliatePartnerEntity> {
    const existing = await this.repository.findPartnerByUserId(dto.userId);
    if (existing) {
      return existing;
    }

    let userProps: { name: string; phone: string; email?: string } | undefined;
    if (this.userRepository) {
      const u = await this.userRepository.findById(dto.userId);
      if (u) {
        userProps = {
          name: u.name,
          phone: typeof u.phone === 'string' ? u.phone : (u.phone as any)?.value || '',
          email: typeof u.email === 'string' ? u.email : (u.email as any)?.value,
        };
      }
    }

    return await this.repository.createPartner({
      userId: dto.userId,
      status: 'ACTIVE',
      notes: dto.notes,
      user: userProps,
    });
  }
}
