import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/database/prisma/prisma.service.js';
import { UserNotFoundException } from '../../../domain/exceptions/user-not-found.exception.js';
import { IMAGE_PROCESSING_SERVICE_TOKEN } from '../../../shared/constants/tokens.js';
import type { IImageProcessingService } from '../../services/image-processing.service.interface.js';

@Injectable()
export class UploadUserAvatarUseCase {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(IMAGE_PROCESSING_SERVICE_TOKEN)
    private readonly imageProcessingService: IImageProcessingService,
  ) {}

  async execute(
    userId: string,
    fileBuffer: Buffer,
    originalName: string,
    mimeType?: string,
  ): Promise<{ avatarUrl: string; filename: string; message: string }> {
    if (!fileBuffer || fileBuffer.length === 0) {
      throw new BadRequestException('هیچ فایلی برای تصویر پروفایل ارسال نشده است.');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });

    if (!user) {
      throw new UserNotFoundException(userId);
    }

    // 1. Delete previous avatar file if exists to prevent orphaned files
    if (user.profile?.avatarStorageKey) {
      await this.imageProcessingService.deleteAvatar(user.profile.avatarStorageKey);
    }

    // 2. Process and save new avatar
    const processed = await this.imageProcessingService.processAndSaveAvatar(
      fileBuffer,
      originalName,
      mimeType,
    );

    // 3. Update database profile
    await this.prisma.userProfile.upsert({
      where: { userId },
      create: {
        userId,
        avatarUrl: processed.url,
        avatarStorageKey: processed.filename,
      },
      update: {
        avatarUrl: processed.url,
        avatarStorageKey: processed.filename,
        updatedAt: new Date(),
      },
    });

    return {
      avatarUrl: processed.url,
      filename: processed.filename,
      message: 'تصویر پروفایل با موفقیت بارگذاری و ذخیره شد.',
    };
  }
}
