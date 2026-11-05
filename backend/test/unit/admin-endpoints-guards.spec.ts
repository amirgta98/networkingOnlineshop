import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { ProductController } from '../../src/presentation/controllers/product.controller.js';
import { SecurityController } from '../../src/presentation/controllers/security.controller.js';
import { CategoryController } from '../../src/presentation/controllers/category.controller.js';
import { SpecialOffersController } from '../../src/presentation/controllers/special-offers.controller.js';
import { InstallationCalculatorController } from '../../src/presentation/controllers/installation-calculator.controller.js';
import { JwtSessionService } from '../../src/infrastructure/auth/jwt-session.service.js';
import { AuthGuard } from '../../src/presentation/guards/auth.guard.js';
import { RolesGuard } from '../../src/presentation/guards/roles.guard.js';
import { CreateProductUseCase } from '../../src/application/use-cases/product/create-product.use-case.js';
import { GetProductsUseCase } from '../../src/application/use-cases/product/get-products.use-case.js';
import { GetProductByIdUseCase } from '../../src/application/use-cases/product/get-product-by-id.use-case.js';
import { UpdateProductUseCase } from '../../src/application/use-cases/product/update-product.use-case.js';
import { DeleteProductUseCase } from '../../src/application/use-cases/product/delete-product.use-case.js';
import { UpdateProductStockUseCase } from '../../src/application/use-cases/product/update-product-stock.use-case.js';
import { BulkUpdateProductStatusUseCase } from '../../src/application/use-cases/product/bulk-update-product-status.use-case.js';
import { BulkDeleteProductsUseCase } from '../../src/application/use-cases/product/bulk-delete-products.use-case.js';
import { IMAGE_PROCESSING_SERVICE_TOKEN } from '../../src/shared/constants/tokens.js';
import { SecurityMonitorService } from '../../src/infrastructure/services/security-monitor.service.js';
import { SecurityGateway } from '../../src/presentation/gateways/security.gateway.js';
import { CreateCategoryUseCase } from '../../src/application/use-cases/category/create-category.use-case.js';
import { GetCategoriesUseCase } from '../../src/application/use-cases/category/get-categories.use-case.js';
import { GetCategoryByIdUseCase } from '../../src/application/use-cases/category/get-category-by-id.use-case.js';
import { UpdateCategoryUseCase } from '../../src/application/use-cases/category/update-category.use-case.js';
import { DeleteCategoryUseCase } from '../../src/application/use-cases/category/delete-category.use-case.js';
import { CreateSpecialOfferUseCase } from '../../src/application/use-cases/special-offer/create-special-offer.use-case.js';
import { GetSpecialOffersUseCase } from '../../src/application/use-cases/special-offer/get-special-offers.use-case.js';
import { GetActiveSpecialOfferUseCase } from '../../src/application/use-cases/special-offer/get-active-special-offer.use-case.js';
import { GetSpecialOfferByIdUseCase } from '../../src/application/use-cases/special-offer/get-special-offer-by-id.use-case.js';
import { UpdateSpecialOfferUseCase } from '../../src/application/use-cases/special-offer/update-special-offer.use-case.js';
import { UpdateSpecialOfferStatusUseCase } from '../../src/application/use-cases/special-offer/update-special-offer-status.use-case.js';
import { DeleteSpecialOfferUseCase } from '../../src/application/use-cases/special-offer/delete-special-offer.use-case.js';
import { GetDiscountedProductsUseCase } from '../../src/application/use-cases/special-offer/get-discounted-products.use-case.js';
import { StopActiveSpecialOfferUseCase } from '../../src/application/use-cases/special-offer/stop-active-special-offer.use-case.js';
import { InstallationCalculatorService } from '../../src/application/services/installation-calculator.service.js';

describe('Admin Endpoints AuthGuard & RolesGuard Verification', () => {
  let app: INestApplication;
  let jwtSessionService: JwtSessionService;
  let adminToken: string;
  let superAdminToken: string;
  let storeManagerToken: string;
  let customerToken: string;

  const mockSecurityService = {
    getOverview: vi.fn().mockResolvedValue({ status: 'HEALTHY' }),
    getTelemetrySnapshot: vi.fn().mockResolvedValue({ switches: [] }),
    getAuditLogs: vi.fn().mockResolvedValue([]),
    getActiveSessions: vi.fn().mockResolvedValue([]),
    revokeSession: vi.fn().mockResolvedValue({ success: true, message: 'Session revoked' }),
    emergencyKillAllSessions: vi.fn().mockResolvedValue({ success: true, revokedCount: 5, message: 'Killed' }),
    toggleUnderAttackMode: vi.fn().mockReturnValue({ underAttackMode: true }),
    blockIpAddress: vi.fn().mockReturnValue({ success: true, message: 'Blocked' }),
  };

  const mockSecurityGateway = {
    broadcastSessionRevoked: vi.fn(),
    broadcastEmergencyLogout: vi.fn(),
    broadcastWafChange: vi.fn(),
  };

  const mockProductUseCase = {
    execute: vi.fn().mockResolvedValue({ id: 'prod-1', name: 'Test Product' }),
  };

  const mockImageProcessingService = {
    processAndSaveProductImage: vi.fn().mockResolvedValue({ url: '/uploads/products/test.webp' }),
    processAndSaveFeatureIcon: vi.fn().mockResolvedValue({ url: '/uploads/icons/test.svg' }),
    deleteProductImage: vi.fn().mockResolvedValue(true),
    deleteFeatureIcon: vi.fn().mockResolvedValue(true),
  };

  const mockCategoryUseCase = {
    execute: vi.fn().mockResolvedValue({
      toJSON: () => ({ id: 'cat-1', name: 'Switches', createdAt: new Date(), updatedAt: new Date() }),
    }),
  };

  const mockSpecialOffer = {
    items: [],
    getAvailableItems: () => [],
    toJSON: () => ({
      id: 'offer-1',
      title: 'Summer Sale',
      status: 'ACTIVE',
      startDate: new Date(),
      endDate: new Date(),
      products: [],
    }),
  };

  const mockSpecialOfferUseCase = {
    execute: vi.fn().mockResolvedValue(mockSpecialOffer),
  };

  const mockCalculatorService = {
    getPublicConfig: vi.fn().mockResolvedValue({ items: [], settings: {} }),
    getAdminConfig: vi.fn().mockResolvedValue({ items: [], settings: {} }),
    updateSettings: vi.fn().mockResolvedValue({ success: true }),
    createItem: vi.fn().mockResolvedValue({ id: 'item-1' }),
    updateItem: vi.fn().mockResolvedValue({ id: 'item-1' }),
    deleteItem: vi.fn().mockResolvedValue({ success: true }),
    reorderItems: vi.fn().mockResolvedValue({ success: true }),
    resetToDefaults: vi.fn().mockResolvedValue({ success: true }),
    searchStoreProducts: vi.fn().mockResolvedValue([]),
  };

  beforeAll(async () => {
    jwtSessionService = new JwtSessionService();
    adminToken = jwtSessionService.generateTokens('admin-1', 'admin', '09121111111').accessToken;
    superAdminToken = jwtSessionService.generateTokens('super-1', 'super_admin', '09122222222').accessToken;
    storeManagerToken = jwtSessionService.generateTokens('sm-1', 'store_manager', '09123333333').accessToken;
    customerToken = jwtSessionService.generateTokens('cust-1', 'customer', '09124444444').accessToken;

    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [
        ProductController,
        SecurityController,
        CategoryController,
        SpecialOffersController,
        InstallationCalculatorController,
      ],
      providers: [
        JwtSessionService,
        AuthGuard,
        RolesGuard,
        { provide: CreateProductUseCase, useValue: mockProductUseCase },
        { provide: GetProductsUseCase, useValue: { execute: vi.fn().mockResolvedValue({ products: [], total: 0 }) } },
        { provide: GetProductByIdUseCase, useValue: mockProductUseCase },
        { provide: UpdateProductUseCase, useValue: mockProductUseCase },
        { provide: DeleteProductUseCase, useValue: { execute: vi.fn().mockResolvedValue({ success: true, id: 'prod-1' }) } },
        { provide: UpdateProductStockUseCase, useValue: mockProductUseCase },
        { provide: BulkUpdateProductStatusUseCase, useValue: mockProductUseCase },
        { provide: BulkDeleteProductsUseCase, useValue: mockProductUseCase },
        { provide: IMAGE_PROCESSING_SERVICE_TOKEN, useValue: mockImageProcessingService },
        { provide: SecurityMonitorService, useValue: mockSecurityService },
        { provide: SecurityGateway, useValue: mockSecurityGateway },
        { provide: CreateCategoryUseCase, useValue: mockCategoryUseCase },
        { provide: GetCategoriesUseCase, useValue: { execute: vi.fn().mockResolvedValue([]) } },
        { provide: GetCategoryByIdUseCase, useValue: mockCategoryUseCase },
        { provide: UpdateCategoryUseCase, useValue: mockCategoryUseCase },
        { provide: DeleteCategoryUseCase, useValue: { execute: vi.fn().mockResolvedValue(true) } },
        { provide: CreateSpecialOfferUseCase, useValue: mockSpecialOfferUseCase },
        { provide: GetSpecialOffersUseCase, useValue: { execute: vi.fn().mockResolvedValue([]) } },
        { provide: GetActiveSpecialOfferUseCase, useValue: { execute: vi.fn().mockResolvedValue(null) } },
        { provide: GetSpecialOfferByIdUseCase, useValue: mockSpecialOfferUseCase },
        { provide: UpdateSpecialOfferUseCase, useValue: mockSpecialOfferUseCase },
        { provide: UpdateSpecialOfferStatusUseCase, useValue: mockSpecialOfferUseCase },
        { provide: DeleteSpecialOfferUseCase, useValue: { execute: vi.fn().mockResolvedValue({ success: true, message: 'Deleted' }) } },
        { provide: GetDiscountedProductsUseCase, useValue: { execute: vi.fn().mockResolvedValue([]) } },
        { provide: StopActiveSpecialOfferUseCase, useValue: { execute: vi.fn().mockResolvedValue({ success: true, message: 'Stopped' }) } },
        { provide: InstallationCalculatorService, useValue: mockCalculatorService },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  // ─────────────────────────────────────────────────────────────
  // 1. SecurityController Verification
  // ─────────────────────────────────────────────────────────────
  describe('SecurityController', () => {
    it('rejects unauthenticated POST /api/v1/security/sessions/emergency-kill with 401', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/security/sessions/emergency-kill')
        .send({ reason: 'DDoS attack test' })
        .expect(401);
    });

    it('rejects unauthenticated overview, telemetry, audit-logs, sessions, and firewall endpoints with 401', async () => {
      await request(app.getHttpServer()).get('/api/v1/security/overview').expect(401);
      await request(app.getHttpServer()).get('/api/v1/security/telemetry').expect(401);
      await request(app.getHttpServer()).get('/api/v1/security/audit-logs').expect(401);
      await request(app.getHttpServer()).get('/api/v1/security/sessions').expect(401);
      await request(app.getHttpServer()).delete('/api/v1/security/sessions/sess-123').expect(401);
      await request(app.getHttpServer()).post('/api/v1/security/waf/toggle').send({ enabled: true }).expect(401);
      await request(app.getHttpServer()).post('/api/v1/security/firewall/block-ip').send({ ip: '1.2.3.4' }).expect(401);
    });

    it('rejects customer and store_manager roles with 403 Forbidden', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/security/sessions/emergency-kill')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ reason: 'test' })
        .expect(403);

      await request(app.getHttpServer())
        .post('/api/v1/security/sessions/emergency-kill')
        .set('Authorization', `Bearer ${storeManagerToken}`)
        .send({ reason: 'test' })
        .expect(403);
    });

    it('allows admin and extracts operator info from req.user (not hardcoded عرفان سعیدی)', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/security/sessions/emergency-kill')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ reason: 'Security drill' })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(mockSecurityService.emergencyKillAllSessions).toHaveBeenCalledWith(
        expect.objectContaining({
          actor: expect.stringContaining('09121111111'),
          reason: 'Security drill',
        }),
      );
      // Verify gateway broadcast used the authenticated phone
      expect(mockSecurityGateway.broadcastEmergencyLogout).toHaveBeenCalledWith(
        expect.objectContaining({
          triggeredBy: expect.stringContaining('09121111111'),
        }),
      );
    });

    it('allows blockIp and extracts operator info from req.user', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/security/firewall/block-ip')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ ip: '192.168.1.100', reason: 'Brute force' })
        .expect(200);

      expect(mockSecurityService.blockIpAddress).toHaveBeenCalledWith(
        '192.168.1.100',
        'Brute force',
        '09121111111',
      );
    });
  });

  // ─────────────────────────────────────────────────────────────
  // 2. ProductController Verification
  // ─────────────────────────────────────────────────────────────
  describe('ProductController', () => {
    it('keeps GET /api/v1/products and GET /api/v1/products/:id public', async () => {
      await request(app.getHttpServer()).get('/api/v1/products').expect(200);
      await request(app.getHttpServer()).get('/api/v1/products/prod-1').expect(200);
    });

    it('rejects unauthenticated POST, PUT, DELETE, and PATCH /products with 401', async () => {
      await request(app.getHttpServer()).post('/api/v1/products').send({ name: 'Switch' }).expect(401);
      await request(app.getHttpServer()).put('/api/v1/products/prod-1').send({ name: 'Switch 2' }).expect(401);
      await request(app.getHttpServer()).delete('/api/v1/products/prod-1').expect(401);
      await request(app.getHttpServer()).patch('/api/v1/products/prod-1/stock').send({ stock: 5 }).expect(401);
      await request(app.getHttpServer()).patch('/api/v1/products/prod-1/images').send({ images: [] }).expect(401);
      await request(app.getHttpServer()).post('/api/v1/products/upload-images').expect(401);
      await request(app.getHttpServer()).post('/api/v1/products/upload-icon').expect(401);
      await request(app.getHttpServer()).delete('/api/v1/products/images/test.webp').expect(401);
      await request(app.getHttpServer()).delete('/api/v1/products/icons/test.svg').expect(401);
    });

    it('rejects regular customer role with 403 Forbidden', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/products')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ name: 'Switch' })
        .expect(403);
    });

    it('allows store_manager, admin, and super_admin', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/products')
        .set('Authorization', `Bearer ${storeManagerToken}`)
        .send({ name: 'Switch' })
        .expect(201);

      await request(app.getHttpServer())
        .put('/api/v1/products/prod-1')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Updated Switch' })
        .expect(200);

      await request(app.getHttpServer())
        .delete('/api/v1/products/prod-1')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .expect(200);
    });
  });

  // ─────────────────────────────────────────────────────────────
  // 3. CategoryController Verification
  // ─────────────────────────────────────────────────────────────
  describe('CategoryController', () => {
    it('keeps GET /api/v1/categories and GET /api/v1/categories/:id public', async () => {
      await request(app.getHttpServer()).get('/api/v1/categories').expect(200);
      await request(app.getHttpServer()).get('/api/v1/categories/cat-1').expect(200);
    });

    it('rejects unauthenticated POST, PUT, DELETE /api/v1/categories with 401', async () => {
      await request(app.getHttpServer()).post('/api/v1/categories').send({ shortName: 'Switches' }).expect(401);
      await request(app.getHttpServer()).put('/api/v1/categories/cat-1').send({ shortName: 'Switches' }).expect(401);
      await request(app.getHttpServer()).delete('/api/v1/categories/cat-1').expect(401);
    });

    it('rejects customer with 403 Forbidden', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/categories')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ shortName: 'Routers' })
        .expect(403);
    });

    it('allows admin and super_admin to create/edit/delete categories', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/categories')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ shortName: 'Routers' })
        .expect(201);

      await request(app.getHttpServer())
        .put('/api/v1/categories/cat-1')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({ shortName: 'Routers v2' })
        .expect(200);

      await request(app.getHttpServer())
        .delete('/api/v1/categories/cat-1')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
    });
  });

  // ─────────────────────────────────────────────────────────────
  // 4. SpecialOffersController Verification
  // ─────────────────────────────────────────────────────────────
  describe('SpecialOffersController', () => {
    it('keeps public queries open (GET /, GET /discounted-products, GET /active, GET /:id)', async () => {
      await request(app.getHttpServer()).get('/api/v1/special-offers').expect(200);
      await request(app.getHttpServer()).get('/api/v1/special-offers/discounted-products').expect(200);
      await request(app.getHttpServer()).get('/api/v1/special-offers/active').expect(200);
      await request(app.getHttpServer()).get('/api/v1/special-offers/offer-1').expect(200);
    });

    it('rejects unauthenticated mutating routes with 401', async () => {
      await request(app.getHttpServer()).post('/api/v1/special-offers/stop-active').expect(401);
      await request(app.getHttpServer()).post('/api/v1/special-offers/offer-1/activate').expect(401);
      await request(app.getHttpServer()).post('/api/v1/special-offers').send({ title: 'New Deal' }).expect(401);
      await request(app.getHttpServer()).put('/api/v1/special-offers/offer-1').send({ title: 'Edit Deal' }).expect(401);
      await request(app.getHttpServer()).patch('/api/v1/special-offers/offer-1/status').send({ status: 'ACTIVE' }).expect(401);
      await request(app.getHttpServer()).delete('/api/v1/special-offers/offer-1').expect(401);
    });

    it('rejects customer with 403 Forbidden', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/special-offers/stop-active')
        .set('Authorization', `Bearer ${customerToken}`)
        .expect(403);
    });

    it('allows admin and super_admin on mutating routes', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/special-offers/stop-active')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      await request(app.getHttpServer())
        .post('/api/v1/special-offers/offer-1/activate')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .expect(200);

      await request(app.getHttpServer())
        .delete('/api/v1/special-offers/offer-1')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
    });
  });

  // ─────────────────────────────────────────────────────────────
  // 5. InstallationCalculatorController Verification
  // ─────────────────────────────────────────────────────────────
  describe('InstallationCalculatorController', () => {
    it('keeps GET /api/v1/installation/calculator/config public', async () => {
      await request(app.getHttpServer()).get('/api/v1/installation/calculator/config').expect(200);
    });

    it('rejects all unauthenticated admin/calculator/* routes with 401', async () => {
      await request(app.getHttpServer()).get('/api/v1/installation/admin/calculator/items').expect(401);
      await request(app.getHttpServer()).get('/api/v1/installation/admin/calculator/settings').expect(401);
      await request(app.getHttpServer()).put('/api/v1/installation/admin/calculator/settings').send({}).expect(401);
      await request(app.getHttpServer()).post('/api/v1/installation/admin/calculator/items').send({}).expect(401);
      await request(app.getHttpServer()).put('/api/v1/installation/admin/calculator/items/item-1').send({}).expect(401);
      await request(app.getHttpServer()).delete('/api/v1/installation/admin/calculator/items/item-1').expect(401);
      await request(app.getHttpServer()).patch('/api/v1/installation/admin/calculator/items/reorder').send({}).expect(401);
      await request(app.getHttpServer()).post('/api/v1/installation/admin/calculator/reset').expect(401);
      await request(app.getHttpServer()).get('/api/v1/installation/admin/calculator/search-products').expect(401);
    });

    it('rejects customer role on admin/calculator/* routes with 403 Forbidden', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/installation/admin/calculator/items')
        .set('Authorization', `Bearer ${customerToken}`)
        .expect(403);
    });

    it('allows admin and super_admin on admin/calculator/* routes', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/installation/admin/calculator/items')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      await request(app.getHttpServer())
        .post('/api/v1/installation/admin/calculator/reset')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .expect(200);
    });
  });
});
