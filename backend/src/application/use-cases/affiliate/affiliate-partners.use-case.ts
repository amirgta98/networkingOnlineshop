import { randomUUID } from 'node:crypto';
import type { IAffiliateRepository, PartnerQueryParams } from '../../../domain/repositories/affiliate.repository.interface.js';
import type { IUserRepository } from '../../../domain/repositories/user.repository.interface.js';
import type { AffiliatePartnerEntity } from '../../../domain/entities/affiliate.entity.js';
import type { UpdatePartnerDto, RegisterPartnerDto, CreatePartnerAdminDto } from '../../dto/affiliate/affiliate.dto.js';
import { User } from '../../../domain/entities/user.entity.js';
import { PhoneNumber } from '../../../domain/value-objects/phone-number.vo.js';

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

export class CreateAffiliatePartnerUseCase {
  constructor(
    private readonly repository: IAffiliateRepository,
    private readonly userRepository?: IUserRepository,
  ) {}

  async execute(dto: CreatePartnerAdminDto): Promise<AffiliatePartnerEntity> {
    let targetUserId = dto.userId;

    if (!targetUserId && dto.phone && this.userRepository) {
      try {
        const cleanPhone = PhoneNumber.normalize(dto.phone);
        const existingUser =
          (await this.userRepository.findByPhone(cleanPhone)) ||
          (await this.userRepository.findByPhone(dto.phone));
        if (existingUser) {
          targetUserId = existingUser.id;
        }
      } catch {
        // Continue if phone lookup fails
      }
    }

    if (!targetUserId) {
      if (this.userRepository) {
        const newUserId = randomUUID();
        const fallbackEmail = `partner_${newUserId.slice(0, 8)}@velox.local`;
        let validPhone: string | null = null;
        if (dto.phone) {
          try {
            const cleanPhone = PhoneNumber.normalize(dto.phone);
            if (PhoneNumber.isValid(cleanPhone)) {
              validPhone = cleanPhone;
            }
          } catch {
            validPhone = null;
          }
        }
        const newUser = User.create({
          id: newUserId,
          name: dto.name?.trim() || 'همکار فروش',
          phone: validPhone,
          email: dto.email?.trim() || fallbackEmail,
          role: 'partner',
        });
        await this.userRepository.save(newUser);
        targetUserId = newUserId;
      } else {
        targetUserId = randomUUID();
      }
    }

    const existing = await this.repository.findPartnerByUserId(targetUserId);
    if (existing) {
      throw new Error('این کاربر از قبل به عنوان همکار فروش ثبت شده است.');
    }

    let userProps: { name: string; phone: string; email?: string } | undefined;
    if (this.userRepository) {
      const u = await this.userRepository.findById(targetUserId);
      if (u) {
        userProps = {
          name: u.name,
          phone: typeof u.phone === 'string' ? u.phone : (u.phone as any)?.value || '',
          email: typeof u.email === 'string' ? u.email : (u.email as any)?.value,
        };
      }
    }

    if (!userProps && (dto.name || dto.phone)) {
      userProps = {
        name: dto.name || 'همکار فروش',
        phone: dto.phone || '09000000000',
        email: dto.email,
      };
    }

    return await this.repository.createPartner({
      userId: targetUserId,
      partnerCode: dto.partnerCode,
      status: dto.status || 'ACTIVE',
      customDiscountPercent: dto.customDiscountPercent ?? null,
      customStaticIpCommission: dto.customStaticIpCommission ?? null,
      customInternetCommission: dto.customInternetCommission ?? null,
      isDiscountEnabled: dto.isDiscountEnabled ?? true,
      isCommissionEnabled: dto.isCommissionEnabled ?? true,
      notes: dto.notes,
      user: userProps,
    });
  }
}
