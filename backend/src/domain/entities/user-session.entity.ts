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
  userAgent?: string | null;
}

function parseUserAgentDetails(ua?: string | null): { browser: string | null; os: string | null; deviceName: string | null } {
  if (!ua || typeof ua !== 'string') return { browser: null, os: null, deviceName: null };
  const cleanUa = ua.trim();
  if (!cleanUa) return { browser: null, os: null, deviceName: null };

  let browser = 'Other Browser';
  let os = 'Other OS';
  let deviceName = 'Desktop';

  if (cleanUa.includes('Edg/')) browser = 'Microsoft Edge';
  else if (cleanUa.includes('Chrome/')) browser = 'Google Chrome';
  else if (cleanUa.includes('Firefox/')) browser = 'Mozilla Firefox';
  else if (cleanUa.includes('Safari/') && !cleanUa.includes('Chrome')) browser = 'Apple Safari';
  else if (cleanUa.includes('Opera') || cleanUa.includes('OPR/')) browser = 'Opera';

  if (cleanUa.includes('Windows NT 10.0')) os = 'Windows 10/11';
  else if (cleanUa.includes('Windows NT')) os = 'Windows';
  else if (cleanUa.includes('Macintosh') || cleanUa.includes('Mac OS X')) os = 'macOS';
  else if (cleanUa.includes('Android')) { os = 'Android'; deviceName = 'Mobile'; }
  else if (cleanUa.includes('iPhone')) { os = 'iOS'; deviceName = 'iPhone'; }
  else if (cleanUa.includes('iPad')) { os = 'iPadOS'; deviceName = 'iPad'; }
  else if (cleanUa.includes('Linux')) os = 'Linux';

  return { browser, os, deviceName };
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

    let browser = params.browser ?? null;
    let os = params.os ?? null;
    let deviceName = params.deviceName ?? null;

    const rawUa = params.userAgent ?? (browser && (browser.includes('Mozilla/') || browser.length > 50) ? browser : undefined);
    if (rawUa) {
      const parsed = parseUserAgentDetails(rawUa);
      browser = parsed.browser;
      os = os ?? parsed.os;
      deviceName = deviceName ?? parsed.deviceName;
    }

    return new UserSession({
      id: params.id,
      userId: params.userId,
      refreshTokenHash: params.refreshTokenHash,
      deviceName: deviceName ? deviceName.slice(0, 150) : null,
      browser: browser ? browser.slice(0, 100) : null,
      os: os ? os.slice(0, 100) : null,
      ipAddress: params.ipAddress ? params.ipAddress.slice(0, 45) : null,
      location: params.location ? params.location.slice(0, 150) : null,
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
