import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { AppModule } from '../src/app.module.js';
import { DomainExceptionFilter } from '../src/presentation/filters/domain-exception.filter.js';

describe('Users API (e2e)', () => {
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

  it('POST /api/v1/users - creates a new user', async () => {
    const payload = {
      email: 'john.smith@example.com',
      name: 'John Smith',
    };

    const response = await request(app.getHttpServer())
      .post('/api/v1/users')
      .send(payload)
      .expect(201);

    expect(response.body).toHaveProperty('id');
    expect(response.body.email).toBe(payload.email);
    expect(response.body.name).toBe(payload.name);
    expect(response.body.isActive).toBe(true);

    // Fetch the created user by ID
    const getResponse = await request(app.getHttpServer())
      .get(`/api/v1/users/${response.body.id}`)
      .expect(200);

    expect(getResponse.body.id).toBe(response.body.id);
    expect(getResponse.body.email).toBe(payload.email);
  });

  it('POST /api/v1/users - returns 409 Conflict on duplicate email', async () => {
    const payload = {
      email: 'unique@example.com',
      name: 'Initial User',
    };

    // First creation
    await request(app.getHttpServer())
      .post('/api/v1/users')
      .send(payload)
      .expect(201);

    // Duplicate creation
    const res = await request(app.getHttpServer())
      .post('/api/v1/users')
      .send(payload)
      .expect(409);

    expect(res.body.error).toBe('UserAlreadyExists');
  });

  it('POST /api/v1/users - returns 400 Bad Request on invalid input', async () => {
    const invalidPayload = {
      email: 'not-an-email',
      name: '',
    };

    const res = await request(app.getHttpServer())
      .post('/api/v1/users')
      .send(invalidPayload)
      .expect(400);

    expect(res.body.message).toBeDefined();
  });

  it('GET /api/v1/users/:id - returns 404 Not Found for non-existing user', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/users/non-existent-id')
      .expect(404);

    expect(res.body.error).toBe('UserNotFound');
  });

  it('GET /api/v1/users - returns full list of users with filtering support', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/users')
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);

    // Test query filter by role
    const filteredRes = await request(app.getHttpServer())
      .get('/api/v1/users?role=customer')
      .expect(200);

    expect(Array.isArray(filteredRes.body)).toBe(true);
    expect(filteredRes.body.every((u: any) => u.role === 'customer')).toBe(true);
  });

  it('Admin User Management Lifecycle: create, update details, change role, change status, and delete', async () => {
    // 1. Create
    const createRes = await request(app.getHttpServer())
      .post('/api/v1/users')
      .send({
        name: 'رضا کمالی',
        email: 'kamali@fonix-test.ir',
        phone: '09128887766',
        role: 'customer',
        status: 'active',
        companyName: 'شرکت کمالی',
      })
      .expect(201);

    const userId = createRes.body.id;
    expect(userId).toBeDefined();
    expect(createRes.body.fullName).toBe('رضا کمالی');
    expect(createRes.body.phone).toBe('09128887766');

    // 2. Update Role to partner_b2b
    const roleRes = await request(app.getHttpServer())
      .patch(`/api/v1/users/${userId}/role`)
      .send({ role: 'partner_b2b' })
      .expect(200);

    expect(roleRes.body.role).toBe('partner_b2b');

    // 3. Update Status to suspended
    const statusRes = await request(app.getHttpServer())
      .patch(`/api/v1/users/${userId}/status`)
      .send({ status: 'suspended' })
      .expect(200);

    expect(statusRes.body.status).toBe('suspended');

    // 4. Update Profile Details (using fullName)
    const updateRes = await request(app.getHttpServer())
      .put(`/api/v1/users/${userId}`)
      .send({
        fullName: 'رضا کمالی تبریزی',
        companyName: 'شرکت فناوری کمالی',
        userTier: 'silver',
      })
      .expect(200);

    expect(updateRes.body.fullName).toBe('رضا کمالی تبریزی');
    expect(updateRes.body.companyName).toBe('شرکت فناوری کمالی');
    expect(updateRes.body.userTier).toBe('silver');

    // 5. Delete User
    const delRes = await request(app.getHttpServer())
      .delete(`/api/v1/users/${userId}`)
      .expect(200);

    expect(delRes.body.success).toBe(true);

    // 6. Confirm 404 after deletion
    await request(app.getHttpServer())
      .get(`/api/v1/users/${userId}`)
      .expect(404);
  });
});
