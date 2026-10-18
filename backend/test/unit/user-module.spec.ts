import { describe, it, expect, beforeEach } from 'vitest';
import { GetAllUsersUseCase } from '../../src/application/use-cases/user/get-all-users.use-case.js';
import { UpdateUserRoleUseCase } from '../../src/application/use-cases/user/update-user-role.use-case.js';
import { UpdateUserStatusUseCase } from '../../src/application/use-cases/user/update-user-status.use-case.js';
import { UpdateUserUseCase } from '../../src/application/use-cases/user/update-user.use-case.js';
import { DeleteUserUseCase } from '../../src/application/use-cases/user/delete-user.use-case.js';
import { GetUserByIdUseCase } from '../../src/application/use-cases/user/get-user-by-id.use-case.js';
import { CreateUserUseCase } from '../../src/application/use-cases/user/create-user.use-case.js';
import { GetUserAddressesUseCase } from '../../src/application/use-cases/user/get-user-addresses.use-case.js';
import { GetUserCartUseCase } from '../../src/application/use-cases/user/get-user-cart.use-case.js';
import { GetUserOrdersUseCase } from '../../src/application/use-cases/user/get-user-orders.use-case.js';
import { GetUserInvoicesUseCase } from '../../src/application/use-cases/user/get-user-invoices.use-case.js';
import { GetUserWalletUseCase } from '../../src/application/use-cases/user/get-user-wallet.use-case.js';
import { GetUserFavoritesUseCase } from '../../src/application/use-cases/user/get-user-favorites.use-case.js';
import { GetUserRfqUseCase } from '../../src/application/use-cases/user/get-user-rfq.use-case.js';
import { GetUserAuthenticityUseCase } from '../../src/application/use-cases/user/get-user-authenticity.use-case.js';
import { GetUserLoyaltyUseCase } from '../../src/application/use-cases/user/get-user-loyalty.use-case.js';
import { GetUserSessionsUseCase } from '../../src/application/use-cases/user/get-user-sessions.use-case.js';
import { RevokeUserSessionUseCase } from '../../src/application/use-cases/user/revoke-user-session.use-case.js';
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
  let getUserAddressesUseCase: GetUserAddressesUseCase;
  let getUserCartUseCase: GetUserCartUseCase;
  let getUserOrdersUseCase: GetUserOrdersUseCase;
  let getUserInvoicesUseCase: GetUserInvoicesUseCase;
  let getUserWalletUseCase: GetUserWalletUseCase;
  let getUserFavoritesUseCase: GetUserFavoritesUseCase;
  let getUserRfqUseCase: GetUserRfqUseCase;
  let getUserAuthenticityUseCase: GetUserAuthenticityUseCase;
  let getUserLoyaltyUseCase: GetUserLoyaltyUseCase;
  let getUserSessionsUseCase: GetUserSessionsUseCase;
  let revokeUserSessionUseCase: RevokeUserSessionUseCase;

  beforeEach(() => {
    userRepo = new InMemoryUserRepository();
    getAllUsersUseCase = new GetAllUsersUseCase(userRepo);
    updateUserRoleUseCase = new UpdateUserRoleUseCase(userRepo);
    updateUserStatusUseCase = new UpdateUserStatusUseCase(userRepo);
    updateUserUseCase = new UpdateUserUseCase(userRepo);
    deleteUserUseCase = new DeleteUserUseCase(userRepo);
    getUserByIdUseCase = new GetUserByIdUseCase(userRepo);
    createUserUseCase = new CreateUserUseCase(userRepo);
    getUserAddressesUseCase = new GetUserAddressesUseCase(userRepo);
    getUserCartUseCase = new GetUserCartUseCase(userRepo);
    getUserOrdersUseCase = new GetUserOrdersUseCase(userRepo);
    getUserInvoicesUseCase = new GetUserInvoicesUseCase(userRepo);
    getUserWalletUseCase = new GetUserWalletUseCase(userRepo);
    getUserFavoritesUseCase = new GetUserFavoritesUseCase(userRepo);
    getUserRfqUseCase = new GetUserRfqUseCase(userRepo);
    getUserAuthenticityUseCase = new GetUserAuthenticityUseCase(userRepo);
    getUserLoyaltyUseCase = new GetUserLoyaltyUseCase(userRepo);
    getUserSessionsUseCase = new GetUserSessionsUseCase(userRepo);
    revokeUserSessionUseCase = new RevokeUserSessionUseCase(userRepo);
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

  describe('User Detail Subsystems (11 Tabs)', () => {
    const erfanId = '00000000-0000-4000-a000-000000000001';

    it('Tab 2: should fetch user addresses', async () => {
      const addresses = await getUserAddressesUseCase.execute(erfanId);
      expect(addresses.length).toBeGreaterThanOrEqual(2);
      expect(addresses[0].title).toBe('دفتر مرکزی تهران');
      expect(addresses[0].isDefault).toBe(true);
    });

    it('Tab 3: should fetch user active cart and items', async () => {
      const cart = await getUserCartUseCase.execute(erfanId);
      expect(cart).toBeDefined();
      expect(cart?.items.length).toBe(3);
      expect(cart?.totalItems).toBe(6);
      expect(cart?.totalAmount).toBe(159000000);
      expect(cart?.items[0].sku).toBe('WS-C2960X-24PS-L');
    });

    it('Tab 4: should fetch user order history with items', async () => {
      const orders = await getUserOrdersUseCase.execute(erfanId);
      expect(orders.length).toBe(3);
      expect(orders[0].orderNumber).toBe('VX-9421');
      expect(orders[0].status).toBe('delivered');
      expect(orders[0].items[0].serialNumbers).toContain('FOC2140S09A');
    });

    it('Tab 5: should fetch user invoices', async () => {
      const invoices = await getUserInvoicesUseCase.execute(erfanId);
      expect(invoices.length).toBe(2);
      expect(invoices[0].invoiceNumber).toBe('INV-1403-089');
      expect(invoices[0].type).toBe('OFFICIAL');
      expect(invoices[0].paymentStatus).toBe('PAID');
    });

    it('Tab 6: should fetch user wallet balance and transactions', async () => {
      const wallet = await getUserWalletUseCase.execute(erfanId);
      expect(wallet).toBeDefined();
      expect(wallet?.balance).toBe(25000000);
      expect(wallet?.transactions.length).toBe(4);
      expect(wallet?.withdrawals.length).toBe(1);
      expect(wallet?.withdrawals[0].status).toBe('COMPLETED');
    });

    it('Tab 7: should fetch user favorite products', async () => {
      const favorites = await getUserFavoritesUseCase.execute(erfanId);
      expect(favorites.length).toBe(3);
      expect(favorites.some((f) => f.slug === 'cisco-catalyst-2960x-24ps-l')).toBe(true);
    });

    it('Tab 8: should fetch user RFQ inquiries', async () => {
      const rfqs = await getUserRfqUseCase.execute(erfanId);
      expect(rfqs.length).toBe(2);
      expect(rfqs[0].rfqNumber).toBe('RFQ-1403-012');
      expect(rfqs[0].status).toBe('quoted');
      expect(rfqs[0].items.length).toBeGreaterThan(0);
    });

    it('Tab 9: should fetch user authenticity and warranty checks', async () => {
      const authList = await getUserAuthenticityUseCase.execute(erfanId);
      expect(authList.length).toBe(3);
      expect(authList[0].serialNumber).toBe('FOC2140S09A');
      expect(authList[0].isAuthentic).toBe(true);
      expect(authList[0].status).toBe('active');
      expect(authList[2].isAuthentic).toBe(false);
      expect(authList[2].status).toBe('invalid');
    });

    it('Tab 10: should fetch user loyalty points and tier', async () => {
      const loyalty = await getUserLoyaltyUseCase.execute(erfanId);
      expect(loyalty).toBeDefined();
      expect(loyalty?.pointsBalance).toBe(1450);
      expect(loyalty?.tierCode).toBe('GOLD');
      expect(loyalty?.transactions.length).toBe(3);
    });

    it('Tab 11: should fetch user sessions and revoke a session', async () => {
      const sessions = await getUserSessionsUseCase.execute(erfanId);
      expect(sessions.length).toBe(4);
      expect(sessions[0].browser).toContain('Chrome');
      expect(sessions[0].isRevoked).toBe(false);

      // Revoke sess-1
      const revoked = await revokeUserSessionUseCase.execute(erfanId, 'sess-1');
      expect(revoked).toBe(true);

      const afterRevoke = await getUserSessionsUseCase.execute(erfanId);
      const target = afterRevoke.find((s) => s.id === 'sess-1');
      expect(target?.isRevoked).toBe(true);
    });

    it('should throw UserNotFoundException if querying a non-existent user id', async () => {
      const fakeId = '00000000-0000-0000-0000-999999999999';
      await expect(getUserAddressesUseCase.execute(fakeId)).rejects.toThrow(UserNotFoundException);
      await expect(getUserCartUseCase.execute(fakeId)).rejects.toThrow(UserNotFoundException);
      await expect(getUserOrdersUseCase.execute(fakeId)).rejects.toThrow(UserNotFoundException);
      await expect(getUserInvoicesUseCase.execute(fakeId)).rejects.toThrow(UserNotFoundException);
      await expect(getUserWalletUseCase.execute(fakeId)).rejects.toThrow(UserNotFoundException);
      await expect(getUserFavoritesUseCase.execute(fakeId)).rejects.toThrow(UserNotFoundException);
      await expect(getUserRfqUseCase.execute(fakeId)).rejects.toThrow(UserNotFoundException);
      await expect(getUserAuthenticityUseCase.execute(fakeId)).rejects.toThrow(UserNotFoundException);
      await expect(getUserLoyaltyUseCase.execute(fakeId)).rejects.toThrow(UserNotFoundException);
      await expect(getUserSessionsUseCase.execute(fakeId)).rejects.toThrow(UserNotFoundException);
      await expect(revokeUserSessionUseCase.execute(fakeId, 'sess-1')).rejects.toThrow(UserNotFoundException);
    });
  });
});
