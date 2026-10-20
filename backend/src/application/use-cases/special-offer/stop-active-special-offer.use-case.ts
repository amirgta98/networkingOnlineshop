import type { ISpecialOfferRepository } from '../../../domain/repositories/special-offer.repository.interface.js';

export class StopActiveSpecialOfferUseCase {
  constructor(private readonly specialOfferRepo: ISpecialOfferRepository) {}

  async execute(): Promise<{ success: boolean; message: string }> {
    await this.specialOfferRepo.deactivateAllActive();
    return {
      success: true,
      message: 'فروش ویژه با موفقیت متوقف و غیرفعال گردید.',
    };
  }
}
