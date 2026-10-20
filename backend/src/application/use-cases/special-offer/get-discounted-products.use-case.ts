import type {
  ISpecialOfferRepository,
  DiscountedCatalogProduct,
} from '../../../domain/repositories/special-offer.repository.interface.js';

export class GetDiscountedProductsUseCase {
  constructor(private readonly specialOfferRepo: ISpecialOfferRepository) {}

  async execute(): Promise<DiscountedCatalogProduct[]> {
    return await this.specialOfferRepo.getDiscountedProducts();
  }
}
