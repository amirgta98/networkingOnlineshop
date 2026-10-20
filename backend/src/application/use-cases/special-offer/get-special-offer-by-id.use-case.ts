import type { ISpecialOfferRepository } from '../../../domain/repositories/special-offer.repository.interface.js';
import type { SpecialOfferCampaignEntity } from '../../../domain/entities/special-offer.entity.js';
import { SpecialOfferNotFoundException } from '../../../domain/exceptions/special-offer.exceptions.js';

export class GetSpecialOfferByIdUseCase {
  constructor(private readonly specialOfferRepo: ISpecialOfferRepository) {}

  async execute(id: string): Promise<SpecialOfferCampaignEntity> {
    const campaign = await this.specialOfferRepo.findById(id);
    if (!campaign) {
      throw new SpecialOfferNotFoundException(id);
    }
    return campaign;
  }
}
