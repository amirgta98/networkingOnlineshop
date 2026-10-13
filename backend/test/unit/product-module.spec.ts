import { describe, it, expect, beforeEach } from 'vitest';
import sharp from 'sharp';
import fs from 'node:fs/promises';
import fsSync from 'node:fs';
import path from 'node:path';
import { InMemoryProductRepository } from '../../src/infrastructure/database/in-memory/in-memory-product.repository.js';
import { CreateProductUseCase } from '../../src/application/use-cases/product/create-product.use-case.js';
import { GetProductsUseCase } from '../../src/application/use-cases/product/get-products.use-case.js';
import { GetProductByIdUseCase } from '../../src/application/use-cases/product/get-product-by-id.use-case.js';
import { UpdateProductUseCase } from '../../src/application/use-cases/product/update-product.use-case.js';
import { DeleteProductUseCase } from '../../src/application/use-cases/product/delete-product.use-case.js';
import { UpdateProductStockUseCase } from '../../src/application/use-cases/product/update-product-stock.use-case.js';
import { SharpImageProcessingService } from '../../src/infrastructure/services/sharp-image-processing.service.js';
import {
  DuplicateSkuException,
  InvalidProductDataException,
  ProductNotFoundException,
  ImageProcessingException,
} from '../../src/domain/exceptions/product.exceptions.js';

describe('Product Module - Clean Architecture Unit Tests', () => {
  let productRepo: InMemoryProductRepository;
  let createProductUseCase: CreateProductUseCase;
  let getProductsUseCase: GetProductsUseCase;
  let getProductByIdUseCase: GetProductByIdUseCase;
  let updateProductUseCase: UpdateProductUseCase;
  let deleteProductUseCase: DeleteProductUseCase;
  let updateProductStockUseCase: UpdateProductStockUseCase;
  let imageProcessingService: SharpImageProcessingService;

  beforeEach(() => {
    productRepo = new InMemoryProductRepository();
    createProductUseCase = new CreateProductUseCase(productRepo);
    getProductsUseCase = new GetProductsUseCase(productRepo);
    getProductByIdUseCase = new GetProductByIdUseCase(productRepo);
    updateProductUseCase = new UpdateProductUseCase(productRepo);
    deleteProductUseCase = new DeleteProductUseCase(productRepo);
    updateProductStockUseCase = new UpdateProductStockUseCase(productRepo);
    imageProcessingService = new SharpImageProcessingService();
  });

  describe('CreateProductUseCase', () => {
    it('should successfully create a new product with dynamic features and images', async () => {
      const result = await createProductUseCase.execute({
        name: 'سوئیچ ۴۸ پورت سیسکو Catalyst 3850',
        sku: 'WS-C3850-48P-L',
        category: 'switches',
        brand: 'Cisco',
        price: 92000000,
        costPrice: 78000000,
        stock: 5,
        minStockAlert: 2,
        images: ['/uploads/products/cisco-3850.webp'],
        features: [
          {
            title: 'تعداد پورت',
            description: '۴۸ پورت گیگابیت اترنت با PoE+',
            iconName: 'network',
            sortOrder: 0,
          },
          {
            title: 'ظرفیت استک',
            description: 'فناوری StackWise-480 با پهنای باند ۴۸۰ گیگابیت',
            iconName: 'layers',
            sortOrder: 1,
          },
        ],
      });

      expect(result.id).toBeDefined();
      expect(result.name).toBe('سوئیچ ۴۸ پورت سیسکو Catalyst 3850');
      expect(result.sku).toBe('WS-C3850-48P-L');
      expect(result.features?.length).toBe(2);
      expect(result.features?.[0].title).toBe('تعداد پورت');
      expect(result.status).toBe('active');
    });

    it('should throw DuplicateSkuException if SKU already exists in repository', async () => {
      await expect(
        createProductUseCase.execute({
          name: 'تکراری',
          sku: 'WS-C2960X-24PS-L', // already in seed products
          category: 'switches',
          brand: 'Cisco',
          price: 50000000,
          stock: 10,
          images: [],
        }),
      ).rejects.toThrow(DuplicateSkuException);
    });

    it('should throw InvalidProductDataException for invalid inputs', async () => {
      await expect(
        createProductUseCase.execute({
          name: '',
          sku: 'SKU-TEST',
          category: 'switches',
          brand: 'Cisco',
          price: 1000,
          stock: 5,
          images: [],
        }),
      ).rejects.toThrow(InvalidProductDataException);

      await expect(
        createProductUseCase.execute({
          name: 'کالای تست',
          sku: 'SKU-TEST',
          category: 'switches',
          brand: 'Cisco',
          price: 0,
          stock: 5,
          images: [],
        }),
      ).rejects.toThrow(InvalidProductDataException);

      await expect(
        createProductUseCase.execute({
          name: 'کالای تست',
          sku: 'SKU-TEST',
          category: 'switches',
          brand: 'Cisco',
          price: 10000,
          stock: -1,
          images: [],
        }),
      ).rejects.toThrow(InvalidProductDataException);
    });
  });

  describe('GetProductsUseCase', () => {
    it('should return paginated products and filter by search query', async () => {
      const res = await getProductsUseCase.execute({ search: '2960X' });
      expect(res.products.length).toBe(1);
      expect(res.products[0].sku).toBe('WS-C2960X-24PS-L');
    });

    it('should filter products by category', async () => {
      const res = await getProductsUseCase.execute({ category: 'routers' });
      expect(res.products.length).toBe(1);
      expect(res.products[0].brand).toBe('MikroTik');
    });

    it('should filter products by brand', async () => {
      const res = await getProductsUseCase.execute({ brand: 'Cisco' });
      expect(res.products.length).toBeGreaterThanOrEqual(1);
      expect(res.products[0].brand).toBe('Cisco');
    });
  });

  describe('GetProductByIdUseCase & UpdateProductUseCase', () => {
    it('should retrieve product by id and update dynamic features', async () => {
      const product = await getProductByIdUseCase.execute('prod-cisco-2960x');
      expect(product.id).toBe('prod-cisco-2960x');

      const updated = await updateProductUseCase.execute('prod-cisco-2960x', {
        price: 49900000,
        features: [
          {
            title: 'ویژگی جدید',
            description: 'توضیحات تست به‌روزرسانی شده',
            iconName: 'wifi',
            sortOrder: 0,
          },
        ],
      });

      expect(updated.price).toBe(49900000);
      expect(updated.features?.length).toBe(1);
      expect(updated.features?.[0].title).toBe('ویژگی جدید');
    });

    it('should throw ProductNotFoundException for non-existent id', async () => {
      await expect(getProductByIdUseCase.execute('non-existent-id')).rejects.toThrow(
        ProductNotFoundException,
      );
      await expect(
        updateProductUseCase.execute('non-existent-id', { price: 100 }),
      ).rejects.toThrow(ProductNotFoundException);
    });
  });

  describe('UpdateProductStockUseCase', () => {
    it('should update stock, price and transition status to out_of_stock when stock reaches 0', async () => {
      const updated = await updateProductStockUseCase.execute('prod-cisco-2960x', {
        stock: 0,
        price: 51000000,
      });

      expect(updated.stock).toBe(0);
      expect(updated.price).toBe(51000000);
      expect(updated.status).toBe('out_of_stock');

      // Restock should transition back to active
      const restocked = await updateProductStockUseCase.execute('prod-cisco-2960x', {
        stock: 12,
      });
      expect(restocked.stock).toBe(12);
      expect(restocked.status).toBe('active');
    });

    it('should reject negative stock count', async () => {
      await expect(
        updateProductStockUseCase.execute('prod-cisco-2960x', {
          stock: -5,
        }),
      ).rejects.toThrow(InvalidProductDataException);
    });
  });

  describe('DeleteProductUseCase', () => {
    it('should delete existing product', async () => {
      const del = await deleteProductUseCase.execute('prod-mikrotik-ccr2004');
      expect(del.success).toBe(true);

      await expect(getProductByIdUseCase.execute('prod-mikrotik-ccr2004')).rejects.toThrow(
        ProductNotFoundException,
      );
    });
  });

  describe('SharpImageProcessingService (Watermark & 1:1 Square Crop)', () => {
    it('should process rectangular image into 1:1 square WebP with watermark', async () => {
      // Create a 1200x800 landscape test image
      const inputBuffer = await sharp({
        create: {
          width: 1200,
          height: 800,
          channels: 3,
          background: { r: 50, g: 100, b: 150 },
        },
      })
        .jpeg()
        .toBuffer();

      const result = await imageProcessingService.processAndSaveProductImage(
        inputBuffer,
        'cisco-router-test.jpg',
      );

      expect(result.filename).toMatch(/^prod-.*\.webp$/);
      expect(result.mimeType).toBe('image/webp');
      expect(result.width).toBe(1000);
      expect(result.height).toBe(1000);
      expect(result.url).toContain('/uploads/products/');

      // Verify the generated file on disk
      const filePath = path.resolve('uploads/products', result.filename);
      expect(fsSync.existsSync(filePath)).toBe(true);

      // Verify dimensions of generated file with sharp
      const fileBytes = await fs.readFile(filePath);
      const generatedMeta = await sharp(fileBytes).metadata();
      expect(generatedMeta.width).toBe(1000);
      expect(generatedMeta.height).toBe(1000);
      expect(generatedMeta.format).toBe('webp');

      // Cleanup
      await imageProcessingService.deleteProductImage(result.filename);
      expect(fsSync.existsSync(filePath)).toBe(false);
    });

    it('should reject invalid or non-image buffers', async () => {
      const invalidBuffer = Buffer.from('this is not a valid image file content');
      await expect(
        imageProcessingService.processAndSaveProductImage(invalidBuffer, 'bad.png'),
      ).rejects.toThrow(ImageProcessingException);
    });

    it('should process and save feature icons (SVG and PNG)', async () => {
      // 1. SVG
      const svgBuffer = Buffer.from(
        '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"><circle cx="12" cy="12" r="10"/></svg>',
      );
      const svgResult = await imageProcessingService.processAndSaveFeatureIcon(
        svgBuffer,
        'custom-icon.svg',
        'image/svg+xml',
      );
      expect(svgResult.filename).toMatch(/^icon-.*\.svg$/);
      expect(svgResult.mimeType).toBe('image/svg+xml');

      // 2. PNG
      const pngBuffer = await sharp({
        create: {
          width: 256,
          height: 256,
          channels: 4,
          background: { r: 255, g: 0, b: 0, alpha: 1 },
        },
      })
        .png()
        .toBuffer();

      const pngResult = await imageProcessingService.processAndSaveFeatureIcon(
        pngBuffer,
        'chip.png',
        'image/png',
      );
      expect(pngResult.filename).toMatch(/^icon-.*\.png$/);
      expect(pngResult.mimeType).toBe('image/png');

      // Cleanup
      await imageProcessingService.deleteFeatureIcon(svgResult.filename);
      await imageProcessingService.deleteFeatureIcon(pngResult.filename);
    });
  });

  describe('Related Products Support', () => {
    it('should create product with relatedProductIds and resolve them on getProductById', async () => {
      const p1 = await createProductUseCase.execute({
        name: 'پچ کورد شبکه نگزنس ۵ متری',
        sku: 'NEX-PATCH-5M',
        category: 'cables',
        brand: 'Nexans',
        price: 150000,
        stock: 50,
        images: ['/uploads/products/patch.webp'],
        relatedProductIds: ['prod-cisco-2960x'],
      });

      expect(p1.relatedProductIds).toEqual(['prod-cisco-2960x']);

      const fetched = await getProductByIdUseCase.execute(p1.id);
      expect(fetched.relatedProductIds).toEqual(['prod-cisco-2960x']);
      expect(fetched.relatedProducts).toBeDefined();
      expect(fetched.relatedProducts?.length).toBe(1);
      expect(fetched.relatedProducts?.[0].sku).toBe('WS-C2960X-24PS-L');
    });

    it('should update relatedProductIds on existing product', async () => {
      const updated = await updateProductUseCase.execute('prod-cisco-2960x', {
        relatedProductIds: ['prod-mikrotik-ccr2004'],
      });

      expect(updated.relatedProductIds).toEqual(['prod-mikrotik-ccr2004']);
    });
  });
});
