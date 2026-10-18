import { describe, it, expect, afterEach } from 'vitest';
import sharp from 'sharp';
import fs from 'node:fs/promises';
import fsSync from 'node:fs';
import path from 'node:path';
import { SharpImageProcessingService } from '../../src/infrastructure/services/sharp-image-processing.service.js';
import { ImageProcessingException } from '../../src/domain/exceptions/product.exceptions.js';

describe('Avatar Image Processing Service', () => {
  const service = new SharpImageProcessingService();
  const createdFiles: string[] = [];

  afterEach(async () => {
    for (const f of createdFiles) {
      await service.deleteAvatar(f);
    }
    createdFiles.length = 0;
  });

  it('should reject empty image buffer', async () => {
    await expect(
      service.processAndSaveAvatar(Buffer.alloc(0), 'empty.png'),
    ).rejects.toThrow(ImageProcessingException);
  });

  it('should reject file exceeding 5MB', async () => {
    const hugeBuffer = Buffer.alloc(5 * 1024 * 1024 + 10);
    await expect(
      service.processAndSaveAvatar(hugeBuffer, 'huge.png'),
    ).rejects.toThrow(ImageProcessingException);
  });

  it('should process image into a clean 400x400 WebP without watermark', async () => {
    // Generate valid test PNG image (600x400)
    const testImageBuffer = await sharp({
      create: {
        width: 600,
        height: 400,
        channels: 4,
        background: { r: 10, g: 50, b: 200, alpha: 1 },
      },
    })
      .png()
      .toBuffer();

    const result = await service.processAndSaveAvatar(testImageBuffer, 'avatar-test.png');
    createdFiles.push(result.filename);

    expect(result.width).toBe(400);
    expect(result.height).toBe(400);
    expect(result.mimeType).toBe('image/webp');
    expect(result.url).toMatch(/^\/uploads\/avatars\/avatar-.*\.webp$/);

    // Verify saved file metadata on disk
    const diskPath = path.join(process.cwd(), 'uploads', 'avatars', result.filename);
    expect(fsSync.existsSync(diskPath)).toBe(true);

    const metadata = await sharp(diskPath).metadata();
    expect(metadata.width).toBe(400);
    expect(metadata.height).toBe(400);
    expect(metadata.format).toBe('webp');
  });

  it('should delete avatar file from disk cleanly', async () => {
    const testImageBuffer = await sharp({
      create: {
        width: 300,
        height: 300,
        channels: 3,
        background: { r: 50, g: 150, b: 50 },
      },
    })
      .png()
      .toBuffer();

    const result = await service.processAndSaveAvatar(testImageBuffer, 'avatar-del.png');
    const diskPath = path.join(process.cwd(), 'uploads', 'avatars', result.filename);
    expect(fsSync.existsSync(diskPath)).toBe(true);

    const deleted = await service.deleteAvatar(result.filename);
    expect(deleted).toBe(true);
    expect(fsSync.existsSync(diskPath)).toBe(false);
  });
});
