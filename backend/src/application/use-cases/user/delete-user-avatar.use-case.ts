import { Injectable, Inject } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/database/prisma/prisma.service.js';
import { UserNotFoundException } from '../../../domain/exceptions/user-not-found.exception.js';
import { IMAGE_PROCESSING_SERVICE_TOKEN } from '../../../shared/constants/tokens.js';
import type { IImageProcessingService } from '../../services/image-processing.service.interface.js';

@Injectable()
export class DeleteUserAvatarUseCase {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(IMAGE_PROCESSING_SERVICE_TOKEN)
    private readonly imageProcessingService: IImageProcessingService,
  ) {}

  async execute(userId: string): Promise<{ success: boolean; message: string }> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });

    if (!user) {
      throw new UserNotFoundException(userId);
    }

    // 1. Delete physical file from disk
    if (user.profile?.avatarStorageKey) {
      await this.imageProcessingService.deleteAvatar(user.profile.avatarStorageKey);
    }

    // 2. Clear avatar fields in database
    if (user.profile) {
      await this.prisma.userProfile.update({
        where: { userId },
        data: {
          avatarUrl: null,
          avatarStorageKey: null,
          updatedAt: new Date(),
        },
      });
    }

    return {
      success: true,
      message: 'تصویر پروفایل با موفقیت حذف شد و به تصویر پیش‌فرض بازگشت.',
    };
  }
}
