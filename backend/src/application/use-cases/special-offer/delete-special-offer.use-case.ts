import type { ISpecialOfferRepository } from '../../../domain/repositories/special-offer.repository.interface.js';
import { SpecialOfferNotFoundException } from '../../../domain/exceptions/special-offer.exceptions.js';

export class DeleteSpecialOfferUseCase {
  constructor(private readonly specialOfferRepo: ISpecialOfferRepository) {}

  async execute(id: string): Promise<{ success: boolean; message: string }> {
    const existing = await this.specialOfferRepo.findById(id);
    if (!existing) {
      throw new SpecialOfferNotFoundException(id);
    }

    const deleted = await this.specialOfferRepo.delete(id);
    return {
      success: deleted,
      message: 'کمپین فروش ویژه با موفقیت حذف شد.',
    };
  }
}
