import type { ISpecialOfferRepository } from '../../../domain/repositories/special-offer.repository.interface.js';
import type { SpecialOfferCampaignEntity } from '../../../domain/entities/special-offer.entity.js';

export class GetActiveSpecialOfferUseCase {
  constructor(private readonly specialOfferRepo: ISpecialOfferRepository) {}

  async execute(): Promise<SpecialOfferCampaignEntity | null> {
    return await this.specialOfferRepo.findActiveCampaign();
  }
}
