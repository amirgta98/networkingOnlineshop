import {
  Injectable,
  CanActivate,
  ExecutionContext,
  Optional,
} from '@nestjs/common';
import type { Request } from 'express';
import { JwtSessionService, type TokenPayload } from '../../infrastructure/auth/jwt-session.service.js';
import { PrismaService } from '../../infrastructure/database/prisma/prisma.service.js';

@Injectable()
export class OptionalAuthGuard implements CanActivate {
  constructor(
    private readonly jwtSessionService: JwtSessionService,
    @Optional() private readonly prisma?: PrismaService,
  ) {}

  canActivate(context: ExecutionContext): boolean | Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request & { user?: TokenPayload }>();
    const token = this.extractTokenFromRequest(request);

    if (!token) {
      return true;
    }

    const payload = this.jwtSessionService.verifyAccessToken(token);
    if (payload) {
      if (this.prisma && payload.sub) {
        return this.resolvePayloadUser(payload).then((resolved) => {
          request.user = resolved;
          return true;
        });
      }
      request.user = payload;
    }

    return true;
  }

  private async resolvePayloadUser(payload: TokenPayload): Promise<TokenPayload> {
    if (!this.prisma) return payload;
    try {
      const existing = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        select: { id: true },
      });
      if (existing) {
        return payload;
      }
      if (payload.phone) {
        const byPhone = await this.prisma.user.findUnique({
          where: { phone: payload.phone },
          select: { id: true },
        });
        if (byPhone) {
          return {
            ...payload,
            sub: byPhone.id,
          };
        }
      }
    } catch {
      // Ignore DB lookup error in optional guard
    }
    return payload;
  }

  private extractTokenFromRequest(request: Request): string | null {
    // 1. Authorization header: Bearer <token>
    const authHeader = request.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7).trim();
    }

    // 2. Cookie extraction
    const cookieHeader = request.headers.cookie;
    if (cookieHeader) {
      const cookies = cookieHeader.split(';').reduce(
        (acc, item) => {
          const [key, value] = item.trim().split('=');
          if (key && value) {
            acc[key] = decodeURIComponent(value);
          }
          return acc;
        },
        {} as Record<string, string>,
      );

      if (cookies['velox_session_token']) {
        return cookies['velox_session_token'];
      }
      if (cookies['access_token']) {
        return cookies['access_token'];
      }
    }

    return null;
  }
}
