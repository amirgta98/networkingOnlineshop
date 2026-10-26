import type { IUserRepository } from '../../../domain/repositories/user.repository.interface.js';
import type { UserFavoriteDetails } from '../../../domain/entities/user-detail.types.js';
import { UserNotFoundException } from '../../../domain/exceptions/user-not-found.exception.js';

export interface ToggleFavoriteResult {
  isFavorited: boolean;
  message: string;
  item?: UserFavoriteDetails;
}

export class ToggleUserFavoriteUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(userId: string, productId: string): Promise<ToggleFavoriteResult> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UserNotFoundException(userId);
    }
    const isFav = await this.userRepository.isFavorite(userId, productId);
    if (isFav) {
      await this.userRepository.removeFavorite(userId, productId);
      return {
        isFavorited: false,
        message: 'محصول با موفقیت از لیست علاقه‌مندی‌ها حذف شد.',
      };
    } else {
      const item = await this.userRepository.addFavorite(userId, productId);
      return {
        isFavorited: true,
        message: 'محصول با موفقیت به لیست علاقه‌مندی‌ها اضافه شد.',
        item,
      };
    }
  }
}
