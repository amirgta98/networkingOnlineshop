import { describe, it, expect, beforeEach } from 'vitest';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '../../src/presentation/guards/auth.guard.js';
import { OptionalAuthGuard } from '../../src/presentation/guards/optional-auth.guard.js';
import { JwtSessionService } from '../../src/infrastructure/auth/jwt-session.service.js';

describe('AuthGuard & OptionalAuthGuard Security & Signature Verification', () => {
  let jwtSessionService: JwtSessionService;
  let authGuard: AuthGuard;
  let optionalAuthGuard: OptionalAuthGuard;

  beforeEach(() => {
    jwtSessionService = new JwtSessionService();
    authGuard = new AuthGuard(jwtSessionService);
    optionalAuthGuard = new OptionalAuthGuard(jwtSessionService);
  });

  const createMockContext = (headers: Record<string, string> = {}) => {
    const request: any = {
      headers,
    };
    const context: Partial<ExecutionContext> = {
      switchToHttp: () => ({
        getRequest: () => request,
        getResponse: () => ({}),
        getNext: () => ({}),
      }),
    };
    return { context: context as ExecutionContext, request };
  };

  const createForgedToken = (payloadObj: any) => {
    const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
    const payload = Buffer.from(JSON.stringify(payloadObj)).toString('base64url');
    const invalidSignature = 'invalid_tampered_signature_abc123';
    return `${header}.${payload}.${invalidSignature}`;
  };

  describe('AuthGuard', () => {
    it('throws UnauthorizedException when no token is provided', () => {
      const { context } = createMockContext();
      expect(() => authGuard.canActivate(context)).toThrow(UnauthorizedException);
      expect(() => authGuard.canActivate(context)).toThrow('لطفاً ابتدا وارد حساب کاربری خود شوید.');
    });

    it('successfully validates a cryptographically signed token via Bearer header', () => {
      const tokens = jwtSessionService.generateTokens('user-uuid-1', 'admin', '09121112233');
      const { context, request } = createMockContext({
        authorization: `Bearer ${tokens.accessToken}`,
      });

      const result = authGuard.canActivate(context);
      expect(result).toBe(true);
      expect(request.user).toBeDefined();
      expect(request.user.sub).toBe('user-uuid-1');
      expect(request.user.role).toBe('admin');
      expect(request.user.phone).toBe('09121112233');
    });

    it('successfully validates a cryptographically signed token via velox_session_token cookie', () => {
      const tokens = jwtSessionService.generateTokens('user-uuid-2', 'customer', '09123334455');
      const { context, request } = createMockContext({
        cookie: `velox_session_token=${tokens.accessToken}; Path=/; HttpOnly`,
      });

      const result = authGuard.canActivate(context);
      expect(result).toBe(true);
      expect(request.user).toBeDefined();
      expect(request.user.sub).toBe('user-uuid-2');
      expect(request.user.role).toBe('customer');
      expect(request.user.phone).toBe('09123334455');
    });

    it('successfully validates a cryptographically signed token via access_token cookie', () => {
      const tokens = jwtSessionService.generateTokens('user-uuid-3', 'partner', '09125556677');
      const { context, request } = createMockContext({
        cookie: `access_token=${tokens.accessToken}`,
      });

      const result = authGuard.canActivate(context);
      expect(result).toBe(true);
      expect(request.user).toBeDefined();
      expect(request.user.sub).toBe('user-uuid-3');
      expect(request.user.role).toBe('partner');
    });

    it('REJECTS forged JWT with base64 payload pretending to be superadmin (signature bypass attempt)', () => {
      const forgedPayload = {
        sub: '00000000-0000-4000-a000-000000000001',
        role: 'super_admin',
        phone: '09162947221',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 86400,
      };
      const forgedToken = createForgedToken(forgedPayload);
      const { context, request } = createMockContext({
        authorization: `Bearer ${forgedToken}`,
      });

      expect(() => authGuard.canActivate(context)).toThrow(UnauthorizedException);
      expect(() => authGuard.canActivate(context)).toThrow('توکن احراز هویت نامعتبر یا منقضی شده است.');
      expect(request.user).toBeUndefined();
    });

    it('REJECTS backdoor mock tokens (mock_, admin-token, etc.)', () => {
      const backdoorTokens = [
        'admin-token',
        'mock_admin',
        'mock_customer',
        'mock_partner_09162947222',
        'some_mock_token_with_words',
      ];

      for (const token of backdoorTokens) {
        const { context, request } = createMockContext({
          authorization: `Bearer ${token}`,
        });

        expect(() => authGuard.canActivate(context)).toThrow(UnauthorizedException);
        expect(() => authGuard.canActivate(context)).toThrow('توکن احراز هویت نامعتبر یا منقضی شده است.');
        expect(request.user).toBeUndefined();
      }
    });

    it('REJECTS garbage or malformed token strings', () => {
      const malformedTokens = [
        'invalid.jwt',
        'not-even-a-jwt',
        'a.b',
        'a.b.c.d',
      ];

      for (const token of malformedTokens) {
        const { context, request } = createMockContext({
          authorization: `Bearer ${token}`,
        });

        expect(() => authGuard.canActivate(context)).toThrow(UnauthorizedException);
        expect(() => authGuard.canActivate(context)).toThrow('توکن احراز هویت نامعتبر یا منقضی شده است.');
        expect(request.user).toBeUndefined();
      }
    });

    it('REJECTS expired tokens', () => {
      // Craft expired token signed with secret
      const secret = jwtSessionService.getSecret();
      const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
      const expiredPayload = {
        sub: 'user-uuid-expired',
        role: 'customer',
        phone: '09121111111',
        iat: Math.floor(Date.now() / 1000) - 7200,
        exp: Math.floor(Date.now() / 1000) - 3600, // expired 1 hour ago
      };
      const payload = Buffer.from(JSON.stringify(expiredPayload)).toString('base64url');
      const crypto = require('node:crypto');
      const signature = crypto.createHmac('sha256', secret).update(`${header}.${payload}`).digest('base64url');
      const expiredToken = `${header}.${payload}.${signature}`;

      const { context, request } = createMockContext({
        authorization: `Bearer ${expiredToken}`,
      });

      expect(() => authGuard.canActivate(context)).toThrow(UnauthorizedException);
      expect(() => authGuard.canActivate(context)).toThrow('توکن احراز هویت نامعتبر یا منقضی شده است.');
      expect(request.user).toBeUndefined();
    });

    it('authenticates internal webhook request when valid secret header is provided', () => {
      process.env.INTERNAL_WEBHOOK_SECRET = 'super-secret-webhook-key-12345';
      const { context, request } = createMockContext({
        'x-webhook-secret': 'super-secret-webhook-key-12345',
      });

      const result = authGuard.canActivate(context);
      expect(result).toBe(true);
      expect(request.user).toBeDefined();
      expect(request.user.role).toBe('admin');
      expect(request.user.sub).toBe('internal-webhook-service');
      delete process.env.INTERNAL_WEBHOOK_SECRET;
    });

    it('rejects internal webhook request when secret header is incorrect', () => {
      process.env.INTERNAL_WEBHOOK_SECRET = 'super-secret-webhook-key-12345';
      const { context } = createMockContext({
        'x-webhook-secret': 'wrong-secret',
      });

      expect(() => authGuard.canActivate(context)).toThrow(UnauthorizedException);
      delete process.env.INTERNAL_WEBHOOK_SECRET;
    });
  });

  describe('OptionalAuthGuard', () => {
    it('returns true and does not attach user when no token is present', () => {
      const { context, request } = createMockContext();
      const result = optionalAuthGuard.canActivate(context);
      expect(result).toBe(true);
      expect(request.user).toBeUndefined();
    });

    it('attaches verified user payload when a valid token is provided', () => {
      const tokens = jwtSessionService.generateTokens('user-optional-1', 'customer', '09129998877');
      const { context, request } = createMockContext({
        authorization: `Bearer ${tokens.accessToken}`,
      });

      const result = optionalAuthGuard.canActivate(context);
      expect(result).toBe(true);
      expect(request.user).toBeDefined();
      expect(request.user.sub).toBe('user-optional-1');
      expect(request.user.role).toBe('customer');
    });

    it('does NOT attach user when token signature is forged or invalid (proceeds as anonymous)', () => {
      const forgedPayload = {
        sub: '00000000-0000-4000-a000-000000000001',
        role: 'admin',
        phone: '09162947221',
      };
      const forgedToken = createForgedToken(forgedPayload);
      const { context, request } = createMockContext({
        authorization: `Bearer ${forgedToken}`,
      });

      const result = optionalAuthGuard.canActivate(context);
      expect(result).toBe(true);
      expect(request.user).toBeUndefined();
    });

    it('does NOT attach user for backdoor mock tokens (proceeds as anonymous)', () => {
      const backdoorTokens = ['mock_admin', 'admin-token', 'mock_partner'];
      for (const token of backdoorTokens) {
        const { context, request } = createMockContext({
          authorization: `Bearer ${token}`,
        });

        const result = optionalAuthGuard.canActivate(context);
        expect(result).toBe(true);
        expect(request.user).toBeUndefined();
      }
    });

    it('does NOT attach user for malformed tokens', () => {
      const { context, request } = createMockContext({
        authorization: 'Bearer bad.token',
      });

      const result = optionalAuthGuard.canActivate(context);
      expect(result).toBe(true);
      expect(request.user).toBeUndefined();
    });
  });
});
