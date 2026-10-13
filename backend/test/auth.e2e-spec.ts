import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { AppModule } from '../src/app.module.js';
import { DomainExceptionFilter } from '../src/presentation/filters/domain-exception.filter.js';

describe('Auth API (e2e)', () => {
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

  it('POST /api/v1/auth/otp/request - requests OTP with valid phone number', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/auth/otp/request')
      .send({ phone: '09121111111' })
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.challengeTicket).toBeDefined();
    expect(res.body.maskedPhone).toBeDefined();
    expect(res.body.expiresInSeconds).toBe(120);
  });

  it('POST /api/v1/auth/otp/request - rejects invalid phone format with 400 Bad Request', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/auth/otp/request')
      .send({ phone: '02112345678' })
      .expect(400);

    expect(res.body.error).toBe('InvalidPhoneNumber');
  });

  it('POST /api/v1/auth/otp/verify - verifies code and sets HttpOnly session cookie', async () => {
    // 1. Request OTP
    const reqRes = await request(app.getHttpServer())
      .post('/api/v1/auth/otp/request')
      .send({ phone: '09121111111' })
      .expect(200);

    const ticket = reqRes.body.challengeTicket;
    const devCode = reqRes.body.devCode;

    // 2. Verify OTP
    const verifyRes = await request(app.getHttpServer())
      .post('/api/v1/auth/otp/verify')
      .send({
        challengeTicket: ticket,
        code: devCode,
      })
      .expect(200);

    expect(verifyRes.body.success).toBe(true);
    expect(verifyRes.body.requiresTwoFactor).toBe(false);
    expect(verifyRes.body.session).toBeDefined();
    expect(verifyRes.body.session.accessToken).toBeDefined();

    // Check Set-Cookie header
    const cookies = verifyRes.headers['set-cookie'];
    expect(cookies).toBeDefined();
    expect(cookies[0]).toContain('velox_session_token=');
    expect(cookies[0]).toContain('HttpOnly');

    const accessToken = verifyRes.body.session.accessToken;

    // 3. GET /api/v1/auth/me with Bearer token
    const meRes = await request(app.getHttpServer())
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(meRes.body.user).toBeDefined();
    expect(meRes.body.user.phone).toBe('09121111111');

    // 4. GET /api/v1/auth/me with Cookie
    const cookieHeader = cookies[0].split(';')[0];
    const meCookieRes = await request(app.getHttpServer())
      .get('/api/v1/auth/me')
      .set('Cookie', cookieHeader)
      .expect(200);

    expect(meCookieRes.body.user.id).toBe(meRes.body.user.id);
  });

  it('POST /api/v1/auth/otp/verify - rejects wrong OTP code with 400 Bad Request', async () => {
    const reqRes = await request(app.getHttpServer())
      .post('/api/v1/auth/otp/request')
      .send({ phone: '09121111111' })
      .expect(200);

    const res = await request(app.getHttpServer())
      .post('/api/v1/auth/otp/verify')
      .send({
        challengeTicket: reqRes.body.challengeTicket,
        code: '99999',
      })
      .expect(400);

    expect(res.body.error).toBe('OtpInvalid');
  });

  it('POST /api/v1/auth/otp/verify - transitions to 2FA step for accounts with 2FA enabled', async () => {
    // 09122222222 has twoFactorEnabled: true in seed
    const reqRes = await request(app.getHttpServer())
      .post('/api/v1/auth/otp/request')
      .send({ phone: '09122222222' })
      .expect(200);

    expect(reqRes.body.hasTwoFactor).toBe(true);

    const verifyOtpRes = await request(app.getHttpServer())
      .post('/api/v1/auth/otp/verify')
      .send({
        challengeTicket: reqRes.body.challengeTicket,
        code: reqRes.body.devCode,
      })
      .expect(200);

    expect(verifyOtpRes.body.requiresTwoFactor).toBe(true);
    expect(verifyOtpRes.body.twoFactorTicket).toBeDefined();

    const twoFactorTicket = verifyOtpRes.body.twoFactorTicket;

    // Fail 2FA with incorrect code
    await request(app.getHttpServer())
      .post('/api/v1/auth/2fa/verify')
      .send({
        twoFactorTicket,
        codeOrPassword: 'wrong',
      })
      .expect(400);

    // Pass 2FA with seeded PIN: 123456
    const verify2FARes = await request(app.getHttpServer())
      .post('/api/v1/auth/2fa/verify')
      .send({
        twoFactorTicket,
        codeOrPassword: '123456',
      })
      .expect(200);

    expect(verify2FARes.body.success).toBe(true);
    expect(verify2FARes.body.session).toBeDefined();
    expect(verify2FARes.body.session.user.twoFactorEnabled).toBe(true);
  });

  it('GET /api/v1/auth/me - returns 401 Unauthorized when unauthenticated', async () => {
    await request(app.getHttpServer())
      .get('/api/v1/auth/me')
      .expect(401);
  });

  it('POST /api/v1/auth/logout - clears cookie and invalidates session', async () => {
    const reqRes = await request(app.getHttpServer())
      .post('/api/v1/auth/otp/request')
      .send({ phone: '09121111111' })
      .expect(200);

    const verifyRes = await request(app.getHttpServer())
      .post('/api/v1/auth/otp/verify')
      .send({
        challengeTicket: reqRes.body.challengeTicket,
        code: reqRes.body.devCode,
      })
      .expect(200);

    const logoutRes = await request(app.getHttpServer())
      .post('/api/v1/auth/logout')
      .send({ refreshToken: verifyRes.body.session.refreshToken })
      .expect(200);

    expect(logoutRes.body.success).toBe(true);
    const cookies = logoutRes.headers['set-cookie'];
    expect(cookies[0]).toContain('velox_session_token=;');
  });
});
