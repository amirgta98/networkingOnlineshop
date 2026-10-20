import type { ISpecialOfferRepository } from '../../../domain/repositories/special-offer.repository.interface.js';
import type {
  SpecialOfferCampaignEntity,
  CampaignStatusType,
} from '../../../domain/entities/special-offer.entity.js';
import { SpecialOfferNotFoundException } from '../../../domain/exceptions/special-offer.exceptions.js';

export class UpdateSpecialOfferStatusUseCase {
  constructor(private readonly specialOfferRepo: ISpecialOfferRepository) {}

  async execute(
    id: string,
    status: CampaignStatusType,
    isPublished?: boolean,
  ): Promise<SpecialOfferCampaignEntity> {
    if (status === 'ACTIVE') {
      return await this.specialOfferRepo.activateCampaign(id);
    }

    const existing = await this.specialOfferRepo.findById(id);
    if (!existing) {
      throw new SpecialOfferNotFoundException(id);
    }

    existing.status = status;
    if (isPublished !== undefined) {
      existing.isPublished = isPublished;
    } else if (status === 'INACTIVE') {
      existing.isPublished = false;
    }
    existing.updatedAt = new Date();

    return await this.specialOfferRepo.update(existing);
  }

}
