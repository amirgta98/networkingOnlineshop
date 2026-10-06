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
});
