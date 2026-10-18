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
import { UserInvoiceResponseDto } from '../../src/presentation/dto/response/user-details/user-invoices.response.dto.js';

import { User } from '../../src/domain/entities/user.entity.js';
import { Email } from '../../src/domain/value-objects/email.vo.js';
import { PhoneNumber } from '../../src/domain/value-objects/phone-number.vo.js';
import { UserAddressEntity } from '../../src/domain/entities/user-address.entity.js';

function seedTestFixtures(userRepo: InMemoryUserRepository) {
  const erfanId = '00000000-0000-4000-a000-000000000001';
  const adminUser = new User({
    id: erfanId,
    name: 'عرفان سعیدی',
    email: Email.create('admin@fonix-academic.ir'),
    phone: PhoneNumber.create('09162947221'),
    phoneVerifiedAt: new Date(),
    isActive: true,
    role: 'admin',
    status: 'active',
    createdAt: new Date(Date.now() - 365 * 24 * 3600 * 1000),
    updatedAt: new Date(),
    nationalCode: '۰۰۷۹۸۲۳۴۰۱',
    nationalCodeVerified: true,
    companyName: 'تجهیزات شبکه ققنوس آکادمی (صاحب وبسایت)',
    userTier: 'gold',
    notes: 'دسترسی مدیر ارشد و مالک کل سیستم (SuperAdmin & Root).',
    ordersCount: 48,
    totalSpent: 840000000,
    walletBalance: 25000000,
    lastLogin: 'امروز - ۱۰:۴۸',
    activities: [
      {
        id: 'act-1',
        action: 'ورود موفق با اعتبارسنجی دو مرحله‌ای ۲FA',
        timestamp: 'امروز - ۱۰:۴۸',
        ip: '185.143.232.14',
        device: 'Chrome / Windows 11',
      },
    ],
    security: {
      twoFactorEnabled: true,
      twoFactorMethod: 'PIN',
    },
  });
  userRepo.save(adminUser);

  const owner = new User({
    id: '00000000-0000-4000-a000-000000000097',
    name: 'صاحب وبسایت و مدیر ارشد',
    email: Email.create('owner@fonix-academic.ir'),
    phone: PhoneNumber.create('09134761097'),
    phoneVerifiedAt: new Date(),
    isActive: true,
    role: 'admin',
    status: 'active',
    createdAt: new Date(Date.now() - 400 * 24 * 3600 * 1000),
    updatedAt: new Date(),
    companyName: 'ققنوس آکادمی',
  });
  userRepo.save(owner);

  const arash = new User({
    id: '00000000-0000-4000-a000-000000000002',
    name: 'مهندس آرش کریمی',
    email: Email.create('arash.karimi@fonix-academic.ir'),
    phone: PhoneNumber.create('09121112233'),
    phoneVerifiedAt: new Date(),
    isActive: true,
    role: 'sales_manager',
    status: 'active',
    createdAt: new Date(Date.now() - 180 * 24 * 3600 * 1000),
    updatedAt: new Date(),
  });
  userRepo.save(arash);

  const rezvani = new User({
    id: '00000000-0000-4000-a000-000000000003',
    name: 'علیرضا رضوانی',
    email: Email.create('customer@fonix-academic.ir'),
    phone: PhoneNumber.create('09162947223'),
    phoneVerifiedAt: new Date(),
    isActive: true,
    role: 'customer',
    status: 'active',
    createdAt: new Date(Date.now() - 120 * 24 * 3600 * 1000),
    updatedAt: new Date(),
  });
  userRepo.save(rezvani);

  const rostami = new User({
    id: '00000000-0000-4000-a000-000000000004',
    name: 'مهندس کامران رستمی',
    email: Email.create('rostami@kahkeshan-net.ir'),
    phone: PhoneNumber.create('09162947222'),
    phoneVerifiedAt: new Date(),
    isActive: true,
    role: 'partner_b2b',
    status: 'active',
    nationalCode: '۱۰۱۰۳۸۴۹۲۰۱',
    companyName: 'شرکت داده‌گستر کهکشان ارتباط',
    createdAt: new Date(Date.now() - 250 * 24 * 3600 * 1000),
    updatedAt: new Date(),
  });
  userRepo.save(rostami);

  const suspended = new User({
    id: '00000000-0000-4000-a000-000000000005',
    name: 'نیما یوسفی',
    email: Email.create('nima.yousefi@yahoo.com'),
    phone: PhoneNumber.create('09350001122'),
    phoneVerifiedAt: new Date(),
    isActive: false,
    role: 'customer',
    status: 'suspended',
    createdAt: new Date(Date.now() - 90 * 24 * 3600 * 1000),
    updatedAt: new Date(),
  });
  userRepo.save(suspended);

  const pending = new User({
    id: '00000000-0000-4000-a000-000000000006',
    name: 'کاربر معلق تستی',
    email: Email.create('pending@test.local'),
    phone: PhoneNumber.create('09350001123'),
    isActive: true,
    role: 'customer',
    status: 'pending_verification',
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  userRepo.save(pending);

  // Subsystems for erfanId
  userRepo.setAddresses(erfanId, [
    new UserAddressEntity({
      id: 'addr-erfan-1',
      userId: erfanId,
      title: 'دفتر مرکزی تهران',
      type: 'CENTRAL_OFFICE',
      recipientFirstName: 'عرفان',
      recipientLastName: 'سعیدی',
      recipientMobile: '09162947221',
      province: 'تهران',
      city: 'تهران',
      detailedAddress: 'خیابان ولیعصر',
      postalCode: '1969713111',
      isDefault: true,
    }),
    new UserAddressEntity({
      id: 'addr-erfan-2',
      userId: erfanId,
      title: 'انبار مرکزی',
      type: 'CENTRAL_WAREHOUSE',
      recipientFirstName: 'انباردار',
      recipientLastName: 'ققنوس',
      recipientMobile: '09162947221',
      province: 'تهران',
      city: 'تهران',
      detailedAddress: 'جاده مخصوص',
      postalCode: '1398814522',
      isDefault: false,
    }),
  ]);

  userRepo.setCart(erfanId, {
    id: 'cart-erfan-active',
    userId: erfanId,
    totalItems: 6,
    totalAmount: 159000000,
    updatedAt: new Date(),
    items: [
      {
        id: 'cart-item-1',
        productId: 'prod-cisco-2960x',
        title: 'سوئیچ سیسکو ۲۴ پورت Catalyst 2960X-24PS-L',
        sku: 'WS-C2960X-24PS-L',
        unitPrice: 42500000,
        quantity: 2,
        totalPrice: 85000000,
        inStock: true,
      },
      {
        id: 'cart-item-2',
        productId: 'prod-mikrotik-ccr2004',
        title: 'روتر برد کلود کور میکروتیک CCR2004-16G-2S+',
        sku: 'CCR2004-16G-2S+',
        unitPrice: 32000000,
        quantity: 2,
        totalPrice: 64000000,
        inStock: true,
      },
      {
        id: 'cart-item-3',
        productId: 'prod-sfp-plus-10g',
        title: 'ماژول فیبر نوری ۱۰ گیگ سیسکو SFP-10G-SR',
        sku: 'SFP-10G-SR',
        unitPrice: 5000000,
        quantity: 2,
        totalPrice: 10000000,
        inStock: true,
      },
    ],
  });

  userRepo.setOrders(erfanId, [
    {
      id: 'ord-1',
      orderNumber: 'VX-9421',
      trackingCode: 'TRK-9421001',
      userId: erfanId,
      status: 'delivered',
      statusLabel: 'تحویل موفق',
      customerType: 'b2b',
      customerName: 'عرفان سعیدی',
      phoneNumber: '09162947221',
      companyName: 'تجهیزات شبکه ققنوس آکادمی',
      totalAmount: 120000000,
      discountAmount: 6000000,
      vatTaxAmount: 11400000,
      payableAmount: 125400000,
      paymentMethod: 'bank_transfer_satna',
      shippingCost: 0,
      createdAt: new Date(),
      items: [
        {
          id: 'item-1',
          productId: 'prod-1',
          title: 'سوئیچ ۲۴ پورت سیسکو',
          sku: 'WS-C2960X-24PS-L',
          unitPrice: 40000000,
          quantity: 3,
          totalPrice: 120000000,
          serialNumbers: ['FOC2140S09A'],
        },
      ],
    },
    {
      id: 'ord-2',
      orderNumber: 'VX-8832',
      trackingCode: 'TRK-8832002',
      userId: erfanId,
      status: 'delivered',
      statusLabel: 'تحویل موفق',
      customerType: 'b2b',
      customerName: 'عرفان سعیدی',
      phoneNumber: '09162947221',
      totalAmount: 85000000,
      discountAmount: 0,
      vatTaxAmount: 8500000,
      payableAmount: 93500000,
      paymentMethod: 'online_gateway',
      shippingCost: 0,
      createdAt: new Date(),
      items: [],
    },
    {
      id: 'ord-3',
      orderNumber: 'VX-7210',
      trackingCode: 'TRK-7210003',
      userId: erfanId,
      status: 'delivered',
      statusLabel: 'تحویل موفق',
      customerType: 'b2b',
      customerName: 'عرفان سعیدی',
      phoneNumber: '09162947221',
      totalAmount: 45000000,
      discountAmount: 0,
      vatTaxAmount: 4500000,
      payableAmount: 49500000,
      paymentMethod: 'online_gateway',
      shippingCost: 0,
      createdAt: new Date(),
      items: [],
    },
  ]);

  userRepo.setInvoices(erfanId, [
    {
      id: 'inv-1',
      invoiceNumber: 'INV-1403-089',
      trackingCode: 'TRK-INV-089',
      userId: erfanId,
      type: 'OFFICIAL',
      status: 'ISSUED',
      paymentStatus: 'PAID',
      subtotal: 85000000,
      taxAmount: 8500000,
      discountAmount: 0,
      shippingCost: 1950000,
      totalAmount: 95450000,
      customerName: 'عرفان سعیدی',
      customerPhone: '09162947221',
      createdAt: new Date().toISOString(),
      items: [
        {
          id: 'inv-item-1',
          title: 'سوئیچ ۲۴ پورت سیسکو',
          quantity: 2,
          unitPrice: 42500000,
          totalPrice: 85000000,
          taxAmount: 8500000,
        },
      ],
    },
    {
      id: 'inv-2',
      invoiceNumber: 'INV-1403-042',
      trackingCode: 'TRK-INV-042',
      userId: erfanId,
      type: 'UNOFFICIAL',
      status: 'ISSUED',
      paymentStatus: 'PAID',
      subtotal: 40000000,
      taxAmount: 0,
      discountAmount: 0,
      shippingCost: 0,
      totalAmount: 40000000,
      customerName: 'عرفان سعیدی',
      customerPhone: '09162947221',
      createdAt: new Date().toISOString(),
      items: [],
    },
  ]);

  userRepo.setWallet(erfanId, {
    id: 'wallet-erfan',
    userId: erfanId,
    balance: 25000000,
    lockedBalance: 0,
    currency: 'IRT',
    isActive: true,
    transactions: [
      { id: 'tx-1', type: 'DEPOSIT', typeLabel: 'واریز', amount: 30000000, balanceBefore: 0, balanceAfter: 30000000, trackingCode: 'TRK-1', createdAt: new Date() },
      { id: 'tx-2', type: 'PURCHASE', typeLabel: 'خرید', amount: -10000000, balanceBefore: 30000000, balanceAfter: 20000000, trackingCode: 'TRK-2', createdAt: new Date() },
      { id: 'tx-3', type: 'CASHBACK', typeLabel: 'کش‌بک', amount: 5000000, balanceBefore: 20000000, balanceAfter: 25000000, trackingCode: 'TRK-3', createdAt: new Date() },
      { id: 'tx-4', type: 'PURCHASE', typeLabel: 'خرید', amount: -5000000, balanceBefore: 25000000, balanceAfter: 20000000, trackingCode: 'TRK-4', createdAt: new Date() },
    ],
    withdrawals: [
      { id: 'wd-1', amount: 5000000, status: 'COMPLETED', statusLabel: 'تسویه موفق', requestedAt: new Date() },
    ],
  });

  userRepo.setFavorites(erfanId, [
    { id: 'fav-1', productId: 'p1', title: 'Cisco 2960X', slug: 'cisco-catalyst-2960x-24ps-l', basePrice: 42000000, inStock: true, addedAt: new Date() },
    { id: 'fav-2', productId: 'p2', title: 'CCR2004', slug: 'mikrotik-ccr2004', basePrice: 32000000, inStock: true, addedAt: new Date() },
    { id: 'fav-3', productId: 'p3', title: 'SFP 10G', slug: 'sfp-10g-sr', basePrice: 5000000, inStock: true, addedAt: new Date() },
  ]);

  userRepo.setRfqInquiries(erfanId, [
    {
      id: 'rfq-1',
      rfqNumber: 'RFQ-1403-012',
      userId: erfanId,
      projectTitle: 'نوسازی سوئیچ‌های دیتا سنتر',
      clientPhone: '09162947221',
      status: 'quoted',
      statusLabel: 'پیش‌فاکتور صادر شد',
      urgent: true,
      deadlineHours: 24,
      discountPercent: 8,
      validityDays: 7,
      estimatedValue: 250000000,
      createdAt: new Date(),
      items: [{ id: 'it-1', sku: 'WS-C3850', title: 'Switch', requestedQty: 2, unitPrice: 120000000, stockStatus: 'available' }],
    },
    {
      id: 'rfq-2',
      rfqNumber: 'RFQ-1403-008',
      userId: erfanId,
      projectTitle: 'رک سروری',
      clientPhone: '09162947221',
      status: 'converted',
      statusLabel: 'تبدیل به خرید',
      urgent: false,
      deadlineHours: 48,
      discountPercent: 5,
      validityDays: 14,
      estimatedValue: 85000000,
      createdAt: new Date(),
      items: [],
    },
  ]);

  userRepo.setAuthenticityInquiries(erfanId, [
    { id: 'auth-1', userId: erfanId, serialNumber: 'FOC2140S09A', productName: 'Switch', brand: 'Cisco', status: 'active', statusLabel: 'اصیل', isAuthentic: true, daysRemaining: 450, createdAt: new Date() },
    { id: 'auth-2', userId: erfanId, serialNumber: 'MT7829104882', productName: 'Router', brand: 'MikroTik', status: 'active', statusLabel: 'اصیل', isAuthentic: true, daysRemaining: 335, createdAt: new Date() },
    { id: 'auth-3', userId: erfanId, serialNumber: 'FOC19020088X', productName: 'SFP', brand: 'Cisco', status: 'invalid', statusLabel: 'نامعتبر', isAuthentic: false, daysRemaining: 0, createdAt: new Date() },
  ]);

  userRepo.setLoyalty(erfanId, {
    id: 'loyalty-erfan',
    userId: erfanId,
    pointsBalance: 1450,
    lifetimePoints: 3200,
    tierCode: 'GOLD',
    tierTitle: 'باشگاه طلایی VIP',
    cashbackPercent: 5,
    transactions: [
      { id: 'ltx-1', type: 'EARN', points: 500, pointsBefore: 950, pointsAfter: 1450, createdAt: new Date() },
      { id: 'ltx-2', type: 'EARN', points: 250, pointsBefore: 700, pointsAfter: 950, createdAt: new Date() },
      { id: 'ltx-3', type: 'REDEEM', points: -200, pointsBefore: 900, pointsAfter: 700, createdAt: new Date() },
    ],
  });

  userRepo.setSessions(erfanId, [
    { id: 'sess-1', userId: erfanId, deviceName: 'PC', browser: 'Chrome 128', os: 'Windows 11', isCurrent: true, isRevoked: false, createdAt: new Date(), lastActiveAt: new Date(), expiresAt: new Date(Date.now() + 86400000) },
    { id: 'sess-2', userId: erfanId, deviceName: 'Mobile', browser: 'Safari', os: 'iOS 18', isCurrent: false, isRevoked: false, createdAt: new Date(), lastActiveAt: new Date(), expiresAt: new Date(Date.now() + 86400000) },
    { id: 'sess-3', userId: erfanId, deviceName: 'MacBook', browser: 'Firefox', os: 'macOS', isCurrent: false, isRevoked: false, createdAt: new Date(), lastActiveAt: new Date(), expiresAt: new Date(Date.now() + 86400000) },
    { id: 'sess-4', userId: erfanId, deviceName: 'Tablet', browser: 'Samsung', os: 'Android', isCurrent: false, isRevoked: true, createdAt: new Date(), lastActiveAt: new Date(), expiresAt: new Date(Date.now() + 86400000) },
  ]);
}

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
    seedTestFixtures(userRepo);
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

    it('Tab 5: should fetch user invoices and map to UserInvoiceResponseDto', async () => {
      const invoices = await getUserInvoicesUseCase.execute(erfanId);
      expect(invoices.length).toBe(2);
      expect(invoices[0].invoiceNumber).toBe('INV-1403-089');
      expect(invoices[0].type).toBe('OFFICIAL');
      expect(invoices[0].paymentStatus).toBe('PAID');

      const dtos = invoices.map((inv) => UserInvoiceResponseDto.fromDomain(inv));
      expect(dtos[0].invoiceNumber).toBe('INV-1403-089');
      expect(dtos[0].typeLabel).toContain('رسمی');
      expect(dtos[0].totalAmount).toBe(95450000);
      expect(dtos[0].items.length).toBe(1);
      expect(dtos[0].items[0].unitPrice).toBe(42500000);
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
