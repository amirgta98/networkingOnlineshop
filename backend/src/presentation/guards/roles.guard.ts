import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator.js';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException('لطفاً ابتدا وارد حساب کاربری خود شوید.');
    }

    const userRole = (user.role || '').toLowerCase();

    // Map admin synonyms
    const isAdmin =
      userRole === 'admin' ||
      userRole === 'super_admin' ||
      userRole === 'staff_manager' ||
      userRole === 'sales_manager';

    const hasRole = requiredRoles.some((role) => {
      const targetRole = role.toLowerCase();
      if (targetRole === 'admin' && isAdmin) return true;
      if (targetRole === 'super_admin' && (userRole === 'super_admin' || userRole === 'admin')) return true;
      if (targetRole === 'partner' && (userRole === 'partner' || userRole === 'partner_b2b')) return true;
      if (targetRole === 'customer' && userRole === 'customer') return true;
      return userRole === targetRole;
    });

    if (!hasRole) {
      throw new ForbiddenException('شما مجوز دسترسی به این بخش مدیریتی را ندارید.');
    }

    return true;
  }
}
