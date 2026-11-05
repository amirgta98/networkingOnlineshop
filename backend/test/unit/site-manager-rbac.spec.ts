import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ExecutionContext, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from '../../src/presentation/guards/roles.guard.js';
import { ROLES_KEY } from '../../src/presentation/decorators/roles.decorator.js';
import { PERMISSIONS_KEY } from '../../src/presentation/decorators/permissions.decorator.js';
import { UpdateUserRoleUseCase } from '../../src/application/use-cases/user/update-user-role.use-case.js';
import { UpdateUserPermissionsUseCase } from '../../src/application/use-cases/user/update-user-permissions.use-case.js';
import { InMemoryUserRepository } from '../../src/infrastructure/database/in-memory/in-memory-user.repository.js';
import { User } from '../../src/domain/entities/user.entity.js';
import { Email } from '../../src/domain/value-objects/email.vo.js';
import { PhoneNumber } from '../../src/domain/value-objects/phone-number.vo.js';

describe('Site Manager Role & Granular RBAC Permissions', () => {
  let reflector: Reflector;
  let mockPrisma: any;
  let guard: RolesGuard;
  let userRepo: InMemoryUserRepository;
  let updateRoleUseCase: UpdateUserRoleUseCase;
  let updatePermissionsUseCase: UpdateUserPermissionsUseCase;

  beforeEach(() => {
    reflector = new Reflector();
    mockPrisma = {
      user: {
        findUnique: vi.fn(),
      },
    };
    guard = new RolesGuard(reflector, mockPrisma);
    userRepo = new InMemoryUserRepository();
    updateRoleUseCase = new UpdateUserRoleUseCase(userRepo);
    updatePermissionsUseCase = new UpdateUserPermissionsUseCase(userRepo);
  });

  const createMockContext = (
    user: any,
    options?: { roles?: string[]; permissions?: string[] },
  ) => {
    vi.spyOn(reflector, 'getAllAndOverride').mockImplementation((key: string) => {
      if (key === ROLES_KEY) return options?.roles ?? ['admin', 'super_admin'];
      if (key === PERMISSIONS_KEY) return options?.permissions ?? [];
      return null;
    });

    const request: any = { user };
    const context: Partial<ExecutionContext> = {
      getHandler: () => ({}),
      getClass: () => ({}),
      switchToHttp: () => ({
        getRequest: () => request,
        getResponse: () => ({}),
        getNext: () => ({}),
      }),
    };
    return { context: context as ExecutionContext, request };
  };

  describe('RolesGuard with Site Manager Role', () => {
    it('grants access to site_manager when required permission is assigned', async () => {
      const { context } = createMockContext(
        { sub: 'sm-1', role: 'site_manager' },
        {
          roles: ['admin', 'super_admin', 'site_manager'],
          permissions: ['admin:orders'],
        },
      );

      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'sm-1',
        isActive: true,
        status: 'ACTIVE',
        roles: [{ role: { code: 'SITE_MANAGER' } }],
        userPermissions: [
          { permission: { code: 'admin:orders' } },
          { permission: { code: 'admin:products' } },
        ],
      });

      const allowed = await guard.canActivate(context);
      expect(allowed).toBe(true);
    });

    it('denies access (403) to site_manager when required permission is NOT assigned', async () => {
      const { context } = createMockContext(
        { sub: 'sm-2', role: 'site_manager' },
        {
          roles: ['admin', 'super_admin', 'site_manager'],
          permissions: ['admin:articles'],
        },
      );

      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'sm-2',
        isActive: true,
        status: 'ACTIVE',
        roles: [{ role: { code: 'SITE_MANAGER' } }],
        userPermissions: [{ permission: { code: 'admin:orders' } }],
      });

      await expect(guard.canActivate(context)).rejects.toThrow(ForbiddenException);
    });

    it('denies access (403) when site_manager attempts to access admin-only operations (e.g. role modification)', async () => {
      const { context } = createMockContext(
        { sub: 'sm-3', role: 'site_manager' },
        {
          roles: ['admin', 'super_admin'], // strictly admin only!
        },
      );

      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'sm-3',
        isActive: true,
        status: 'ACTIVE',
        roles: [{ role: { code: 'SITE_MANAGER' } }],
        userPermissions: [
          { permission: { code: 'admin:orders' } },
          { permission: { code: 'admin:users' } },
        ],
      });

      await expect(guard.canActivate(context)).rejects.toThrow(ForbiddenException);
    });

    it('allows super_admin full unrestricted access across all endpoints without permission checks', async () => {
      const { context } = createMockContext(
        { sub: 'admin-root', role: 'admin' },
        {
          roles: ['admin', 'super_admin'],
          permissions: ['admin:articles'],
        },
      );

      const allowed = await guard.canActivate(context);
      expect(allowed).toBe(true);
      expect(mockPrisma.user.findUnique).not.toHaveBeenCalled();
    });

    it('denies access (403) to customer or partner attempting to access admin endpoints', async () => {
      const { context } = createMockContext(
        { sub: 'cust-1', role: 'customer' },
        {
          roles: ['admin', 'super_admin', 'site_manager'],
          permissions: ['admin:orders'],
        },
      );

      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'cust-1',
        isActive: true,
        status: 'ACTIVE',
        roles: [{ role: { code: 'CUSTOMER' } }],
        userPermissions: [],
      });

      await expect(guard.canActivate(context)).rejects.toThrow(ForbiddenException);
    });
  });

  describe('Use Cases: Assigning & Modifying Site Manager Role and Permissions', () => {
    it('promotes user to site_manager with initial permissions', async () => {
      const user = new User({
        id: 'u-100',
        email: Email.create('user@example.com'),
        phone: PhoneNumber.create('09121234567'),
        name: 'علی تقوی',
        isActive: true,
        role: 'customer',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      await userRepo.save(user);

      const updated = await updateRoleUseCase.execute({
        userId: 'u-100',
        role: 'site_manager',
        permissions: ['admin:orders', 'admin:products'],
      });

      expect(updated.role).toBe('site_manager');
      expect(updated.permissions).toEqual(['admin:orders', 'admin:products']);

      const found = await userRepo.findById('u-100');
      expect(found?.role).toBe('site_manager');
      expect(found?.permissions).toEqual(['admin:orders', 'admin:products']);
    });

    it('updates site_manager permissions via UpdateUserPermissionsUseCase', async () => {
      const user = new User({
        id: 'u-200',
        email: Email.create('sm@example.com'),
        phone: PhoneNumber.create('09129876543'),
        name: 'سایتگردان شماره یک',
        isActive: true,
        role: 'site_manager',
        permissions: ['admin:orders'],
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      await userRepo.save(user);

      const updated = await updatePermissionsUseCase.execute({
        userId: 'u-200',
        permissions: ['admin:orders', 'admin:invoices', 'admin:support'],
      });

      expect(updated.permissions).toEqual(['admin:orders', 'admin:invoices', 'admin:support']);
      const found = await userRepo.findById('u-200');
      expect(found?.permissions).toEqual(['admin:orders', 'admin:invoices', 'admin:support']);
    });

    it('revoking site_manager role clears all assigned permissions', async () => {
      const user = new User({
        id: 'u-300',
        email: Email.create('sm2@example.com'),
        phone: PhoneNumber.create('09125554433'),
        name: 'سایتگردان سابق',
        isActive: true,
        role: 'site_manager',
        permissions: ['admin:orders', 'admin:invoices', 'admin:articles'],
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      await userRepo.save(user);

      // Revoke role by resetting to customer
      const demoted = await updateRoleUseCase.execute({
        userId: 'u-300',
        role: 'customer',
      });

      expect(demoted.role).toBe('customer');
      expect(demoted.permissions).toEqual([]);

      const found = await userRepo.findById('u-300');
      expect(found?.role).toBe('customer');
      expect(found?.permissions).toEqual([]);
    });
  });
});
