import { PhoneNumber } from '../value-objects/phone-number.vo.js';
import { OtpCode } from '../value-objects/otp-code.vo.js';
import {
  OtpExpiredException,
  OtpMaxAttemptsExceededException,
} from '../exceptions/auth.exceptions.js';

export interface AuthOtpChallengeProps {
  id: string;
  phone: PhoneNumber;
  otpHash: string;
  purpose: string;
  attempts: number;
  maxAttempts: number;
  resendCooldownUntil: Date;
  expiresAt: Date;
  consumedAt: Date | null;
  ipAddress: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateOtpChallengeParams {
  id: string;
  phone: PhoneNumber;
  otpCode: OtpCode;
  secret: string;
  ttlSeconds?: number;
  cooldownSeconds?: number;
  maxAttempts?: number;
  ipAddress?: string | null;
  purpose?: string;
}

export class AuthOtpChallenge {
  private readonly _id: string;
  private readonly _phone: PhoneNumber;
  private readonly _otpHash: string;
  private readonly _purpose: string;
  private _attempts: number;
  private readonly _maxAttempts: number;
  private readonly _resendCooldownUntil: Date;
  private readonly _expiresAt: Date;
  private _consumedAt: Date | null;
  private readonly _ipAddress: string | null;
  private readonly _createdAt: Date;
  private _updatedAt: Date;

  constructor(props: AuthOtpChallengeProps) {
    this._id = props.id;
    this._phone = props.phone;
    this._otpHash = props.otpHash;
    this._purpose = props.purpose;
    this._attempts = props.attempts;
    this._maxAttempts = props.maxAttempts;
    this._resendCooldownUntil = props.resendCooldownUntil;
    this._expiresAt = props.expiresAt;
    this._consumedAt = props.consumedAt;
    this._ipAddress = props.ipAddress;
    this._createdAt = props.createdAt;
    this._updatedAt = props.updatedAt;
  }

  public static create(params: CreateOtpChallengeParams): AuthOtpChallenge {
    const now = new Date();
    const ttl = params.ttlSeconds ?? 120; // 2 minutes default
    const cooldown = params.cooldownSeconds ?? 120; // 2 minutes default
    const maxAttempts = params.maxAttempts ?? 5;

    const expiresAt = new Date(now.getTime() + ttl * 1000);
    const cooldownUntil = new Date(now.getTime() + cooldown * 1000);

    const otpHash = params.otpCode.hash(params.secret);

    return new AuthOtpChallenge({
      id: params.id,
      phone: params.phone,
      otpHash,
      purpose: params.purpose ?? 'LOGIN',
      attempts: 0,
      maxAttempts,
      resendCooldownUntil: cooldownUntil,
      expiresAt,
      consumedAt: null,
      ipAddress: params.ipAddress ?? null,
      createdAt: now,
      updatedAt: now,
    });
  }

  public get id(): string {
    return this._id;
  }

  public get phone(): PhoneNumber {
    return this._phone;
  }

  public get otpHash(): string {
    return this._otpHash;
  }

  public get purpose(): string {
    return this._purpose;
  }

  public get attempts(): number {
    return this._attempts;
  }

  public get maxAttempts(): number {
    return this._maxAttempts;
  }

  public get resendCooldownUntil(): Date {
    return this._resendCooldownUntil;
  }

  public get expiresAt(): Date {
    return this._expiresAt;
  }

  public get consumedAt(): Date | null {
    return this._consumedAt;
  }

  public get ipAddress(): string | null {
    return this._ipAddress;
  }

  public get createdAt(): Date {
    return this._createdAt;
  }

  public get updatedAt(): Date {
    return this._updatedAt;
  }

  public isExpired(now: Date = new Date()): boolean {
    return now.getTime() > this._expiresAt.getTime();
  }

  public isConsumed(): boolean {
    return this._consumedAt !== null;
  }

  public isCooldownActive(now: Date = new Date()): boolean {
    return now.getTime() < this._resendCooldownUntil.getTime();
  }

  public getCooldownRemainingSeconds(now: Date = new Date()): number {
    const diff = Math.ceil((this._resendCooldownUntil.getTime() - now.getTime()) / 1000);
    return Math.max(0, diff);
  }

  public hasExceededMaxAttempts(): boolean {
    return this._attempts >= this._maxAttempts;
  }

  public getRemainingAttempts(): number {
    return Math.max(0, this._maxAttempts - this._attempts);
  }

  public verify(code: string, secret: string, now: Date = new Date()): boolean {
    if (this.isConsumed()) {
      return false;
    }

    if (this.isExpired(now)) {
      throw new OtpExpiredException();
    }

    if (this.hasExceededMaxAttempts()) {
      throw new OtpMaxAttemptsExceededException();
    }

    const matches = OtpCode.verify(code, this._otpHash, secret);

    if (!matches) {
      this.recordFailedAttempt();
      return false;
    }

    return true;
  }

  public recordFailedAttempt(): void {
    this._attempts += 1;
    this._updatedAt = new Date();
  }

  public consume(now: Date = new Date()): void {
    if (this.isConsumed()) {
      throw new Error('این درخواست کد تایید قبلاً استفاده شده است.');
    }
    this._consumedAt = now;
    this._updatedAt = now;
  }
}
