import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Optional,
} from '@nestjs/common';
import type { Request } from 'express';
import { JwtSessionService, type TokenPayload } from '../../infrastructure/auth/jwt-session.service.js';
import { PrismaService } from '../../infrastructure/database/prisma/prisma.service.js';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtSessionService: JwtSessionService,
    @Optional() private readonly prisma?: PrismaService,
  ) {}

  canActivate(context: ExecutionContext): boolean | Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request & { user?: TokenPayload }>();

    // 1. Internal webhook secret check for server-to-server calls
    const internalSecret =
      process.env.INTERNAL_WEBHOOK_SECRET ||
      process.env.INTERNAL_API_SECRET ||
      (process.env.NODE_ENV !== 'production' ? process.env.SESSION_SECRET : undefined);
    const providedSecret =
      (request.headers['x-internal-secret'] as string | undefined) ||
      (request.headers['x-webhook-secret'] as string | undefined);

    if (internalSecret && providedSecret && providedSecret === internalSecret) {
      const now = Math.floor(Date.now() / 1000);
      request.user = {
        sub: 'internal-webhook-service',
        phone: '09000000000',
        role: 'admin',
        iat: now,
        exp: now + 3600,
      };
      return true;
    }

    // 2. Regular JWT auth
    const token = this.extractTokenFromRequest(request);

    if (!token) {
      throw new UnauthorizedException('لطفاً ابتدا وارد حساب کاربری خود شوید.');
    }

    const payload = this.jwtSessionService.verifyAccessToken(token);
    if (!payload) {
      throw new UnauthorizedException('توکن احراز هویت نامعتبر یا منقضی شده است.');
    }

    if (this.prisma && payload.sub) {
      return this.resolvePayloadUser(payload).then((resolved) => {
        request.user = resolved;
        return true;
      });
    }

    request.user = payload;
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
      // Non-blocking fallback to original payload if DB lookup fails
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
