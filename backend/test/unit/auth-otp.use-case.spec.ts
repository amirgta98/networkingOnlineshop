import { describe, it, expect, beforeEach } from 'vitest';
import { RequestOtpUseCase } from '../../src/application/use-cases/auth/request-otp.use-case.js';
import { VerifyOtpUseCase } from '../../src/application/use-cases/auth/verify-otp.use-case.js';
import { VerifyTwoFactorUseCase } from '../../src/application/use-cases/auth/verify-two-factor.use-case.js';
import { InMemoryAuthOtpChallengeRepository } from '../../src/infrastructure/database/in-memory/in-memory-auth-otp-challenge.repository.js';
import { InMemoryAuthTwoFactorChallengeRepository } from '../../src/infrastructure/database/in-memory/in-memory-auth-two-factor-challenge.repository.js';
import { InMemoryUserRepository } from '../../src/infrastructure/database/in-memory/in-memory-user.repository.js';
import { InMemoryUserSessionRepository } from '../../src/infrastructure/database/in-memory/in-memory-user-session.repository.js';
import { RateLimiterService } from '../../src/infrastructure/auth/rate-limiter.service.js';
import { JwtSessionService } from '../../src/infrastructure/auth/jwt-session.service.js';
import { ISmsProvider, SmsSendResult } from '../../src/infrastructure/sms/sms-provider.interface.js';
import {
  InvalidPhoneNumberException,
  OtpCooldownActiveException,
  OtpInvalidException,
  OtpMaxAttemptsExceededException,
  TwoFactorInvalidException,
} from '../../src/domain/exceptions/auth.exceptions.js';
import { User } from '../../src/domain/entities/user.entity.js';
import { Email } from '../../src/domain/value-objects/email.vo.js';
import { PhoneNumber } from '../../src/domain/value-objects/phone-number.vo.js';

class MockSmsProvider implements ISmsProvider {
  public sentMessages: Array<{ to: string; code: string }> = [];

  async sendOtp(to: string, code: string): Promise<SmsSendResult> {
    this.sentMessages.push({ to, code });
    return { success: true, messageId: 'mock-msg-123' };
  }
}

describe('OTP & Authentication Flow (Unit)', () => {
  let otpRepo: InMemoryAuthOtpChallengeRepository;
  let twoFactorRepo: InMemoryAuthTwoFactorChallengeRepository;
  let userRepo: InMemoryUserRepository;
  let sessionRepo: InMemoryUserSessionRepository;
  let smsProvider: MockSmsProvider;
  let rateLimiter: RateLimiterService;
  let jwtService: JwtSessionService;
  let requestOtpUseCase: RequestOtpUseCase;
  let verifyOtpUseCase: VerifyOtpUseCase;
  let verifyTwoFactorUseCase: VerifyTwoFactorUseCase;

  const pepper = 'test-secret-pepper-key';

  beforeEach(() => {
    otpRepo = new InMemoryAuthOtpChallengeRepository();
    twoFactorRepo = new InMemoryAuthTwoFactorChallengeRepository();
    userRepo = new InMemoryUserRepository();
    sessionRepo = new InMemoryUserSessionRepository();
    smsProvider = new MockSmsProvider();
    rateLimiter = new RateLimiterService();
    jwtService = new JwtSessionService();

    requestOtpUseCase = new RequestOtpUseCase(
      otpRepo,
      userRepo,
      smsProvider,
      rateLimiter,
      pepper,
      true, // isDev = true
    );

    verifyOtpUseCase = new VerifyOtpUseCase(
      otpRepo,
      twoFactorRepo,
      userRepo,
      sessionRepo,
      jwtService,
      pepper,
      false, // isDev = false to test strict verification
    );

    verifyTwoFactorUseCase = new VerifyTwoFactorUseCase(
      twoFactorRepo,
      userRepo,
      sessionRepo,
      jwtService,
      false,
    );
  });

  it('generates a 5-digit code and creates OTP challenge on valid phone number', async () => {
    const res = await requestOtpUseCase.execute({
      phone: '09121111111',
    });

    expect(res.success).toBe(true);
    expect(res.challengeTicket).toBeDefined();
    expect(res.expiresInSeconds).toBe(120);
    expect(res.devCode).toHaveLength(5);
    expect(smsProvider.sentMessages).toHaveLength(1);
    expect(smsProvider.sentMessages[0].to).toBe('09121111111');
    expect(smsProvider.sentMessages[0].code).toBe(res.devCode);
  });

  it('normalizes Persian digits and rejects invalid mobile numbers', async () => {
    // Valid with Persian digits
    const res = await requestOtpUseCase.execute({
      phone: '۰۹۱۲۳۴۵۶۷۸۹',
    });
    expect(res.success).toBe(true);

    // Invalid format
    await expect(
      requestOtpUseCase.execute({
        phone: '02188888888',
      }),
    ).rejects.toThrow(InvalidPhoneNumberException);
  });

  it('enforces resend cooldown on immediate subsequent request', async () => {
    await requestOtpUseCase.execute({ phone: '09124444444' });

    await expect(
      requestOtpUseCase.execute({ phone: '09124444444' }),
    ).rejects.toThrow(OtpCooldownActiveException);
  });

  it('successfully verifies correct 5-digit code and issues authenticated session', async () => {
    const requestRes = await requestOtpUseCase.execute({ phone: '09121111111' });
    const code = requestRes.devCode!;

    const verifyRes = await verifyOtpUseCase.execute({
      challengeTicket: requestRes.challengeTicket,
      code,
    });

    expect(verifyRes.success).toBe(true);
    expect(verifyRes.requiresTwoFactor).toBe(false);
    expect(verifyRes.session).toBeDefined();
    expect(verifyRes.session?.accessToken).toBeDefined();
    expect(verifyRes.session?.user.phone).toBe('09121111111');
  });

  it('rejects incorrect OTP code and decrements remaining attempts', async () => {
    const requestRes = await requestOtpUseCase.execute({ phone: '09121111111' });

    await expect(
      verifyOtpUseCase.execute({
        challengeTicket: requestRes.challengeTicket,
        code: '00000',
      }),
    ).rejects.toThrow(OtpInvalidException);

    const challenge = await otpRepo.findById(requestRes.challengeTicket);
    expect(challenge?.attempts).toBe(1);
    expect(challenge?.getRemainingAttempts()).toBe(4);
  });

  it('locks out challenge after maximum failed attempts', async () => {
    const requestRes = await requestOtpUseCase.execute({ phone: '09121111111' });
    const ticket = requestRes.challengeTicket;

    for (let i = 0; i < 4; i++) {
      try {
        await verifyOtpUseCase.execute({ challengeTicket: ticket, code: '00000' });
      } catch {
        // Expected
      }
    }

    // 5th attempt reaches max
    await expect(
      verifyOtpUseCase.execute({ challengeTicket: ticket, code: '00000' }),
    ).rejects.toThrow();

    // Subsequent attempt is blocked by max attempts
    await expect(
      verifyOtpUseCase.execute({ challengeTicket: ticket, code: '00000' }),
    ).rejects.toThrow(OtpMaxAttemptsExceededException);
  });

  it('prevents OTP challenge reuse (one-time use invariant)', async () => {
    const requestRes = await requestOtpUseCase.execute({ phone: '09121111111' });
    const code = requestRes.devCode!;

    // First use: success
    await verifyOtpUseCase.execute({
      challengeTicket: requestRes.challengeTicket,
      code,
    });

    // Second use: must be rejected
    await expect(
      verifyOtpUseCase.execute({
        challengeTicket: requestRes.challengeTicket,
        code,
      }),
    ).rejects.toThrow(OtpInvalidException);
  });

  it('transitions to 2FA step when user has twoFactorEnabled', async () => {
    await userRepo.save(
      new User({
        id: 'test-user-2fa-id',
        name: 'کاربر دو مرحله‌ای تستی',
        email: Email.create('user2fa@test.local'),
        phone: PhoneNumber.create('09122222222'),
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        security: {
          twoFactorEnabled: true,
          twoFactorMethod: 'PIN',
          securityPinHash: '123456',
        },
      }),
    );

    const requestRes = await requestOtpUseCase.execute({ phone: '09122222222' });
    expect(requestRes.hasTwoFactor).toBe(true);

    const verifyRes = await verifyOtpUseCase.execute({
      challengeTicket: requestRes.challengeTicket,
      code: requestRes.devCode!,
    });

    expect(verifyRes.requiresTwoFactor).toBe(true);
    expect(verifyRes.twoFactorTicket).toBeDefined();
    expect(verifyRes.session).toBeUndefined(); // Cannot create session before 2FA!

    // Verify 2FA with wrong PIN
    await expect(
      verifyTwoFactorUseCase.execute({
        twoFactorTicket: verifyRes.twoFactorTicket!,
        codeOrPassword: 'wrong-pin',
      }),
    ).rejects.toThrow(TwoFactorInvalidException);

    // Verify 2FA with correct PIN (123456)
    const twoFactorRes = await verifyTwoFactorUseCase.execute({
      twoFactorTicket: verifyRes.twoFactorTicket!,
      codeOrPassword: '123456',
    });

    expect(twoFactorRes.success).toBe(true);
    expect(twoFactorRes.session).toBeDefined();
    expect(twoFactorRes.session.user.twoFactorEnabled).toBe(true);
  });
});
