import type { IAffiliateRepository } from '../../../domain/repositories/affiliate.repository.interface.js';
import type { AffiliateSettingsEntity } from '../../../domain/entities/affiliate.entity.js';
import type { UpdateAffiliateSettingsDto } from '../../dto/affiliate/affiliate.dto.js';

export class GetAffiliateSettingsUseCase {
  constructor(private readonly repository: IAffiliateRepository) {}

  async execute(): Promise<AffiliateSettingsEntity> {
    return await this.repository.getSettings();
  }
}

export class UpdateAffiliateSettingsUseCase {
  constructor(private readonly repository: IAffiliateRepository) {}

  async execute(dto: UpdateAffiliateSettingsDto): Promise<AffiliateSettingsEntity> {
    return await this.repository.updateSettings(dto);
  }
}
