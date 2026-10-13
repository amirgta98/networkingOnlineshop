import { Email } from '../value-objects/email.vo.js';
import { PhoneNumber } from '../value-objects/phone-number.vo.js';

export interface UserSecurityProps {
  twoFactorEnabled: boolean;
  twoFactorMethod: 'PIN' | 'TOTP' | 'SMS';
  securityPinHash?: string | null;
  passwordHash?: string | null;
  pinFailedAttempts?: number;
  pinLockedUntil?: Date | null;
}

export interface UserProps {
  id: string;
  email: Email;
  name: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  phone?: PhoneNumber | null;
  phoneVerifiedAt?: Date | null;
  status?: string;
  role?: string;
  security?: UserSecurityProps | null;
}

export interface CreateUserParams {
  id: string;
  email: string;
  name: string;
  phone?: string | null;
  role?: string;
}

export interface CreatePhoneUserParams {
  id: string;
  phone: PhoneNumber;
  name?: string;
  email?: Email;
  role?: string;
}

/**
 * Domain Entity representing a User.
 * Zero dependencies on ORM or NestJS.
 */
export class User {
  private readonly _id: string;
  private _email: Email;
  private _name: string;
  private _isActive: boolean;
  private readonly _createdAt: Date;
  private _updatedAt: Date;
  private _phone: PhoneNumber | null;
  private _phoneVerifiedAt: Date | null;
  private _status: string;
  private _role: string;
  private _security: UserSecurityProps | null;

  constructor(props: UserProps) {
    this._id = props.id;
    this._email = props.email;
    this._name = props.name;
    this._isActive = props.isActive;
    this._createdAt = props.createdAt;
    this._updatedAt = props.updatedAt;
    this._phone = props.phone ?? null;
    this._phoneVerifiedAt = props.phoneVerifiedAt ?? null;
    this._status = props.status ?? 'ACTIVE';
    this._role = props.role ?? 'customer';
    this._security = props.security ?? null;
  }

  /**
   * Factory method to create a new User instance enforcing business invariants.
   */
  public static create(params: CreateUserParams): User {
    if (!params.name || params.name.trim().length === 0) {
      throw new Error('User name cannot be empty.');
    }

    const now = new Date();
    const phone = params.phone ? PhoneNumber.create(params.phone) : null;

    return new User({
      id: params.id,
      email: Email.create(params.email),
      name: params.name.trim(),
      isActive: true,
      createdAt: now,
      updatedAt: now,
      phone,
      role: params.role ?? 'customer',
      status: 'ACTIVE',
    });
  }

  /**
   * Factory method for creating a user via Phone OTP registration.
   */
  public static createWithPhone(params: CreatePhoneUserParams): User {
    const now = new Date();
    const defaultName = params.name && params.name.trim().length > 0
      ? params.name.trim()
      : `کاربر ${params.phone.masked}`;
    const defaultEmail = params.email ?? Email.create(`u_${params.phone.value}@velox.local`);

    return new User({
      id: params.id,
      phone: params.phone,
      phoneVerifiedAt: now,
      email: defaultEmail,
      name: defaultName,
      isActive: true,
      role: params.role ?? 'customer',
      status: 'ACTIVE',
      createdAt: now,
      updatedAt: now,
      security: {
        twoFactorEnabled: false,
        twoFactorMethod: 'PIN',
      },
    });
  }

  // Getters for properties (read-only access)
  public get id(): string {
    return this._id;
  }

  public get email(): Email {
    return this._email;
  }

  public get name(): string {
    return this._name;
  }

  public get isActive(): boolean {
    return this._isActive;
  }

  public get createdAt(): Date {
    return this._createdAt;
  }

  public get updatedAt(): Date {
    return this._updatedAt;
  }

  public get phone(): PhoneNumber | null {
    return this._phone;
  }

  public get phoneVerifiedAt(): Date | null {
    return this._phoneVerifiedAt;
  }

  public get status(): string {
    return this._status;
  }

  public get role(): string {
    return this._role;
  }

  public get security(): UserSecurityProps | null {
    return this._security;
  }

  public get isTwoFactorEnabled(): boolean {
    return this._security?.twoFactorEnabled === true;
  }

  public get twoFactorMethod(): 'PIN' | 'TOTP' | 'SMS' {
    return this._security?.twoFactorMethod ?? 'PIN';
  }

  // Domain Business Operations
  public changeName(newName: string): void {
    if (!newName || newName.trim().length === 0) {
      throw new Error('User name cannot be empty.');
    }
    this._name = newName.trim();
    this._updatedAt = new Date();
  }

  public markPhoneVerified(phone?: PhoneNumber): void {
    if (phone) {
      this._phone = phone;
    }
    this._phoneVerifiedAt = new Date();
    this._updatedAt = new Date();
  }

  public setSecurity(security: UserSecurityProps): void {
    this._security = security;
    this._updatedAt = new Date();
  }

  public setRole(role: string): void {
    this._role = role;
    this._updatedAt = new Date();
  }

  public deactivate(): void {
    this._isActive = false;
    this._status = 'SUSPENDED';
    this._updatedAt = new Date();
  }

  public activate(): void {
    this._isActive = true;
    this._status = 'ACTIVE';
    this._updatedAt = new Date();
  }
}
