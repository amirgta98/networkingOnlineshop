import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ExecutionContext, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from '../../src/presentation/guards/roles.guard.js';

describe('RolesGuard', () => {
  let reflector: Reflector;
  let mockPrisma: any;
  let guard: RolesGuard;

  beforeEach(() => {
    reflector = new Reflector();
    mockPrisma = {
      user: {
        findUnique: vi.fn(),
      },
    };
    guard = new RolesGuard(reflector, mockPrisma);
  });

  const createMockContext = (user: any, handlerRoles: string[] = ['admin', 'super_admin']) => {
    vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue(handlerRoles);
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

  it('allows access immediately when token already contains an admin role', async () => {
    const { context } = createMockContext({ sub: 'user-1', role: 'admin' });
    const result = await guard.canActivate(context);
    expect(result).toBe(true);
    expect(mockPrisma.user.findUnique).not.toHaveBeenCalled();
  });

  it('throws ForbiddenException when role is customer and database also has no admin role', async () => {
    const { context } = createMockContext({ sub: 'user-2', role: 'customer' });
    mockPrisma.user.findUnique.mockResolvedValue({
      id: 'user-2',
      isActive: true,
      status: 'ACTIVE',
      roles: [{ role: { code: 'CUSTOMER' } }],
    });

    await expect(guard.canActivate(context)).rejects.toThrow(ForbiddenException);
  });

  it('allows newly promoted admin when token has role customer but DB has SUPER_ADMIN', async () => {
    const { context, request } = createMockContext({ sub: 'user-3', role: 'customer' });
    mockPrisma.user.findUnique.mockResolvedValue({
      id: 'user-3',
      isActive: true,
      status: 'ACTIVE',
      roles: [{ role: { code: 'SUPER_ADMIN' } }],
    });

    const result = await guard.canActivate(context);
    expect(result).toBe(true);
    expect(request.user.role).toBe('admin');
  });

  it('allows newly promoted admin when DB has STAFF_MANAGER', async () => {
    const { context, request } = createMockContext({ sub: 'user-4', role: 'customer' });
    mockPrisma.user.findUnique.mockResolvedValue({
      id: 'user-4',
      isActive: true,
      status: 'ACTIVE',
      roles: [{ role: { code: 'STAFF_MANAGER' } }],
    });

    const result = await guard.canActivate(context);
    expect(result).toBe(true);
    expect(request.user.role).toBe('admin');
  });

  it('throws UnauthorizedException when no user is attached to request', async () => {
    const { context } = createMockContext(null);
    await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
  });
});
