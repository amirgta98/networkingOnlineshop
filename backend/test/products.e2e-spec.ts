import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import sharp from 'sharp';
import { AppModule } from '../src/app.module.js';
import { DomainExceptionFilter } from '../src/presentation/filters/domain-exception.filter.js';

describe('Products API (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    app.useGlobalFilters(new DomainExceptionFilter());
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('Full Product Lifecycle: create, fetch, edit features, update stock, and delete', async () => {
    // 1. Create Product with Dynamic Features
    const payload = {
      name: 'سوئیچ مدیریتی ۲۴ پورت سیسکو E2E',
      sku: `WS-C2960X-E2E-${Date.now()}`,
      category: 'switches',
      brand: 'Cisco',
      price: 45000000,
      costPrice: 38000000,
      stock: 10,
      minStockAlert: 3,
      warehouseLocation: 'انبار تست',
      images: ['/uploads/products/sample-1.webp'],
      features: [
        {
          title: 'توان PoE+',
          description: 'توان خروجی ۳۷۰ وات با مصرف هوشمند',
          iconName: 'zap',
          sortOrder: 0,
        },
        {
          title: 'ماژول آپ‌لینک',
          description: '۴ پورت ۱ گیگابیت SFP',
          iconName: 'layers',
          sortOrder: 1,
        },
      ],
    };

    const createRes = await request(app.getHttpServer())
      .post('/api/v1/products')
      .send(payload)
      .expect(201);

    expect(createRes.body).toHaveProperty('id');
    expect(createRes.body.name).toBe(payload.name);
    expect(createRes.body.sku).toBe(payload.sku);
    expect(createRes.body.features.length).toBe(2);
    expect(createRes.body.features[0].title).toBe('توان PoE+');

    const productId = createRes.body.id;

    // 2. Fetch created product by ID
    const getRes = await request(app.getHttpServer())
      .get(`/api/v1/products/${productId}`)
      .expect(200);

    expect(getRes.body.id).toBe(productId);
    expect(getRes.body.sku).toBe(payload.sku);

    // 3. Query list
    const listRes = await request(app.getHttpServer())
      .get('/api/v1/products')
      .query({ search: payload.sku })
      .expect(200);

    expect(listRes.body.products.length).toBe(1);
    expect(listRes.body.products[0].id).toBe(productId);

    // 4. Update Product & Dynamic Features
    const updateRes = await request(app.getHttpServer())
      .put(`/api/v1/products/${productId}`)
      .send({
        price: 47000000,
        features: [
          {
            title: 'ویژگی جدید اصلاح‌شده',
            description: 'توضیحات تست E2E',
            iconName: 'wifi',
            sortOrder: 0,
          },
        ],
      })
      .expect(200);

    expect(updateRes.body.price).toBe(47000000);
    expect(updateRes.body.features.length).toBe(1);
    expect(updateRes.body.features[0].title).toBe('ویژگی جدید اصلاح‌شده');

    // 5. Update Stock
    const stockRes = await request(app.getHttpServer())
      .patch(`/api/v1/products/${productId}/stock`)
      .send({
        stock: 25,
        price: 46500000,
      })
      .expect(200);

    expect(stockRes.body.stock).toBe(25);
    expect(stockRes.body.price).toBe(46500000);

    // 6. Delete Product
    await request(app.getHttpServer())
      .delete(`/api/v1/products/${productId}`)
      .expect(200);

    // 7. Verify 404
    await request(app.getHttpServer())
      .get(`/api/v1/products/${productId}`)
      .expect(404);
  });

  it('POST /api/v1/products/upload-images - processes multi-image upload with Sharp 1:1 and returns URLs', async () => {
    const img1 = await sharp({
      create: { width: 800, height: 600, channels: 3, background: { r: 40, g: 80, b: 120 } },
    }).jpeg().toBuffer();

    const img2 = await sharp({
      create: { width: 1200, height: 900, channels: 3, background: { r: 120, g: 60, b: 30 } },
    }).png().toBuffer();

    const uploadRes = await request(app.getHttpServer())
      .post('/api/v1/products/upload-images')
      .attach('files', img1, 'switch-front.jpg')
      .attach('files', img2, 'switch-back.png')
      .expect(200);

    expect(uploadRes.body).toHaveProperty('images');
    expect(uploadRes.body.images.length).toBe(2);
    for (const img of uploadRes.body.images) {
      expect(img.url).toContain('/uploads/products/');
      expect(img.width).toBe(1000);
      expect(img.height).toBe(1000);
      expect(img.mimeType).toBe('image/webp');
    }

    // Delete one of the uploaded images
    const filename = uploadRes.body.images[0].filename;
    const deleteRes = await request(app.getHttpServer())
      .delete(`/api/v1/products/images/${filename}`)
      .expect(200);
    expect(deleteRes.body.success).toBe(true);
  });

  it('POST /api/v1/products/upload-icon - saves dynamic feature icon and deletes it', async () => {
    const iconBuffer = Buffer.from(
      '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32"><rect width="32" height="32" fill="#10b981"/></svg>',
    );

    const uploadRes = await request(app.getHttpServer())
      .post('/api/v1/products/upload-icon')
      .attach('file', iconBuffer, 'feature-icon.svg')
      .expect(200);

    expect(uploadRes.body).toHaveProperty('url');
    expect(uploadRes.body.url).toContain('/uploads/icons/');
    expect(uploadRes.body.mimeType).toBe('image/svg+xml');

    // Delete the icon
    const filename = uploadRes.body.filename;
    const deleteRes = await request(app.getHttpServer())
      .delete(`/api/v1/products/icons/${filename}`)
      .expect(200);
    expect(deleteRes.body.success).toBe(true);
  });

  it('PATCH /api/v1/products/:id/images - manages image order and sets primary image', async () => {
    // 1. Create product with 2 images
    const payload = {
      name: 'روتر تستی مدیریت تصاویر',
      sku: `ROUTER-IMG-${Date.now()}`,
      category: 'routers',
      brand: 'MikroTik',
      price: 25000000,
      stock: 5,
      images: ['/uploads/products/first.webp', '/uploads/products/second.webp'],
    };

    const createRes = await request(app.getHttpServer())
      .post('/api/v1/products')
      .send(payload)
      .expect(201);

    const prodId = createRes.body.id;
    expect(createRes.body.images[0]).toBe('/uploads/products/first.webp');

    // 2. Reorder images (swap first and second)
    const reorderRes = await request(app.getHttpServer())
      .patch(`/api/v1/products/${prodId}/images`)
      .send({ images: ['/uploads/products/second.webp', '/uploads/products/first.webp'] })
      .expect(200);

    expect(reorderRes.body.images[0]).toBe('/uploads/products/second.webp');
    expect(reorderRes.body.images[1]).toBe('/uploads/products/first.webp');
  });

  it('POST /api/v1/products/upload-images - rejects request when no files are attached', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/products/upload-images')
      .expect(400);
  });

  it('POST /api/v1/products - successfully creates product with reservedStock, rating, reviewCount, costPrice 0 and discountPercent', async () => {
    const payload = {
      name: 'سوئیچ ۲۴ پورت تستی با موجودی رزرو شده',
      sku: `WS-TEST-RES-${Date.now()}`,
      category: 'switches',
      brand: 'Cisco',
      price: 15000000,
      originalPrice: 18000000,
      costPrice: 0,
      stock: 20,
      minStockAlert: 2,
      reservedStock: 3,
      warehouseLocation: 'انبار مرکزی',
      status: 'active',
      featured: true,
      rating: 4.8,
      reviewCount: 15,
      discountPercent: 16,
      images: ['/uploads/products/sample-switch-1.webp'],
      features: [
        {
          title: 'پورت‌های شبکه',
          description: '۲۴ پورت گیگابیت اترنت',
          iconName: 'network',
          sortOrder: 0,
        },
      ],
    };

    const res = await request(app.getHttpServer())
      .post('/api/v1/products')
      .send(payload)
      .expect(201);

    expect(res.body).toHaveProperty('id');
    expect(res.body.sku).toBe(payload.sku);
    expect(res.body.reservedStock).toBe(3);
    expect(res.body.rating).toBe(4.8);
    expect(res.body.reviewCount).toBe(15);
  });
});
