import { PhoneNumber } from '../../../domain/value-objects/phone-number.vo.js';
import { OtpCode } from '../../../domain/value-objects/otp-code.vo.js';
import { AuthOtpChallenge } from '../../../domain/entities/auth-otp-challenge.entity.js';
import { IAuthOtpChallengeRepository } from '../../../domain/repositories/auth-otp-challenge.repository.interface.js';
import { IUserRepository } from '../../../domain/repositories/user.repository.interface.js';
import { ISmsProvider } from '../../../infrastructure/sms/sms-provider.interface.js';
import { RateLimiterService } from '../../../infrastructure/auth/rate-limiter.service.js';
import {
  OtpCooldownActiveException,
  SmsDispatchFailedException,
} from '../../../domain/exceptions/auth.exceptions.js';
import { RequestOtpCommand, RequestOtpResult } from '../../dto/auth/auth.dto.js';
import { randomUUID } from 'node:crypto';

export class RequestOtpUseCase {
  constructor(
    private readonly authOtpChallengeRepo: IAuthOtpChallengeRepository,
    private readonly userRepo: IUserRepository,
    private readonly smsProvider: ISmsProvider,
    private readonly rateLimiter: RateLimiterService,
    private readonly pepperSecret: string,
    private readonly isDev: boolean = false,
  ) {}

  async execute(command: RequestOtpCommand): Promise<RequestOtpResult> {
    // 1. Normalize and validate phone number
    const phone = PhoneNumber.create(command.phone);

    // 2. Enforce Rate Limiting (per-IP and per-phone)
    this.rateLimiter.checkPhoneRateLimit(phone.value);
    this.rateLimiter.checkIpRateLimit(command.ipAddress);

    // 3. Check if there is an active challenge within cooldown period
    const existingActive = await this.authOtpChallengeRepo.findLatestActiveByPhone(phone.value);
    if (existingActive && existingActive.isCooldownActive()) {
      const remainingSeconds = existingActive.getCooldownRemainingSeconds();
      throw new OtpCooldownActiveException(remainingSeconds);
    }

    // 4. Generate cryptographically secure 5-digit OTP
    const otp = OtpCode.generate(5);
    const challengeId = randomUUID();
    const ttlSeconds = parseInt(process.env.OTP_TTL_SECONDS ?? '120', 10);
    const cooldownSeconds = parseInt(process.env.OTP_RESEND_COOLDOWN_SECONDS ?? '120', 10);

    const challenge = AuthOtpChallenge.create({
      id: challengeId,
      phone,
      otpCode: otp,
      secret: this.pepperSecret,
      ttlSeconds,
      cooldownSeconds,
      maxAttempts: parseInt(process.env.OTP_MAX_ATTEMPTS ?? '5', 10),
      ipAddress: command.ipAddress,
      purpose: 'LOGIN',
    });

    // 5. Persist challenge state
    await this.authOtpChallengeRepo.create(challenge);

    // 6. Send SMS via configured provider
    const smsResult = await this.smsProvider.sendOtp(phone.value, otp.value);
    if (!smsResult.success) {
      if (!this.isDev && (process.env.NODE_ENV === 'production' || process.env.FORCE_REAL_SMS === 'true')) {
        throw new SmsDispatchFailedException(smsResult.errorMessage);
      }
    }

    // 7. Check if user already exists and has 2FA enabled
    const existingUser = await this.userRepo.findByPhone(phone.value);
    const hasTwoFactor = existingUser?.isTwoFactorEnabled === true;

    return {
      success: true,
      message: this.isDev
        ? `کد تایید ۵ رقمی در حالت تست به ربات تلگرام ارسال شد.`
        : `کد تایید ۵ رقمی به شماره ${phone.maskedPersian} پیامک شد.`,
      challengeTicket: challengeId,
      maskedPhone: phone.maskedPersian,
      hasTwoFactor,
      expiresInSeconds: ttlSeconds,
      // Only supply devCode in development/test environments
      devCode: this.isDev ? otp.value : undefined,
    };
  }
}
