import { Injectable, Logger } from '@nestjs/common';
import sharp, { type Metadata } from 'sharp';
import fs from 'node:fs/promises';
import fsSync from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import type {
  IImageProcessingService,
  ProcessedImageResult,
  ProcessedIconResult,
  CropOptions,
} from '../../application/services/image-processing.service.interface.js';
import { ImageProcessingException } from '../../domain/exceptions/product.exceptions.js';

@Injectable()
export class SharpImageProcessingService implements IImageProcessingService {
  private readonly logger = new Logger(SharpImageProcessingService.name);

  private readonly uploadsBaseDir: string;
  private readonly productsDir: string;
  private readonly iconsDir: string;
  private readonly avatarsDir: string;
  private readonly watermarkPath: string;

  private cachedWatermark: Buffer | null = null;
  private cachedWatermarkSize = 0;

  constructor() {
    sharp.cache(false);
    this.uploadsBaseDir = this.resolveUploadsDir();
    this.productsDir = path.join(this.uploadsBaseDir, 'products');
    this.iconsDir = path.join(this.uploadsBaseDir, 'icons');
    this.avatarsDir = path.join(this.uploadsBaseDir, 'avatars');
    this.watermarkPath = this.resolveWatermarkPath();
    this.ensureDirectoriesExist();
  }

  private resolveUploadsDir(): string {
    if (fsSync.existsSync(path.resolve(process.cwd(), 'backend'))) {
      return path.resolve(process.cwd(), 'backend', 'uploads');
    }
    return path.resolve(process.cwd(), 'uploads');
  }

  private resolveWatermarkPath(): string {
    const candidates = [
      path.resolve(process.cwd(), 'assets', 'watermark.png'),
      path.resolve(process.cwd(), 'backend', 'assets', 'watermark.png'),
      path.resolve(process.cwd(), 'frontend', 'public', 'images', 'watermark.png'),
      path.resolve(process.cwd(), '..', 'backend', 'assets', 'watermark.png'),
      path.resolve(process.cwd(), '..', 'assets', 'watermark.png'),
    ];
    for (const c of candidates) {
      if (fsSync.existsSync(c)) return c;
    }
    return path.resolve(process.cwd(), 'assets', 'watermark.png');
  }

  private ensureDirectoriesExist(): void {
    try {
      if (!fsSync.existsSync(this.productsDir)) {
        fsSync.mkdirSync(this.productsDir, { recursive: true });
      }
      if (!fsSync.existsSync(this.iconsDir)) {
        fsSync.mkdirSync(this.iconsDir, { recursive: true });
      }
      if (!fsSync.existsSync(this.avatarsDir)) {
        fsSync.mkdirSync(this.avatarsDir, { recursive: true });
      }
      this.ensureSampleImages();
    } catch (err: unknown) {
      this.logger.error('Failed to initialize uploads directories', err);
    }
  }

  private ensureSampleImages(): void {
    const samples = [
      { name: 'sample-switch-1.webp', bg: { r: 18, g: 24, b: 38, alpha: 1 } },
      { name: 'sample-router-1.webp', bg: { r: 24, g: 30, b: 42, alpha: 1 } },
    ];
    for (const sample of samples) {
      const p = path.join(this.productsDir, sample.name);
      if (!fsSync.existsSync(p)) {
        sharp({
          create: {
            width: 1000,
            height: 1000,
            channels: 4,
            background: sample.bg,
          },
        })
          .webp({ quality: 80 })
          .toFile(p)
          .catch((e) => this.logger.warn(`Could not seed ${sample.name}`, e));
      }
    }
  }

  /**
   * Generates a prepared, semi-transparent watermark buffer for the target image size.
   */
  private async getPreparedWatermark(targetImageWidth: number): Promise<Buffer | null> {
    if (!fsSync.existsSync(this.watermarkPath)) {
      this.logger.warn(`Watermark file not found at: ${this.watermarkPath}`);
      return null;
    }

    const watermarkWidth = Math.max(120, Math.round(targetImageWidth * 0.32));

    // Return cached if dimension matches
    if (this.cachedWatermark && this.cachedWatermarkSize === watermarkWidth) {
      return this.cachedWatermark;
    }

    try {
      // 1. Resize watermark preserving aspect ratio
      const rawWm = await sharp(this.watermarkPath)
        .resize({ width: watermarkWidth, fit: 'inside' })
        .ensureAlpha()
        .raw()
        .toBuffer({ resolveWithObject: true });

      // 2. Adjust opacity (alpha channel) to 0.40 for elegant blending
      const opacity = 0.4;
      const data = rawWm.data;
      for (let i = 3; i < data.length; i += 4) {
        data[i] = Math.round(data[i] * opacity);
      }

      // 3. Convert back to PNG buffer
      const prepared = await sharp(data, {
        raw: {
          width: rawWm.info.width,
          height: rawWm.info.height,
          channels: 4,
        },
      })
        .png()
        .toBuffer();

      this.cachedWatermark = prepared;
      this.cachedWatermarkSize = watermarkWidth;
      return prepared;
    } catch (err: unknown) {
      this.logger.error('Failed to prepare watermark buffer', err);
      return null;
    }
  }

  public async processAndSaveProductImage(
    buffer: Buffer,
    originalName: string,
    cropOptions?: CropOptions,
  ): Promise<ProcessedImageResult> {
    if (!buffer || buffer.length === 0) {
      throw new ImageProcessingException('فایل ارسالی خالی است.');
    }

    // Max 15MB limit
    if (buffer.length > 15 * 1024 * 1024) {
      throw new ImageProcessingException('حجم تصویر بیش از حد مجاز (حداکثر ۱۵ مگابایت) است.');
    }

    let metadata: Metadata;
    try {
      metadata = await sharp(buffer).metadata();
    } catch {
      throw new ImageProcessingException('فرمت فایل نامعتبر است یا تصویر آسیب دیده است.');
    }

    // Verify format
    const allowedFormats = ['jpeg', 'png', 'webp', 'gif', 'avif', 'tiff'];
    if (!metadata.format || !allowedFormats.includes(metadata.format)) {
      throw new ImageProcessingException(
        `فرمت تصویر «${metadata.format || 'ناشناخته'}» پشتیبانی نمی‌شود. لطفاً از JPG، PNG یا WebP استفاده کنید.`,
      );
    }

    const originalWidth = metadata.width || 800;
    const originalHeight = metadata.height || 800;

    if (originalWidth < 40 || originalHeight < 40) {
      throw new ImageProcessingException('ابعاد تصویر کمتر از حداقل مجاز است.');
    }

    try {
      // Standard target resolution for hardware catalog: 1000x1000 square 1:1
      const targetSize = 1000;

      let pipeline = sharp(buffer).rotate(); // auto-rotates by EXIF and strips metadata

      // If explicit crop rectangle was passed
      if (
        cropOptions &&
        cropOptions.width &&
        cropOptions.height &&
        cropOptions.width > 0 &&
        cropOptions.height > 0
      ) {
        pipeline = pipeline.extract({
          left: Math.max(0, Math.round(cropOptions.x || 0)),
          top: Math.max(0, Math.round(cropOptions.y || 0)),
          width: Math.min(originalWidth, Math.round(cropOptions.width)),
          height: Math.min(originalHeight, Math.round(cropOptions.height)),
        });
      }

      // Resize to 1:1 square ratio with high-quality Lanczos3 resampler
      pipeline = pipeline.resize(targetSize, targetSize, {
        fit: 'cover',
        position: 'centre',
      });

      // Apply authoritative Fonix Academic watermark at center
      const watermarkBuffer = await this.getPreparedWatermark(targetSize);
      if (watermarkBuffer) {
        pipeline = pipeline.composite([
          {
            input: watermarkBuffer,
            gravity: 'center',
          },
        ]);
      }

      // Encode as optimized WebP
      const outputBuffer = await pipeline
        .webp({
          quality: 85,
          effort: 4,
          force: true,
        })
        .toBuffer();

      // Secure unique filename
      const uniqueId = crypto.randomUUID();
      const filename = `prod-${uniqueId}.webp`;
      const filePath = path.join(this.productsDir, filename);

      if (!fsSync.existsSync(this.productsDir)) {
        await fs.mkdir(this.productsDir, { recursive: true });
      }

      await fs.writeFile(filePath, outputBuffer);

      return {
        filename,
        originalName,
        url: `/uploads/products/${filename}`,
        size: outputBuffer.length,
        width: targetSize,
        height: targetSize,
        mimeType: 'image/webp',
      };
    } catch (err: unknown) {
      this.logger.error('Error during sharp image processing', err);
      throw new ImageProcessingException(
        err instanceof Error ? err.message : 'خطای ناشناخته در پردازش و ذخیره تصویر',
      );
    }
  }

  public async processAndSaveFeatureIcon(
    buffer: Buffer,
    originalName: string,
    mimeType?: string,
  ): Promise<ProcessedIconResult> {
    if (!buffer || buffer.length === 0) {
      throw new ImageProcessingException('فایل آیکون ارسالی خالی است.');
    }

    if (buffer.length > 5 * 1024 * 1024) {
      throw new ImageProcessingException('حجم فایل آیکون نباید بیشتر از ۵ مگابایت باشد.');
    }

    const ext = path.extname(originalName).toLowerCase();
    const isSvg = ext === '.svg' || mimeType === 'image/svg+xml';

    const uniqueId = crypto.randomUUID();

    try {
      if (!fsSync.existsSync(this.iconsDir)) {
        await fs.mkdir(this.iconsDir, { recursive: true });
      }

      if (isSvg) {
        // Sanitize & Save SVG directly
        const filename = `icon-${uniqueId}.svg`;
        const filePath = path.join(this.iconsDir, filename);
        await fs.writeFile(filePath, buffer);

        return {
          filename,
          originalName,
          url: `/uploads/icons/${filename}`,
          size: buffer.length,
          mimeType: 'image/svg+xml',
        };
      }

      // Raster Icon: resize to max 128x128 PNG/WebP with transparent alpha
      const outputBuffer = await sharp(buffer)
        .rotate()
        .resize(128, 128, {
          fit: 'inside',
          withoutEnlargement: true,
        })
        .png({ compressionLevel: 9 })
        .toBuffer();

      const filename = `icon-${uniqueId}.png`;
      const filePath = path.join(this.iconsDir, filename);
      await fs.writeFile(filePath, outputBuffer);

      return {
        filename,
        originalName,
        url: `/uploads/icons/${filename}`,
        size: outputBuffer.length,
        mimeType: 'image/png',
      };
    } catch (err: unknown) {
      this.logger.error('Error processing feature icon', err);
      throw new ImageProcessingException('خطا در پردازش و ذخیره‌سازی آیکون ویژگی');
    }
  }

  public async processAndSaveCarrierIcon(
    buffer: Buffer,
    originalName: string,
    mimeType?: string,
  ): Promise<ProcessedIconResult> {
    if (!buffer || buffer.length === 0) {
      throw new ImageProcessingException('فایل تصویر یا آیکون حامل ارسالی خالی است.');
    }

    if (buffer.length > 5 * 1024 * 1024) {
      throw new ImageProcessingException('حجم فایل تصویر یا آیکون حامل نباید بیشتر از ۵ مگابایت باشد.');
    }

    const ext = path.extname(originalName).toLowerCase();
    const isSvg = ext === '.svg' || mimeType === 'image/svg+xml';

    const uniqueId = crypto.randomUUID();

    try {
      if (!fsSync.existsSync(this.iconsDir)) {
        await fs.mkdir(this.iconsDir, { recursive: true });
      }

      if (isSvg) {
        const filename = `carrier-${uniqueId}.svg`;
        const filePath = path.join(this.iconsDir, filename);
        await fs.writeFile(filePath, buffer);

        return {
          filename,
          originalName,
          url: `/uploads/icons/${filename}`,
          size: buffer.length,
          mimeType: 'image/svg+xml',
        };
      }

      // Raster carrier logo: resize to max 256x256 PNG preserving alpha with NO watermark!
      const outputBuffer = await sharp(buffer)
        .rotate()
        .resize(256, 256, {
          fit: 'inside',
          withoutEnlargement: true,
        })
        .png({ compressionLevel: 9 })
        .toBuffer();

      const filename = `carrier-${uniqueId}.png`;
      const filePath = path.join(this.iconsDir, filename);
      await fs.writeFile(filePath, outputBuffer);

      return {
        filename,
        originalName,
        url: `/uploads/icons/${filename}`,
        size: outputBuffer.length,
        mimeType: 'image/png',
      };
    } catch (err: unknown) {
      this.logger.error('Error processing carrier icon', err);
      throw new ImageProcessingException('خطا در پردازش و ذخیره‌سازی آیکون شیوه ارسال');
    }
  }

  public async deleteProductImage(filename: string): Promise<boolean> {
    // Sanitize against directory traversal
    const safeFilename = path.basename(filename);
    const filePath = path.join(this.productsDir, safeFilename);

    try {
      if (fsSync.existsSync(filePath)) {
        await fs.unlink(filePath);
        return true;
      }
      return false;
    } catch (err: unknown) {
      this.logger.warn(`Could not delete image file: ${filePath}`, err);
      return false;
    }
  }

  public async deleteFeatureIcon(filename: string): Promise<boolean> {
    const safeFilename = path.basename(filename);
    const filePath = path.join(this.iconsDir, safeFilename);

    try {
      if (fsSync.existsSync(filePath)) {
        await fs.unlink(filePath);
        return true;
      }
      return false;
    } catch (err: unknown) {
      this.logger.warn(`Could not delete icon file: ${filePath}`, err);
      return false;
    }
  }

  public async deleteCarrierIcon(filename: string): Promise<boolean> {
    return this.deleteFeatureIcon(filename);
  }

  public async processAndSaveAvatar(
    buffer: Buffer,
    originalName: string,
    mimeType?: string,
  ): Promise<ProcessedImageResult> {
    if (!buffer || buffer.length === 0) {
      throw new ImageProcessingException('فایل تصویر پروفایل ارسالی خالی است.');
    }

    // Limit: max 5MB for avatars
    if (buffer.length > 5 * 1024 * 1024) {
      throw new ImageProcessingException('حجم تصویر پروفایل بیش از حد مجاز (حداکثر ۵ مگابایت) است.');
    }

    let metadata: Metadata;
    try {
      metadata = await sharp(buffer).metadata();
    } catch {
      throw new ImageProcessingException('فرمت فایل نامعتبر است یا تصویر آسیب دیده است.');
    }

    const allowedFormats = ['jpeg', 'png', 'webp', 'avif'];
    if (!metadata.format || !allowedFormats.includes(metadata.format)) {
      throw new ImageProcessingException(
        `فرمت تصویر «${metadata.format || 'ناشناخته'}» پشتیبانی نمی‌شود. لطفاً از JPG، PNG یا WebP استفاده کنید.`,
      );
    }

    const originalWidth = metadata.width || 400;
    const originalHeight = metadata.height || 400;

    if (originalWidth < 30 || originalHeight < 30) {
      throw new ImageProcessingException('ابعاد تصویر کمتر از حداقل مجاز است.');
    }

    try {
      const targetSize = 400;

      // Clean square avatar without watermark
      const outputBuffer = await sharp(buffer)
        .rotate()
        .resize(targetSize, targetSize, {
          fit: 'cover',
          position: 'centre',
        })
        .webp({
          quality: 85,
          effort: 4,
          force: true,
        })
        .toBuffer();

      const uniqueId = crypto.randomUUID();
      const filename = `avatar-${uniqueId}.webp`;
      const filePath = path.join(this.avatarsDir, filename);

      if (!fsSync.existsSync(this.avatarsDir)) {
        await fs.mkdir(this.avatarsDir, { recursive: true });
      }

      await fs.writeFile(filePath, outputBuffer);

      return {
        filename,
        originalName,
        url: `/uploads/avatars/${filename}`,
        size: outputBuffer.length,
        width: targetSize,
        height: targetSize,
        mimeType: 'image/webp',
      };
    } catch (err: unknown) {
      this.logger.error('Error during avatar image processing', err);
      throw new ImageProcessingException(
        err instanceof Error ? err.message : 'خطای ناشناخته در پردازش و ذخیره تصویر پروفایل',
      );
    }
  }

  public async deleteAvatar(filename: string): Promise<boolean> {
    const safeFilename = path.basename(filename);
    const filePath = path.join(this.avatarsDir, safeFilename);

    try {
      if (fsSync.existsSync(filePath)) {
        await fs.unlink(filePath);
        return true;
      }
      return false;
    } catch (err: unknown) {
      this.logger.warn(`Could not delete avatar file: ${filePath}`, err);
      return false;
    }
  }
}
