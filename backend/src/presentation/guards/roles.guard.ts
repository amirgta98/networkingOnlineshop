import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
  Optional,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator.js';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator.js';
import { PrismaService } from '../../infrastructure/database/prisma/prisma.service.js';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    @Optional() private readonly prisma?: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (
      (!requiredRoles || requiredRoles.length === 0) &&
      (!requiredPermissions || requiredPermissions.length === 0)
    ) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException('لطفاً ابتدا وارد حساب کاربری خود شوید.');
    }

    let userRole = (user.role || '').toLowerCase();
    const userId = user.sub || user.id;

    const isTokenAdmin =
      userRole === 'admin' ||
      userRole === 'super_admin' ||
      userRole === 'staff_manager' ||
      userRole === 'sales_manager';

    // If token already has admin privileges, allow immediately without querying the database (fast-path).
    if (isTokenAdmin) {
      return true;
    }

    // Live database lookup to check current role and assigned permissions
    let dbUser: any = null;
    if (userId && this.prisma?.user) {
      try {
        dbUser = await this.prisma.user.findUnique({
          where: { id: userId },
          include: {
            roles: {
              include: {
                role: true,
              },
            },
            userPermissions: {
              include: {
                permission: true,
              },
            },
          },
        });
      } catch (err) {
        // Fall back to token if DB query encounters transient error
      }
    }

    let isDbAdmin = false;
    let isDbSiteManager = false;
    let isDbPartner = false;
    let userPermissions: string[] = [];

    if (dbUser && dbUser.isActive && dbUser.status === 'ACTIVE') {
      const codes = (dbUser.roles || [])
        .map((r: any) => r.role?.code?.toUpperCase())
        .filter(Boolean);

      isDbAdmin =
        codes.includes('SUPER_ADMIN') ||
        codes.includes('STAFF_MANAGER') ||
        codes.includes('SALES_MANAGER') ||
        codes.includes('ADMIN');

      isDbSiteManager = codes.includes('SITE_MANAGER');

      isDbPartner =
        codes.includes('PARTNER_B2B') ||
        codes.includes('PARTNER');

      userPermissions = (dbUser.userPermissions || [])
        .map((up: any) => up.permission?.code)
        .filter(Boolean);

      if (isDbAdmin) {
        userRole = 'admin';
      } else if (isDbSiteManager) {
        userRole = 'site_manager';
      } else if (isDbPartner) {
        userRole = 'partner';
      } else {
        userRole = 'customer';
      }

      user.role = userRole;
      user.permissions = userPermissions;
      request.user.role = userRole;
      request.user.permissions = userPermissions;
    } else {
      isDbAdmin = isTokenAdmin;
      isDbSiteManager = userRole === 'site_manager';
      isDbPartner = userRole === 'partner' || userRole === 'partner_b2b';
      userPermissions = user.permissions || [];
    }

    // 1. Root / Super Admin has full unrestricted access to all admin sections
    if (isDbAdmin) {
      return true;
    }

    // 2. Site Manager: check granular permissions or explicit site_manager role allowance
    if (isDbSiteManager) {
      if (requiredPermissions && requiredPermissions.length > 0) {
        const hasPerm = requiredPermissions.some((perm) => userPermissions.includes(perm));
        if (hasPerm) {
          return true;
        }
        throw new ForbiddenException('شما مجوز دسترسی به این بخش مدیریتی را ندارید.');
      }

      if (requiredRoles && requiredRoles.length > 0) {
        const roleAllowed = requiredRoles.some(
          (r) => r.toLowerCase() === 'site_manager' || r.toLowerCase() === '*'
        );
        if (roleAllowed) {
          return true;
        }
        throw new ForbiddenException('این عملیات صرفاً مخصوص مدیر ارشد سیستم (SuperAdmin) می‌باشد.');
      }

      return true;
    }

    // 3. Regular users (customer, partner)
    if (requiredPermissions && requiredPermissions.length > 0) {
      throw new ForbiddenException('شما مجوز دسترسی به این بخش مدیریتی را ندارید.');
    }

    if (requiredRoles && requiredRoles.length > 0) {
      const matchRole = requiredRoles.some((role) => {
        const target = role.toLowerCase();
        if (target === 'partner' && isDbPartner) return true;
        if (target === 'customer' && userRole === 'customer') return true;
        return target === userRole;
      });

      if (!matchRole) {
        throw new ForbiddenException('شما مجوز دسترسی به این بخش مدیریتی را ندارید.');
      }
      return true;
    }

    return true;
  }
}
