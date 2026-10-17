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

export interface UserActivity {
  id: string;
  action: string;
  timestamp: string;
  ip: string;
  device?: string;
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
  nationalCode?: string | null;
  nationalCodeVerified?: boolean;
  companyName?: string | null;
  userTier?: 'gold' | 'silver' | 'bronze';
  notes?: string | null;
  walletBalance?: number;
  totalSpent?: number;
  ordersCount?: number;
  lastLogin?: Date | string | null;
  activities?: UserActivity[];
}

export interface CreateUserParams {
  id: string;
  email: string;
  name: string;
  phone?: string | null;
  role?: string;
  status?: string;
  nationalCode?: string | null;
  companyName?: string | null;
  notes?: string | null;
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
  private _nationalCode: string | null;
  private _nationalCodeVerified: boolean;
  private _companyName: string | null;
  private _userTier: 'gold' | 'silver' | 'bronze';
  private _notes: string | null;
  private _walletBalance: number;
  private _totalSpent: number;
  private _ordersCount: number;
  private _lastLogin: Date | string | null;
  private _activities: UserActivity[];

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
    this._nationalCode = props.nationalCode ?? null;
    this._nationalCodeVerified = props.nationalCodeVerified ?? false;
    this._companyName = props.companyName ?? null;
    this._userTier = props.userTier ?? 'bronze';
    this._notes = props.notes ?? null;
    this._walletBalance = props.walletBalance ?? 0;
    this._totalSpent = props.totalSpent ?? 0;
    this._ordersCount = props.ordersCount ?? 0;
    this._lastLogin = props.lastLogin ?? null;
    this._activities = props.activities ? [...props.activities] : [];
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
    const isAct = params.status ? params.status.toUpperCase() === 'ACTIVE' : true;

    return new User({
      id: params.id,
      email: Email.create(params.email),
      name: params.name.trim(),
      isActive: isAct,
      createdAt: now,
      updatedAt: now,
      phone,
      role: params.role ?? 'customer',
      status: params.status ?? 'ACTIVE',
      nationalCode: params.nationalCode ?? null,
      companyName: params.companyName ?? null,
      notes: params.notes ?? null,
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

  public get nationalCode(): string | null {
    return this._nationalCode;
  }

  public get nationalCodeVerified(): boolean {
    return this._nationalCodeVerified;
  }

  public get companyName(): string | null {
    return this._companyName;
  }

  public get userTier(): 'gold' | 'silver' | 'bronze' {
    return this._userTier;
  }

  public get notes(): string | null {
    return this._notes;
  }

  public get walletBalance(): number {
    return this._walletBalance;
  }

  public get totalSpent(): number {
    return this._totalSpent;
  }

  public get ordersCount(): number {
    return this._ordersCount;
  }

  public get lastLogin(): Date | string | null {
    return this._lastLogin;
  }

  public get activities(): UserActivity[] {
    return [...this._activities];
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

  public setStatus(status: string): void {
    this._status = status;
    this._isActive = status.toUpperCase() === 'ACTIVE';
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

  public updateDetails(details: {
    name?: string;
    email?: Email;
    phone?: PhoneNumber | null;
    role?: string;
    status?: string;
    nationalCode?: string | null;
    nationalCodeVerified?: boolean;
    companyName?: string | null;
    userTier?: 'gold' | 'silver' | 'bronze';
    notes?: string | null;
    walletBalance?: number;
    totalSpent?: number;
    ordersCount?: number;
    lastLogin?: Date | string | null;
  }): void {
    if (details.name !== undefined) {
      if (!details.name || details.name.trim().length === 0) {
        throw new Error('User name cannot be empty.');
      }
      this._name = details.name.trim();
    }
    if (details.email !== undefined) this._email = details.email;
    if (details.phone !== undefined) this._phone = details.phone;
    if (details.role !== undefined) this._role = details.role;
    if (details.status !== undefined) {
      this._status = details.status;
      this._isActive = details.status.toUpperCase() === 'ACTIVE';
    }
    if (details.nationalCode !== undefined) this._nationalCode = details.nationalCode;
    if (details.nationalCodeVerified !== undefined) this._nationalCodeVerified = details.nationalCodeVerified;
    if (details.companyName !== undefined) this._companyName = details.companyName;
    if (details.userTier !== undefined) this._userTier = details.userTier;
    if (details.notes !== undefined) this._notes = details.notes;
    if (details.walletBalance !== undefined) this._walletBalance = details.walletBalance;
    if (details.totalSpent !== undefined) this._totalSpent = details.totalSpent;
    if (details.ordersCount !== undefined) this._ordersCount = details.ordersCount;
    if (details.lastLogin !== undefined) this._lastLogin = details.lastLogin;
    this._updatedAt = new Date();
  }

  public addActivity(activity: UserActivity): void {
    this._activities.unshift(activity);
    this._updatedAt = new Date();
  }
}
