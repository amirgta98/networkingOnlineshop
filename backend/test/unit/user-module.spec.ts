import { describe, it, expect, beforeEach } from 'vitest';
import { GetAllUsersUseCase } from '../../src/application/use-cases/user/get-all-users.use-case.js';
import { UpdateUserRoleUseCase } from '../../src/application/use-cases/user/update-user-role.use-case.js';
import { UpdateUserStatusUseCase } from '../../src/application/use-cases/user/update-user-status.use-case.js';
import { UpdateUserUseCase } from '../../src/application/use-cases/user/update-user.use-case.js';
import { DeleteUserUseCase } from '../../src/application/use-cases/user/delete-user.use-case.js';
import { GetUserByIdUseCase } from '../../src/application/use-cases/user/get-user-by-id.use-case.js';
import { CreateUserUseCase } from '../../src/application/use-cases/user/create-user.use-case.js';
import { InMemoryUserRepository } from '../../src/infrastructure/database/in-memory/in-memory-user.repository.js';
import { UserNotFoundException } from '../../src/domain/exceptions/user-not-found.exception.js';

describe('User Management Module (Unit Test)', () => {
  let userRepo: InMemoryUserRepository;
  let getAllUsersUseCase: GetAllUsersUseCase;
  let updateUserRoleUseCase: UpdateUserRoleUseCase;
  let updateUserStatusUseCase: UpdateUserStatusUseCase;
  let updateUserUseCase: UpdateUserUseCase;
  let deleteUserUseCase: DeleteUserUseCase;
  let getUserByIdUseCase: GetUserByIdUseCase;
  let createUserUseCase: CreateUserUseCase;

  beforeEach(() => {
    userRepo = new InMemoryUserRepository();
    getAllUsersUseCase = new GetAllUsersUseCase(userRepo);
    updateUserRoleUseCase = new UpdateUserRoleUseCase(userRepo);
    updateUserStatusUseCase = new UpdateUserStatusUseCase(userRepo);
    updateUserUseCase = new UpdateUserUseCase(userRepo);
    deleteUserUseCase = new DeleteUserUseCase(userRepo);
    getUserByIdUseCase = new GetUserByIdUseCase(userRepo);
    createUserUseCase = new CreateUserUseCase(userRepo);
  });

  it('should list all seeded users', async () => {
    const users = await getAllUsersUseCase.execute();
    expect(users.length).toBeGreaterThanOrEqual(7);

    const erfan = users.find((u) => u.phone?.value === '09162947221');
    expect(erfan).toBeDefined();
    expect(erfan?.name).toBe('عرفان سعیدی');
    expect(erfan?.role).toBe('admin');
    expect(erfan?.status).toBe('active');
    expect(erfan?.companyName).toContain('ققنوس');
  });

  it('should filter users by role', async () => {
    const b2bUsers = await getAllUsersUseCase.execute({ role: 'partner_b2b' });
    expect(b2bUsers.length).toBeGreaterThan(0);
    expect(b2bUsers.every((u) => u.role === 'partner_b2b' || u.role === 'partner')).toBe(true);

    const adminUsers = await getAllUsersUseCase.execute({ role: 'admin' });
    expect(adminUsers.length).toBeGreaterThan(0);
    expect(adminUsers.every((u) => u.role === 'admin')).toBe(true);
  });

  it('should filter users by status', async () => {
    const suspended = await getAllUsersUseCase.execute({ status: 'suspended' });
    expect(suspended.length).toBe(1);
    expect(suspended[0].phone?.value).toBe('09350001122');
  });

  it('should search users by name, phone, national code, or company', async () => {
    const byName = await getAllUsersUseCase.execute({ search: 'رستمی' });
    expect(byName.length).toBe(1);
    expect(byName[0].name).toBe('مهندس کامران رستمی');

    const byPhone = await getAllUsersUseCase.execute({ search: '09162947222' });
    expect(byPhone.length).toBe(1);
    expect(byPhone[0].name).toBe('مهندس کامران رستمی');

    const byNational = await getAllUsersUseCase.execute({ search: '۱۰۱۰۳۸۴۹۲۰۱' });
    expect(byNational.length).toBe(1);
    expect(byNational[0].name).toBe('مهندس کامران رستمی');

    const byCompany = await getAllUsersUseCase.execute({ search: 'داده‌گستر' });
    expect(byCompany.length).toBe(1);
    expect(byCompany[0].companyName).toContain('داده‌گستر');
  });

  it('should update user role and register activity', async () => {
    const erfanId = '00000000-0000-4000-a000-000000000001';
    const updated = await updateUserRoleUseCase.execute({
      userId: erfanId,
      role: 'sales_manager',
    });

    expect(updated.role).toBe('sales_manager');

    // Verify persisted
    const fetched = await userRepo.findById(erfanId);
    expect(fetched?.role).toBe('sales_manager');
    expect(fetched?.activities[0].action).toContain('sales_manager');
  });

  it('should toggle user status between active and suspended', async () => {
    const userId = '00000000-0000-4000-a000-000000000003'; // علیرضا رضوانی
    const suspended = await updateUserStatusUseCase.execute({
      userId,
      status: 'suspended',
    });
    expect(suspended.status).toBe('suspended');
    expect(suspended.isActive).toBe(false);

    const activated = await updateUserStatusUseCase.execute({
      userId,
      status: 'active',
    });
    expect(activated.status).toBe('active');
    expect(activated.isActive).toBe(true);
  });

  it('should update user profile details', async () => {
    const userId = '00000000-0000-4000-a000-000000000003';
    const updated = await updateUserUseCase.execute({
      userId,
      name: 'علیرضا رضوانی تبریزی',
      companyName: 'فروشگاه رضوانی',
      notes: 'توضیحات تست جدید',
    });

    expect(updated.name).toBe('علیرضا رضوانی تبریزی');
    expect(updated.companyName).toBe('فروشگاه رضوانی');
    expect(updated.notes).toBe('توضیحات تست جدید');
  });

  it('should create and delete user', async () => {
    const created = await createUserUseCase.execute({
      name: 'کاربر جدید تستی',
      email: 'new-user@test.local',
      phone: '09129990000',
      role: 'customer',
      status: 'active',
    });

    expect(created.id).toBeDefined();

    const fetched = await getUserByIdUseCase.execute(created.id);
    expect(fetched.name).toBe('کاربر جدید تستی');

    const delRes = await deleteUserUseCase.execute(created.id);
    expect(delRes.success).toBe(true);

    await expect(getUserByIdUseCase.execute(created.id)).rejects.toThrow(UserNotFoundException);
  });

  it('should reject invalid role update', async () => {
    const erfanId = '00000000-0000-4000-a000-000000000001';
    await expect(
      updateUserRoleUseCase.execute({
        userId: erfanId,
        role: 'invalid_role_hacker',
      }),
    ).rejects.toThrow("Invalid role 'invalid_role_hacker'");
  });

  it('should reject invalid status update', async () => {
    const erfanId = '00000000-0000-4000-a000-000000000001';
    await expect(
      updateUserStatusUseCase.execute({
        userId: erfanId,
        status: 'invalid_status_xyz',
      }),
    ).rejects.toThrow("Invalid status 'invalid_status_xyz'");
  });

  it('should reject creating a user with a duplicate phone number', async () => {
    await expect(
      createUserUseCase.execute({
        name: 'عرفان دوم',
        email: 'erfan2@fonix-academic.ir',
        phone: '09162947221', // Already belongs to Erfan Saeedi
      }),
    ).rejects.toThrow();
  });
});
