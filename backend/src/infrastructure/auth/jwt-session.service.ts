import { Injectable } from '@nestjs/common';
import { createHmac, randomBytes, timingSafeEqual, createHash } from 'node:crypto';

export interface TokenPayload {
  sub: string; // User ID
  role: string;
  phone: string;
  iat: number;
  exp: number;
}

export interface GeneratedTokens {
  accessToken: string;
  refreshToken: string;
  refreshTokenHash: string;
  expiresAt: number; // Unix timestamp in ms
}

@Injectable()
export class JwtSessionService {
  private readonly secret: string;
  private readonly accessTtlSeconds: number;
  private readonly refreshTtlSeconds: number;

  constructor() {
    this.secret = process.env.JWT_SECRET ?? 'velox_super_secure_jwt_secret_default_key_12345';
    this.accessTtlSeconds = parseInt(process.env.ACCESS_TOKEN_TTL_SECONDS ?? String(30 * 24 * 3600), 10); // 30 days
    this.refreshTtlSeconds = parseInt(process.env.SESSION_TTL_SECONDS ?? String(30 * 24 * 3600), 10); // 30 days
  }

  public getSecret(): string {
    return this.secret;
  }

  public generateTokens(userId: string, role: string, phone: string): GeneratedTokens {
    const now = Math.floor(Date.now() / 1000);
    const exp = now + this.accessTtlSeconds;

    const payload: TokenPayload = {
      sub: userId,
      role,
      phone,
      iat: now,
      exp,
    };

    const accessToken = this.signJwt(payload);
    const refreshToken = randomBytes(32).toString('hex');
    const refreshTokenHash = this.hashToken(refreshToken);

    return {
      accessToken,
      refreshToken,
      refreshTokenHash,
      expiresAt: (now + this.refreshTtlSeconds) * 1000,
    };
  }

  public verifyAccessToken(token: string): TokenPayload | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;

      const [encodedHeader, encodedPayload, signature] = parts;
      const expectedSignature = this.createSignature(`${encodedHeader}.${encodedPayload}`);

      const sigBuffer = Buffer.from(signature, 'utf8');
      const expectedSigBuffer = Buffer.from(expectedSignature, 'utf8');

      if (sigBuffer.length !== expectedSigBuffer.length) {
        return null;
      }

      if (!timingSafeEqual(sigBuffer, expectedSigBuffer)) {
        return null;
      }

      const payloadJson = Buffer.from(encodedPayload, 'base64url').toString('utf8');
      const payload = JSON.parse(payloadJson) as TokenPayload;

      const now = Math.floor(Date.now() / 1000);
      if (payload.exp && payload.exp < now) {
        return null; // Expired
      }

      return payload;
    } catch {
      return null;
    }
  }

  public hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  private signJwt(payload: TokenPayload): string {
    const header = { alg: 'HS256', typ: 'JWT' };
    const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
    const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
    const signature = this.createSignature(`${encodedHeader}.${encodedPayload}`);
    return `${encodedHeader}.${encodedPayload}.${signature}`;
  }

  private createSignature(data: string): string {
    return createHmac('sha256', this.secret).update(data).digest('base64url');
  }
}
