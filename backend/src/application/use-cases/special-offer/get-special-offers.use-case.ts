import type {
  ISpecialOfferRepository,
  SpecialOfferFilter,
} from '../../../domain/repositories/special-offer.repository.interface.js';
import type { SpecialOfferCampaignEntity } from '../../../domain/entities/special-offer.entity.js';

export class GetSpecialOffersUseCase {
  constructor(private readonly specialOfferRepo: ISpecialOfferRepository) {}

  async execute(filter?: SpecialOfferFilter): Promise<SpecialOfferCampaignEntity[]> {
    return await this.specialOfferRepo.findAll(filter);
  }
}
