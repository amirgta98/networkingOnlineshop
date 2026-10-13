import { PhoneNumber } from '../value-objects/phone-number.vo.js';
import {
  TwoFactorExpiredException,
} from '../exceptions/auth.exceptions.js';

export interface AuthTwoFactorChallengeProps {
  id: string;
  userId: string;
  phone: PhoneNumber;
  attempts: number;
  maxAttempts: number;
  expiresAt: Date;
  consumedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTwoFactorChallengeParams {
  id: string;
  userId: string;
  phone: PhoneNumber;
  ttlSeconds?: number;
  maxAttempts?: number;
}

export class AuthTwoFactorChallenge {
  private readonly _id: string;
  private readonly _userId: string;
  private readonly _phone: PhoneNumber;
  private _attempts: number;
  private readonly _maxAttempts: number;
  private readonly _expiresAt: Date;
  private _consumedAt: Date | null;
  private readonly _createdAt: Date;
  private _updatedAt: Date;

  constructor(props: AuthTwoFactorChallengeProps) {
    this._id = props.id;
    this._userId = props.userId;
    this._phone = props.phone;
    this._attempts = props.attempts;
    this._maxAttempts = props.maxAttempts;
    this._expiresAt = props.expiresAt;
    this._consumedAt = props.consumedAt;
    this._createdAt = props.createdAt;
    this._updatedAt = props.updatedAt;
  }

  public static create(params: CreateTwoFactorChallengeParams): AuthTwoFactorChallenge {
    const now = new Date();
    const ttl = params.ttlSeconds ?? 300; // 5 minutes default
    const maxAttempts = params.maxAttempts ?? 5;
    const expiresAt = new Date(now.getTime() + ttl * 1000);

    return new AuthTwoFactorChallenge({
      id: params.id,
      userId: params.userId,
      phone: params.phone,
      attempts: 0,
      maxAttempts,
      expiresAt,
      consumedAt: null,
      createdAt: now,
      updatedAt: now,
    });
  }

  public get id(): string {
    return this._id;
  }

  public get userId(): string {
    return this._userId;
  }

  public get phone(): PhoneNumber {
    return this._phone;
  }

  public get attempts(): number {
    return this._attempts;
  }

  public get maxAttempts(): number {
    return this._maxAttempts;
  }

  public get expiresAt(): Date {
    return this._expiresAt;
  }

  public get consumedAt(): Date | null {
    return this._consumedAt;
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

  public hasExceededMaxAttempts(): boolean {
    return this._attempts >= this._maxAttempts;
  }

  public getRemainingAttempts(): number {
    return Math.max(0, this._maxAttempts - this._attempts);
  }

  public validateState(now: Date = new Date()): void {
    if (this.isConsumed()) {
      throw new Error('این نشست اعتبارسنجی دو مرحله‌ای قبلاً مصرف شده است.');
    }
    if (this.isExpired(now)) {
      throw new TwoFactorExpiredException();
    }
  }

  public recordFailedAttempt(): void {
    this._attempts += 1;
    this._updatedAt = new Date();
  }

  public consume(now: Date = new Date()): void {
    this.validateState(now);
    this._consumedAt = now;
    this._updatedAt = now;
  }
}
