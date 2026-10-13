export interface UserSessionProps {
  id: string;
  userId: string;
  refreshTokenHash: string;
  deviceName: string | null;
  browser: string | null;
  os: string | null;
  ipAddress: string | null;
  location: string | null;
  isRevoked: boolean;
  expiresAt: Date;
  lastActiveAt: Date;
  createdAt: Date;
}

export interface CreateSessionParams {
  id: string;
  userId: string;
  refreshTokenHash: string;
  ttlSeconds?: number;
  deviceName?: string | null;
  browser?: string | null;
  os?: string | null;
  ipAddress?: string | null;
  location?: string | null;
}

export class UserSession {
  private readonly _id: string;
  private readonly _userId: string;
  private readonly _refreshTokenHash: string;
  private readonly _deviceName: string | null;
  private readonly _browser: string | null;
  private readonly _os: string | null;
  private readonly _ipAddress: string | null;
  private readonly _location: string | null;
  private _isRevoked: boolean;
  private readonly _expiresAt: Date;
  private _lastActiveAt: Date;
  private readonly _createdAt: Date;

  constructor(props: UserSessionProps) {
    this._id = props.id;
    this._userId = props.userId;
    this._refreshTokenHash = props.refreshTokenHash;
    this._deviceName = props.deviceName;
    this._browser = props.browser;
    this._os = props.os;
    this._ipAddress = props.ipAddress;
    this._location = props.location;
    this._isRevoked = props.isRevoked;
    this._expiresAt = props.expiresAt;
    this._lastActiveAt = props.lastActiveAt;
    this._createdAt = props.createdAt;
  }

  public static create(params: CreateSessionParams): UserSession {
    const now = new Date();
    // Default 30 days for revocable session
    const ttl = params.ttlSeconds ?? 30 * 24 * 60 * 60;
    const expiresAt = new Date(now.getTime() + ttl * 1000);

    return new UserSession({
      id: params.id,
      userId: params.userId,
      refreshTokenHash: params.refreshTokenHash,
      deviceName: params.deviceName ?? null,
      browser: params.browser ?? null,
      os: params.os ?? null,
      ipAddress: params.ipAddress ?? null,
      location: params.location ?? null,
      isRevoked: false,
      expiresAt,
      lastActiveAt: now,
      createdAt: now,
    });
  }

  public get id(): string {
    return this._id;
  }

  public get userId(): string {
    return this._userId;
  }

  public get refreshTokenHash(): string {
    return this._refreshTokenHash;
  }

  public get deviceName(): string | null {
    return this._deviceName;
  }

  public get browser(): string | null {
    return this._browser;
  }

  public get os(): string | null {
    return this._os;
  }

  public get ipAddress(): string | null {
    return this._ipAddress;
  }

  public get location(): string | null {
    return this._location;
  }

  public get isRevoked(): boolean {
    return this._isRevoked;
  }

  public get expiresAt(): Date {
    return this._expiresAt;
  }

  public get lastActiveAt(): Date {
    return this._lastActiveAt;
  }

  public get createdAt(): Date {
    return this._createdAt;
  }

  public isValid(now: Date = new Date()): boolean {
    return !this._isRevoked && now.getTime() <= this._expiresAt.getTime();
  }

  public revoke(): void {
    this._isRevoked = true;
  }

  public touch(now: Date = new Date()): void {
    this._lastActiveAt = now;
  }
}
