import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  AdminOrderNotificationService,
  MELIPAYAMAK_ORDER_NOTIFICATION_DEFAULT_BODY_ID,
  MELIPAYAMAK_CUSTOMER_ORDER_NOTIFICATION_DEFAULT_BODY_ID,
  MELIPAYAMAK_ORDER_SHIPPED_NOTIFICATION_DEFAULT_BODY_ID,
  toPersianDigits,
  formatTomanAmount,
  renderOrderPatternText,
  renderCustomerOrderPatternText,
  renderOrderShippedPatternText,
  formatCarrierName,
  CUSTOMER_ORDER_PATTERN_TEMPLATE,
  ORDER_SHIPPED_PATTERN_TEMPLATE,
} from '../../src/infrastructure/sms/admin-order-notification.service.js';
import { CreateOrderUseCase } from '../../src/application/use-cases/order/create-order.use-case.js';
import { AssignOrderCarrierUseCase } from '../../src/application/use-cases/order/assign-order-carrier.use-case.js';
import { UpdateOrderStatusUseCase } from '../../src/application/use-cases/order/update-order-status.use-case.js';
import { InMemoryOrderRepository } from '../../src/infrastructure/database/in-memory/in-memory-order.repository.js';
import { InMemoryUserRepository } from '../../src/infrastructure/database/in-memory/in-memory-user.repository.js';
import { InMemoryProductRepository } from '../../src/infrastructure/database/in-memory/in-memory-product.repository.js';
import { CompositeSmsProvider } from '../../src/infrastructure/sms/composite-sms.provider.js';
import { TelegramOtpService } from '../../src/infrastructure/sms/telegram-otp.service.js';
import { MelipayamakConsoleOtpProvider } from '../../src/infrastructure/sms/melipayamak-console-otp.provider.js';
import { MelipayamakBaseServiceProvider } from '../../src/infrastructure/sms/melipayamak-base-service.provider.js';
import type { ISmsProvider, SmsSendResult } from '../../src/infrastructure/sms/sms-provider.interface.js';
import { User } from '../../src/domain/entities/user.entity.js';
import { Order, OrderStatus } from '../../src/domain/entities/order.entity.js';
import { Product } from '../../src/domain/entities/product.entity.js';
import { Email } from '../../src/domain/value-objects/email.vo.js';
import { PhoneNumber } from '../../src/domain/value-objects/phone-number.vo.js';
import { EmptyOrderException } from '../../src/domain/exceptions/order.exceptions.js';

class MockSmsProvider implements ISmsProvider {
  public dispatchedPatterns: Array<{
    to: string;
    bodyId: number;
    args: string[];
    metadata?: any;
  }> = [];

  public customHandler?: (
    to: string,
    bodyId: number,
    args: string[],
  ) => Promise<SmsSendResult> | SmsSendResult;

  async sendOtp(_to: string, _code: string): Promise<SmsSendResult> {
    return { success: true, messageId: 'otp_mock' };
  }

  async sendPattern(
    to: string,
    bodyId: number,
    args: string[],
    metadata?: any,
  ): Promise<SmsSendResult> {
    this.dispatchedPatterns.push({ to, bodyId, args, metadata });
    if (this.customHandler) {
      return this.customHandler(to, bodyId, args);
    }
    return {
      success: true,
      messageId: `mock_ref_${Date.now()}_${Math.random()}`,
    };
  }
}

describe('Admin Order Notification via Melipayamak Pattern (Unit & Integration)', () => {
  let userRepo: InMemoryUserRepository;
  let orderRepo: InMemoryOrderRepository;
  let productRepo: InMemoryProductRepository;
  let mockSmsProvider: MockSmsProvider;
  let notificationService: AdminOrderNotificationService;
  let createOrderUseCase: CreateOrderUseCase;
  let assignOrderCarrierUseCase: AssignOrderCarrierUseCase;
  let updateOrderStatusUseCase: UpdateOrderStatusUseCase;

  const originalEnv = { ...process.env };

  const testCustomer = new User({
    id: 'user-customer-001',
    name: 'امیررضا یزدان پناه',
    email: Email.create('customer@example.com'),
    phone: PhoneNumber.create('09162947221'),
    role: 'customer',
    status: 'ACTIVE',
    isActive: true,
    firstName: 'امیررضا',
    lastName: 'یزدان پناه',
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const testProduct = new Product({
    id: 'prod-switch-100',
    name: 'سوئیچ ۲۴ پورت سیسکو',
    slug: 'cisco-switch-24',
    sku: 'WS-C2960X-24PS-L',
    price: 100000,
    originalPrice: 120000,
    shortDescription: 'سوئیچ سیسکو',
    brand: 'Cisco',
    category: 'switches',
    stock: 50,
    featured: false,
    hasOriginalWarranty: true,
    isFreeExpressShipping: false,
    rating: 5,
    reviewsCount: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  function createSampleOrder(
    orderNumber = '۱۲۳۴',
    payableAmount = 100000,
    phoneNumber = '09162947221',
  ): Order {
    return new Order({
      id: `order-${Date.now()}-${Math.random()}`,
      orderNumber,
      trackingCode: 'NET-12345678',
      userId: testCustomer.id,
      status: OrderStatus.PENDING_FINANCIAL,
      customerType: 'retail',
      customerName: 'امیررضا یزدان پناه',
      phoneNumber,
      totalAmount: payableAmount,
      discountAmount: 0,
      vatTaxAmount: 0,
      payableAmount,
      paymentMethod: 'online_gateway',
      items: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  beforeEach(async () => {
    process.env = { ...originalEnv };
    delete process.env.MELIPAYAMAK_ORDER_PATTERN_ID;
    delete process.env.MELIPAYAMAK_CUSTOMER_ORDER_PATTERN_ID;
    delete process.env.MELIPAYAMAK_ORDER_SHIPPED_PATTERN_ID;
    delete process.env.SMS_DELIVERY_MODE;
    delete process.env.FORCE_REAL_SMS;

    userRepo = new InMemoryUserRepository();
    orderRepo = new InMemoryOrderRepository();
    productRepo = new InMemoryProductRepository();
    mockSmsProvider = new MockSmsProvider();

    notificationService = new AdminOrderNotificationService(userRepo, mockSmsProvider);
    createOrderUseCase = new CreateOrderUseCase(
      orderRepo,
      productRepo,
      userRepo,
      undefined,
      notificationService,
    );
    assignOrderCarrierUseCase = new AssignOrderCarrierUseCase(orderRepo, notificationService);
    updateOrderStatusUseCase = new UpdateOrderStatusUseCase(orderRepo, notificationService);

    await userRepo.save(testCustomer);
    await productRepo.save(testProduct);
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  // =========================================================================
  // Helper Unit Tests (Formatting & Variables)
  // =========================================================================
  describe('Formatting & Pattern Template', () => {
    it('converts English digits to Persian numerals accurately', () => {
      expect(toPersianDigits('09162947221')).toBe('۰۹۱۶۲۹۴۷۲۲۱');
      expect(toPersianDigits('1234')).toBe('۱۲۳۴');
      expect(toPersianDigits('VX-5678')).toBe('VX-۵۶۷۸');
    });

    it('formats amount in Tomans with Persian comma separators', () => {
      expect(formatTomanAmount(100000)).toBe('۱۰۰،۰۰۰');
      expect(formatTomanAmount(18200000)).toBe('۱۸،۲۰۰،۰۰۰');
      expect(formatTomanAmount(BigInt(5000000))).toBe('۵،۰۰۰،۰۰۰');
    });

    it('renders exact pattern text matching the template specification', () => {
      const rendered = renderOrderPatternText(['۱۲۳۴', 'امیررضا یزدان پناه', '۱۰۰،۰۰۰', '۰۹۱۶۲۹۴۷۲۲۱']);

      expect(rendered).toContain('سفارش جدید ثبت شد!');
      expect(rendered).toContain('شماره سفارش: ۱۲۳۴');
      expect(rendered).toContain('نام مشتری: امیررضا یزدان پناه');
      expect(rendered).toContain('مبلغ سفارش: ۱۰۰،۰۰۰ تومان');
      expect(rendered).toContain('شماره تماس: ۰۹۱۶۲۹۴۷۲۲۱');
      expect(rendered).toContain('ققنوس آکادمی');
    });
  });

  // =========================================================================
  // Scenarios 1 to 12
  // =========================================================================

  // Scenario 1: ثبت موفق سفارش با یک ادمین
  it('Scenario 1: notifies single active admin upon successful order registration', async () => {
    const admin = new User({
      id: 'admin-001',
      name: 'عرفان سعیدی',
      email: Email.create('admin1@velox.local'),
      phone: PhoneNumber.create('09121111111'),
      role: 'admin',
      status: 'ACTIVE',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    await userRepo.save(admin);

    const order = createSampleOrder('1234', 100000);
    const result = await notificationService.notifyAdminsOfNewOrder(order);

    expect(result.totalAdmins).toBe(1);
    expect(result.successfulCount).toBe(1);
    expect(result.failedCount).toBe(0);
    expect(mockSmsProvider.dispatchedPatterns.length).toBe(1);
    expect(mockSmsProvider.dispatchedPatterns[0].to).toBe('09121111111');
    expect(mockSmsProvider.dispatchedPatterns[0].bodyId).toBe(MELIPAYAMAK_ORDER_NOTIFICATION_DEFAULT_BODY_ID);
  });

  // Scenario 2: ثبت موفق سفارش با چند ادمین
  it('Scenario 2: notifies multiple active admins upon successful order registration', async () => {
    const admin1 = new User({
      id: 'admin-001',
      name: 'مدیر اول',
      email: Email.create('admin1@velox.local'),
      phone: PhoneNumber.create('09121111111'),
      role: 'admin',
      status: 'ACTIVE',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    const admin2 = new User({
      id: 'admin-002',
      name: 'مدیر دوم',
      email: Email.create('admin2@velox.local'),
      phone: PhoneNumber.create('09122222222'),
      role: 'super_admin',
      status: 'ACTIVE',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    const admin3 = new User({
      id: 'admin-003',
      name: 'مدیر سوم',
      email: Email.create('admin3@velox.local'),
      phone: PhoneNumber.create('09123333333'),
      role: 'admin',
      status: 'ACTIVE',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    await userRepo.save(admin1);
    await userRepo.save(admin2);
    await userRepo.save(admin3);

    const order = createSampleOrder('1234', 100000);
    const result = await notificationService.notifyAdminsOfNewOrder(order);

    expect(result.totalAdmins).toBe(3);
    expect(result.successfulCount).toBe(3);
    expect(result.failedCount).toBe(0);
    expect(mockSmsProvider.dispatchedPatterns.length).toBe(3);

    const destinations = mockSmsProvider.dispatchedPatterns.map((p) => p.to);
    expect(destinations).toContain('09121111111');
    expect(destinations).toContain('09122222222');
    expect(destinations).toContain('09123333333');
  });

  // Scenario 3: بررسی ارسال پیامک به تمام شماره‌های معتبر ادمین‌ها
  it('Scenario 3: sends SMS to all and only eligible admin phone numbers, excluding normal customers', async () => {
    const admin = new User({
      id: 'admin-001',
      name: 'مدیر سیستم',
      email: Email.create('admin@velox.local'),
      phone: PhoneNumber.create('09124444444'),
      role: 'admin',
      status: 'ACTIVE',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    const normalCustomer = new User({
      id: 'cust-999',
      name: 'کاربر معمولی',
      email: Email.create('customer2@velox.local'),
      phone: PhoneNumber.create('09125555555'),
      role: 'customer',
      status: 'ACTIVE',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    await userRepo.save(admin);
    await userRepo.save(normalCustomer);

    const order = createSampleOrder();
    await notificationService.notifyAdminsOfNewOrder(order);

    const destinations = mockSmsProvider.dispatchedPatterns.map((p) => p.to);
    expect(destinations).toContain('09124444444');
    expect(destinations).not.toContain('09125555555');
  });

  // Scenario 4: وجود ادمین بدون شماره موبایل
  it('Scenario 4: skips admin without mobile number without disrupting dispatch to other admins', async () => {
    const adminWithoutPhone = new User({
      id: 'admin-no-phone',
      name: 'مدیر بدون تلفن',
      email: Email.create('nophone@velox.local'),
      phone: null,
      role: 'admin',
      status: 'ACTIVE',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    const validAdmin = new User({
      id: 'admin-valid',
      name: 'مدیر دارای تلفن',
      email: Email.create('valid@velox.local'),
      phone: PhoneNumber.create('09126666666'),
      role: 'admin',
      status: 'ACTIVE',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    await userRepo.save(adminWithoutPhone);
    await userRepo.save(validAdmin);

    const order = createSampleOrder();
    const result = await notificationService.notifyAdminsOfNewOrder(order);

    expect(result.totalAdmins).toBe(1);
    expect(result.successfulCount).toBe(1);
    expect(mockSmsProvider.dispatchedPatterns.length).toBe(1);
    expect(mockSmsProvider.dispatchedPatterns[0].to).toBe('09126666666');
  });

  // Scenario 5: وجود شماره موبایل تکراری بین ادمین‌ها
  it('Scenario 5: deduplicates identical phone numbers between admin accounts', async () => {
    const adminA = new User({
      id: 'admin-a',
      name: 'عرفان ادمین اصلی',
      email: Email.create('erfan.primary@velox.local'),
      phone: PhoneNumber.create('09127777777'),
      role: 'admin',
      status: 'ACTIVE',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    const adminB = new User({
      id: 'admin-b',
      name: 'عرفان اکانت دوم',
      email: Email.create('erfan.secondary@velox.local'),
      phone: PhoneNumber.create('09127777777'), // Same mobile
      role: 'super_admin',
      status: 'ACTIVE',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    await userRepo.save(adminA);
    await userRepo.save(adminB);

    const order = createSampleOrder();
    const result = await notificationService.notifyAdminsOfNewOrder(order);

    expect(result.totalAdmins).toBe(1);
    expect(result.successfulCount).toBe(1);
    expect(mockSmsProvider.dispatchedPatterns.length).toBe(1);
    expect(mockSmsProvider.dispatchedPatterns[0].to).toBe('09127777777');
  });

  // Scenario 6: ناموفق بودن ارسال پیامک به یکی از ادمین‌ها
  it('Scenario 6: failure to dispatch to one admin does not block dispatch to others', async () => {
    const admin1 = new User({
      id: 'admin-001',
      name: 'مدیر سالم',
      email: Email.create('ok@velox.local'),
      phone: PhoneNumber.create('09121111111'),
      role: 'admin',
      status: 'ACTIVE',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    const admin2 = new User({
      id: 'admin-002',
      name: 'مدیر ناموفق',
      email: Email.create('failing@velox.local'),
      phone: PhoneNumber.create('09129999999'),
      role: 'admin',
      status: 'ACTIVE',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    await userRepo.save(admin1);
    await userRepo.save(admin2);

    mockSmsProvider.customHandler = async (to) => {
      if (to === '09129999999') {
        return { success: false, errorMessage: 'شماره در بلک‌لیست مخابرات قرار دارد' };
      }
      return { success: true, messageId: 'ref_ok' };
    };

    const order = createSampleOrder();
    const result = await notificationService.notifyAdminsOfNewOrder(order);

    expect(result.totalAdmins).toBe(2);
    expect(result.successfulCount).toBe(1);
    expect(result.failedCount).toBe(1);
    expect(mockSmsProvider.dispatchedPatterns.length).toBe(2);
  });

  // Scenario 7: ناموفق بودن سرویس پیام‌رسان
  it('Scenario 7: SMS service failure is caught and handled gracefully without throwing', async () => {
    const admin = new User({
      id: 'admin-001',
      name: 'مدیر سیستم',
      email: Email.create('admin@velox.local'),
      phone: PhoneNumber.create('09121111111'),
      role: 'admin',
      status: 'ACTIVE',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    await userRepo.save(admin);

    mockSmsProvider.customHandler = async () => {
      throw new Error('Melipayamak Gateway Connection Refused');
    };

    const order = createSampleOrder();
    // Notification service itself must not throw
    const result = await notificationService.notifyAdminsOfNewOrder(order);

    expect(result.totalAdmins).toBe(1);
    expect(result.failedCount).toBe(1);
    expect(result.successfulCount).toBe(0);

    // And through the UseCase: Order creation must succeed even if SMS service crashes
    notificationService.clearNotifiedCache();
    const placedOrder = await createOrderUseCase.execute({
      userId: testCustomer.id,
      items: [{ productId: testProduct.id, quantity: 1 }],
      shippingAddress: {
        province: 'تهران',
        city: 'تهران',
        address: 'خیابان آزادی',
        recipientName: 'امیررضا یزدان پناه',
        phoneNumber: '09162947221',
      },
    });

    expect(placedOrder.orderId).toBeDefined();
    expect(placedOrder.status).toBe('pending_financial');
  });

  // Scenario 8: ثبت ناموفق سفارش و اطمینان از عدم ارسال پیام
  it('Scenario 8: unsuccessful order creation does not trigger any notification SMS', async () => {
    const admin = new User({
      id: 'admin-001',
      name: 'مدیر سیستم',
      email: Email.create('admin@velox.local'),
      phone: PhoneNumber.create('09121111111'),
      role: 'admin',
      status: 'ACTIVE',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    await userRepo.save(admin);

    const notifySpy = vi.spyOn(notificationService, 'notifyAdminsOfNewOrder');

    // Attempt to create empty order (must throw EmptyOrderException)
    await expect(
      createOrderUseCase.execute({
        userId: testCustomer.id,
        items: [],
        shippingAddress: {
          province: 'تهران',
          city: 'تهران',
          address: 'خیابان آزادی',
          recipientName: 'مشتری',
          phoneNumber: '09162947221',
        },
      }),
    ).rejects.toThrow(EmptyOrderException);

    expect(notifySpy).not.toHaveBeenCalled();
    expect(mockSmsProvider.dispatchedPatterns.length).toBe(0);
  });

  // Scenario 9: جلوگیری از ارسال پیامک تکراری برای یک سفارش
  it('Scenario 9: prevents duplicate SMS notification for the exact same order', async () => {
    const admin = new User({
      id: 'admin-001',
      name: 'مدیر سیستم',
      email: Email.create('admin@velox.local'),
      phone: PhoneNumber.create('09121111111'),
      role: 'admin',
      status: 'ACTIVE',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    await userRepo.save(admin);

    const order = createSampleOrder('VX-9999', 100000);

    // First notification
    const firstResult = await notificationService.notifyAdminsOfNewOrder(order);
    expect(firstResult.successfulCount).toBe(1);
    expect(firstResult.skipped).toBeUndefined();
    expect(mockSmsProvider.dispatchedPatterns.length).toBe(1);

    // Second notification attempt for the same order
    const secondResult = await notificationService.notifyAdminsOfNewOrder(order);
    expect(secondResult.skipped).toBe(true);
    expect(secondResult.reason).toBe('duplicate');
    expect(mockSmsProvider.dispatchedPatterns.length).toBe(1); // No new dispatch
  });

  // Scenario 10: بررسی صحت تمام متغیرهای پترن و ترتیب آنها
  it('Scenario 10: validates pattern variables and their exact positional ordering', async () => {
    const admin = new User({
      id: 'admin-001',
      name: 'مدیر سیستم',
      email: Email.create('admin@velox.local'),
      phone: PhoneNumber.create('09121111111'),
      role: 'admin',
      status: 'ACTIVE',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    await userRepo.save(admin);

    const order = new Order({
      id: 'ord-specific-1234',
      orderNumber: '1234',
      trackingCode: 'NET-99887766',
      userId: testCustomer.id,
      status: OrderStatus.PENDING_FINANCIAL,
      customerType: 'retail',
      customerName: 'امیررضا یزدان پناه',
      phoneNumber: '09162947221',
      totalAmount: 100000,
      discountAmount: 0,
      vatTaxAmount: 0,
      payableAmount: 100000,
      paymentMethod: 'online_gateway',
      items: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await notificationService.notifyAdminsOfNewOrder(order);

    expect(mockSmsProvider.dispatchedPatterns.length).toBe(1);
    const dispatch = mockSmsProvider.dispatchedPatterns[0];

    expect(dispatch.bodyId).toBe(MELIPAYAMAK_ORDER_NOTIFICATION_DEFAULT_BODY_ID); // 563237
    expect(dispatch.args.length).toBe(4);

    // {0} = Order Number
    expect(dispatch.args[0]).toBe('۱۲۳۴');
    // {1} = Customer Name
    expect(dispatch.args[1]).toBe('امیررضا یزدان پناه');
    // {2} = Total Amount in Tomans (formatted)
    expect(dispatch.args[2]).toBe('۱۰۰،۰۰۰');
    // {3} = Customer Phone Number
    expect(dispatch.args[3]).toBe('۰۹۱۶۲۹۴۷۲۲۱');

    // Verify rendered text inside metadata
    expect(dispatch.metadata?.renderedText).toContain('شماره سفارش: ۱۲۳۴');
    expect(dispatch.metadata?.renderedText).toContain('نام مشتری: امیررضا یزدان پناه');
    expect(dispatch.metadata?.renderedText).toContain('مبلغ سفارش: ۱۰۰،۰۰۰ تومان');
    expect(dispatch.metadata?.renderedText).toContain('شماره تماس: ۰۹۱۶۲۹۴۷۲۲۱');
  });

  // Scenario 11: بررسی رفتار Development و ارسال آزمایشی از طریق تلگرام
  it('Scenario 11: Development mode routes notification to Telegram bot instead of real SMS', async () => {
    process.env.NODE_ENV = 'development';
    process.env.SMS_DELIVERY_MODE = 'telegram';

    const mockTg = new TelegramOtpService();
    const sendPatternTgSpy = vi
      .spyOn(mockTg, 'sendPatternMessage')
      .mockResolvedValue({ success: true, messageId: 'tg_order_notify_777' });

    const unconfiguredBase = new MelipayamakBaseServiceProvider({ username: '', password: '', bodyId: 0 });
    const unconfiguredConsole = new MelipayamakConsoleOtpProvider({ otpToken: '' });

    const compositeProvider = new CompositeSmsProvider(mockTg, unconfiguredBase, unconfiguredConsole);
    expect(compositeProvider.getDeliveryMode()).toBe('telegram');

    const devNotificationService = new AdminOrderNotificationService(userRepo, compositeProvider);

    const admin = new User({
      id: 'admin-dev',
      name: 'عرفان (مدیر)',
      email: Email.create('erfan@dev.local'),
      phone: PhoneNumber.create('09162947221'),
      role: 'admin',
      status: 'ACTIVE',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    await userRepo.save(admin);

    const order = createSampleOrder('1234', 100000);
    const result = await devNotificationService.notifyAdminsOfNewOrder(order);

    expect(result.successfulCount).toBe(1);
    expect(sendPatternTgSpy).toHaveBeenCalledWith(
      '09162947221',
      MELIPAYAMAK_ORDER_NOTIFICATION_DEFAULT_BODY_ID,
      ['۱۲۳۴', 'امیررضا یزدان پناه', '۱۰۰،۰۰۰', '۰۹۱۶۲۹۴۷۲۲۱'],
      expect.objectContaining({
        orderNumber: '1234',
        customerName: 'امیررضا یزدان پناه',
      }),
    );
  });

  // Scenario 12: بررسی رفتار Production و ارسال از طریق Pattern ملی پیامک
  it('Scenario 12: Production mode routes notification to Melipayamak Pattern 563237 API', async () => {
    process.env.NODE_ENV = 'production';
    process.env.SMS_DELIVERY_MODE = 'real';
    process.env.MELIPAYAMAK_OTP_API_KEY = 'test_real_api_key';

    const mockTg = new TelegramOtpService();
    const sendPatternTgSpy = vi.spyOn(mockTg, 'sendPatternMessage');

    const consoleProvider = new MelipayamakConsoleOtpProvider({ otpToken: 'test_real_api_key' });
    const sendConsolePatternSpy = vi
      .spyOn(consoleProvider, 'sendPattern')
      .mockResolvedValue({ success: true, messageId: '5249004813124591851' });

    const baseProvider = new MelipayamakBaseServiceProvider({ username: '', password: '', bodyId: 0 });

    const compositeProvider = new CompositeSmsProvider(mockTg, baseProvider, consoleProvider);
    expect(compositeProvider.getDeliveryMode()).toBe('real');

    const prodNotificationService = new AdminOrderNotificationService(userRepo, compositeProvider);

    const admin = new User({
      id: 'admin-prod',
      name: 'عرفان (مدیر پروداکشن)',
      email: Email.create('erfan@fonix.ir'),
      phone: PhoneNumber.create('09162947221'),
      role: 'admin',
      status: 'ACTIVE',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    await userRepo.save(admin);

    const order = createSampleOrder('1234', 100000);
    const result = await prodNotificationService.notifyAdminsOfNewOrder(order);

    expect(result.successfulCount).toBe(1);
    expect(sendConsolePatternSpy).toHaveBeenCalledWith('09162947221', 563237, [
      '۱۲۳۴',
      'امیررضا یزدان پناه',
      '۱۰۰،۰۰۰',
      '۰۹۱۶۲۹۴۷۲۲۱',
    ]);
    expect(sendPatternTgSpy).not.toHaveBeenCalled();
  });

  // Direct provider unit tests for MelipayamakConsoleOtpProvider and MelipayamakBaseServiceProvider
  describe('Direct Provider sendPattern implementations', () => {
    it('MelipayamakConsoleOtpProvider sends pattern request to console endpoint', async () => {
      const provider = new MelipayamakConsoleOtpProvider({
        otpToken: 'test_token_123',
      });

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          recId: '7788990011',
          status: 'عملیات موفق',
        }),
      });

      const res = await provider.sendPattern('09121234567', 563237, ['arg0', 'arg1', 'arg2', 'arg3']);
      expect(res.success).toBe(true);
      expect(res.messageId).toBe('7788990011');

      expect(global.fetch).toHaveBeenCalledWith(
        'https://console.melipayamak.com/api/send/shared/test_token_123',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            to: '09121234567',
            bodyId: 563237,
            args: ['arg0', 'arg1', 'arg2', 'arg3'],
          }),
        }),
      );
    });

    it('MelipayamakBaseServiceProvider sends pattern request joined with semicolons', async () => {
      const provider = new MelipayamakBaseServiceProvider({
        username: 'test_user',
        password: 'test_password',
      });

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          Value: '9988776655',
          RetStatus: 1,
        }),
      });

      const res = await provider.sendPattern('09121234567', 563237, ['arg0', 'arg1', 'arg2', 'arg3']);
      expect(res.success).toBe(true);
      expect(res.messageId).toBe('9988776655');

      expect(global.fetch).toHaveBeenCalledWith(
        'https://rest.payamak-panel.com/api/SendSMS/BaseServiceNumber',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            username: 'test_user',
            password: 'test_password',
            text: 'arg0;arg1;arg2;arg3',
            to: '09121234567',
            bodyId: 563237,
          }),
        }),
      );
    });
  });

  describe('Customer Order Confirmation SMS (Pattern 563239)', () => {
    it('should substitute order number into customer pattern template properly', () => {
      const rendered = renderCustomerOrderPatternText('۱۲۳۴');
      expect(rendered).toContain('شماره سفارش: ۱۲۳۴');
      expect(rendered).toContain('مشتری گرامی، سفارش شما با موفقیت ثبت شد و در حال بررسی است.');
      expect(rendered).toContain('فونیکس آکادمی');
    });

    it('dispatches confirmation SMS to the login mobile number of the customer', async () => {
      const order = createSampleOrder('5566', 100000, '09199999999');

      const result = await notificationService.notifyCustomerOfNewOrder(order, '09162947221');
      expect(result.success).toBe(true);
      expect(result.orderNumber).toBe('5566');
      expect(result.customerPhone).toBe('09162947221');

      expect(mockSmsProvider.dispatchedPatterns).toHaveLength(1);
      const dispatch = mockSmsProvider.dispatchedPatterns[0];
      expect(dispatch.to).toBe('09162947221');
      expect(dispatch.bodyId).toBe(MELIPAYAMAK_CUSTOMER_ORDER_NOTIFICATION_DEFAULT_BODY_ID);
      expect(dispatch.args).toEqual(['۵۵۶۶']);
      expect(dispatch.metadata.renderedText).toContain('شماره سفارش: ۵۵۶۶');
      expect(dispatch.metadata.recipientLabel).toBe('مشتری (شماره لاگین)');
    });

    it('falls back to order.phoneNumber when customer login phone is not provided', async () => {
      const order = createSampleOrder('7788', 100000, '09123456789');

      const result = await notificationService.notifyCustomerOfNewOrder(order, undefined);
      expect(result.success).toBe(true);
      expect(result.customerPhone).toBe('09123456789');

      expect(mockSmsProvider.dispatchedPatterns).toHaveLength(1);
      const dispatch = mockSmsProvider.dispatchedPatterns[0];
      expect(dispatch.to).toBe('09123456789');
      expect(dispatch.bodyId).toBe(563239);
      expect(dispatch.args).toEqual(['۷۷۸۸']);
    });

    it('skips customer notification if phone number is missing or invalid', async () => {
      const order = createSampleOrder('8899', 100000, 'invalid-phone');

      const result = await notificationService.notifyCustomerOfNewOrder(order, '');
      expect(result.success).toBe(false);
      expect(result.skipped).toBe(true);
      expect(result.reason).toBe('invalid_or_missing_customer_phone');
      expect(mockSmsProvider.dispatchedPatterns).toHaveLength(0);
    });

    it('prevents duplicate customer confirmation SMS for the same order', async () => {
      const order = createSampleOrder('1122');

      const first = await notificationService.notifyCustomerOfNewOrder(order, '09162947221');
      expect(first.success).toBe(true);
      expect(mockSmsProvider.dispatchedPatterns).toHaveLength(1);

      const second = await notificationService.notifyCustomerOfNewOrder(order, '09162947221');
      expect(second.success).toBe(false);
      expect(second.skipped).toBe(true);
      expect(second.reason).toBe('duplicate');
      expect(mockSmsProvider.dispatchedPatterns).toHaveLength(1);
    });

    it('handles provider dispatch failure gracefully without throwing', async () => {
      mockSmsProvider.customHandler = () => ({
        success: false,
        errorMessage: 'سامانه پیامکی پاسخ نداد',
      });

      const order = createSampleOrder('3344');
      const result = await notificationService.notifyCustomerOfNewOrder(order, '09162947221');
      expect(result.success).toBe(false);
      expect(result.errorMessage).toBe('سامانه پیامکی پاسخ نداد');
    });

    it('CreateOrderUseCase dispatches BOTH admin SMS (563237) and customer SMS (563239)', async () => {
      const admin = new User({
        id: 'admin-main-1',
        name: 'مدیر کل',
        email: Email.create('admin@cisco.ir'),
        phone: PhoneNumber.create('09121111111'),
        role: 'admin',
        status: 'ACTIVE',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      await userRepo.save(admin);

      // Customer logged in has phone 09162947221
      const createdOrder = await createOrderUseCase.execute({
        userId: testCustomer.id,
        items: [{ productId: testProduct.id, quantity: 1 }],
        paymentMethodId: 'online_gateway',
        shippingAddress: {
          recipientName: 'امیررضا یزدان پناه',
          phoneNumber: '09199999999',
          province: 'تهران',
          city: 'تهران',
          postalCode: '1234567890',
          address: 'خیابان ولیعصر',
        },
      });

      expect(createdOrder.orderId).toBeDefined();

      // Check both SMS dispatches
      expect(mockSmsProvider.dispatchedPatterns).toHaveLength(2);

      // 1. Admin notification (pattern 563237)
      const adminDispatch = mockSmsProvider.dispatchedPatterns.find((p) => p.bodyId === 563237);
      expect(adminDispatch).toBeDefined();
      expect(adminDispatch!.to).toBe('09121111111');
      expect(adminDispatch!.args).toHaveLength(4);

      // 2. Customer confirmation (pattern 563239 to customer login phone 09162947221)
      const customerDispatch = mockSmsProvider.dispatchedPatterns.find((p) => p.bodyId === 563239);
      expect(customerDispatch).toBeDefined();
      expect(customerDispatch!.to).toBe('09162947221');
      expect(customerDispatch!.args).toEqual([toPersianDigits(createdOrder.orderNumber)]);
      expect(customerDispatch!.metadata.recipientLabel).toBe('مشتری (شماره لاگین)');
    });

    it('Customer SMS failure does not impede successful order creation or admin SMS', async () => {
      const admin = new User({
        id: 'admin-main-2',
        name: 'مدیر سیستم',
        email: Email.create('admin2@cisco.ir'),
        phone: PhoneNumber.create('09122222222'),
        role: 'admin',
        status: 'ACTIVE',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      await userRepo.save(admin);

      mockSmsProvider.customHandler = (to, bodyId) => {
        if (bodyId === 563239) {
          throw new Error('Melipayamak Gateway Error for customer');
        }
        return { success: true, messageId: 'admin_ok' };
      };

      const createdOrder = await createOrderUseCase.execute({
        userId: testCustomer.id,
        items: [{ productId: testProduct.id, quantity: 1 }],
        paymentMethodId: 'online_gateway',
        shippingAddress: {
          recipientName: 'امیررضا یزدان پناه',
          phoneNumber: '09162947221',
          province: 'تهران',
          city: 'تهران',
          postalCode: '1234567890',
          address: 'خیابان ولیعصر',
        },
      });

      expect(createdOrder.orderId).toBeDefined();
      expect(createdOrder.orderNumber).toBeDefined();
    });

    it('Environment variable MELIPAYAMAK_CUSTOMER_ORDER_PATTERN_ID overrides default bodyId', async () => {
      process.env.MELIPAYAMAK_CUSTOMER_ORDER_PATTERN_ID = '999888';

      const order = createSampleOrder('9900');
      const result = await notificationService.notifyCustomerOfNewOrder(order, '09162947221');
      expect(result.success).toBe(true);

      const dispatch = mockSmsProvider.dispatchedPatterns[0];
      expect(dispatch.bodyId).toBe(999888);
    });
  });

  describe('Order Shipped & Handed Over to Courier SMS (Pattern 546532)', () => {
    it('formatCarrierName normalizes carrier names properly', () => {
      expect(formatCarrierName('tipax')).toBe('شرکت تیپاکس');
      expect(formatCarrierName('chapar')).toBe('کالارسان چاپار');
      expect(formatCarrierName('freight')).toBe('شرکت باربری');
      expect(formatCarrierName('express')).toBe('پیک اختصاصی');
      expect(formatCarrierName('post')).toBe('شرکت ملی پست');
      expect(formatCarrierName('pishtaz')).toBe('پست پیشتاز');
      expect(formatCarrierName('پست پیشتاز')).toBe('پست پیشتاز');
      expect(formatCarrierName(null)).toBe('شرکت ملی پست');
      expect(formatCarrierName('')).toBe('شرکت ملی پست');
    });

    it('substitutes carrier and order number into shipping pattern template properly', () => {
      const rendered = renderOrderShippedPatternText('شرکت تیپاکس', '۱۲۳۴');
      expect(rendered).toContain('مشتری گرامی، سفارش شما آماده و به شرکت تیپاکس تحویل داده شد.');
      expect(rendered).toContain('کد سفارش: ۱۲۳۴');
      expect(rendered).toContain('فونیکس آکادمی');
    });

    it('dispatches shipping SMS to the login mobile number of the customer', async () => {
      const order = createSampleOrder('4455', 150000, '09199999999');
      await orderRepo.create(order);

      const result = await notificationService.notifyCustomerOfOrderShipped(order, 'tipax');
      expect(result.success).toBe(true);
      expect(result.orderNumber).toBe('4455');
      expect(result.carrier).toBe('شرکت تیپاکس');
      expect(result.customerPhone).toBe('09162947221'); // fetched from testCustomer profile

      expect(mockSmsProvider.dispatchedPatterns).toHaveLength(1);
      const dispatch = mockSmsProvider.dispatchedPatterns[0];
      expect(dispatch.to).toBe('09162947221');
      expect(dispatch.bodyId).toBe(MELIPAYAMAK_ORDER_SHIPPED_NOTIFICATION_DEFAULT_BODY_ID);
      expect(dispatch.args).toEqual(['شرکت تیپاکس', '۴۴۵۵']);
      expect(dispatch.metadata.renderedText).toContain('به شرکت تیپاکس تحویل داده شد.');
      expect(dispatch.metadata.renderedText).toContain('کد سفارش: ۴۴۵۵');
    });

    it('falls back to order.phoneNumber when customer user has no phone in database', async () => {
      const userWithoutPhone = new User({
        id: 'user-no-phone-99',
        name: 'کاربر بدون شماره',
        email: Email.create('nophone@example.com'),
        role: 'customer',
        status: 'ACTIVE',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      await userRepo.save(userWithoutPhone);

      const order = new Order({
        id: 'order-nophone-1',
        orderNumber: '6677',
        trackingCode: 'NET-667788',
        userId: userWithoutPhone.id,
        status: OrderStatus.PROCESSING_WAREHOUSE,
        customerType: 'retail',
        customerName: 'کاربر بدون شماره',
        phoneNumber: '09123334455',
        totalAmount: 100000,
        discountAmount: 0,
        vatTaxAmount: 0,
        payableAmount: 100000,
        paymentMethod: 'online_gateway',
        items: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await notificationService.notifyCustomerOfOrderShipped(order, 'chapar');
      expect(result.success).toBe(true);
      expect(result.customerPhone).toBe('09123334455');

      const dispatch = mockSmsProvider.dispatchedPatterns[0];
      expect(dispatch.to).toBe('09123334455');
      expect(dispatch.bodyId).toBe(546532);
      expect(dispatch.args).toEqual(['کالارسان چاپار', '۶۶۷۷']);
    });

    it('prevents duplicate shipping SMS dispatches for the same order', async () => {
      const order = createSampleOrder('8811');
      await orderRepo.create(order);

      const first = await notificationService.notifyCustomerOfOrderShipped(order, 'post');
      expect(first.success).toBe(true);
      expect(mockSmsProvider.dispatchedPatterns).toHaveLength(1);

      const second = await notificationService.notifyCustomerOfOrderShipped(order, 'post');
      expect(second.success).toBe(false);
      expect(second.skipped).toBe(true);
      expect(second.reason).toBe('duplicate');
      expect(mockSmsProvider.dispatchedPatterns).toHaveLength(1);
    });

    it('skips shipping notification if customer phone is missing or invalid', async () => {
      const userInvalid = new User({
        id: 'user-invalid-phone',
        name: 'کاربر شماره اشتباه',
        email: Email.create('invalid@example.com'),
        role: 'customer',
        status: 'ACTIVE',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      await userRepo.save(userInvalid);

      const order = new Order({
        id: 'order-invalid-1',
        orderNumber: '9922',
        trackingCode: 'NET-9922',
        userId: userInvalid.id,
        status: OrderStatus.PROCESSING_WAREHOUSE,
        customerType: 'retail',
        customerName: 'کاربر شماره اشتباه',
        phoneNumber: '000000',
        totalAmount: 50000,
        discountAmount: 0,
        vatTaxAmount: 0,
        payableAmount: 50000,
        paymentMethod: 'online_gateway',
        items: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await notificationService.notifyCustomerOfOrderShipped(order, 'post');
      expect(result.success).toBe(false);
      expect(result.skipped).toBe(true);
      expect(result.reason).toBe('invalid_or_missing_customer_phone');
      expect(mockSmsProvider.dispatchedPatterns).toHaveLength(0);
    });

    it('AssignOrderCarrierUseCase automatically dispatches pattern 546532 upon assigning carrier', async () => {
      const order = createSampleOrder('3322');
      await orderRepo.create(order);

      const updated = await assignOrderCarrierUseCase.execute(order.id, 'tipax', 'TPX-998877');
      expect(updated.status).toBe(OrderStatus.SHIPPING);
      expect(updated.shippingCarrier).toBe('tipax');

      expect(mockSmsProvider.dispatchedPatterns).toHaveLength(1);
      const dispatch = mockSmsProvider.dispatchedPatterns[0];
      expect(dispatch.to).toBe('09162947221');
      expect(dispatch.bodyId).toBe(546532);
      expect(dispatch.args).toEqual(['شرکت تیپاکس', '۳۳۲۲']);
      expect(dispatch.metadata.recipientLabel).toBe('مشتری (شماره لاگین)');
    });

    it('UpdateOrderStatusUseCase automatically dispatches pattern 546532 when status is set to SHIPPING', async () => {
      const order = createSampleOrder('5544');
      await orderRepo.create(order);

      const updated = await updateOrderStatusUseCase.execute(order.id, 'SHIPPING', 'CHP-1122', 'chapar');
      expect(updated.status).toBe(OrderStatus.SHIPPING);

      expect(mockSmsProvider.dispatchedPatterns).toHaveLength(1);
      const dispatch = mockSmsProvider.dispatchedPatterns[0];
      expect(dispatch.to).toBe('09162947221');
      expect(dispatch.bodyId).toBe(546532);
      expect(dispatch.args).toEqual(['کالارسان چاپار', '۵۵۴۴']);
    });

    it('UpdateOrderStatusUseCase does NOT dispatch pattern 546532 when status is non-shipping', async () => {
      const order = createSampleOrder('7711');
      await orderRepo.create(order);

      const updated = await updateOrderStatusUseCase.execute(order.id, 'PROCESSING_WAREHOUSE');
      expect(updated.status).toBe(OrderStatus.PROCESSING_WAREHOUSE);

      expect(mockSmsProvider.dispatchedPatterns).toHaveLength(0);
    });

    it('Environment variable MELIPAYAMAK_ORDER_SHIPPED_PATTERN_ID overrides default bodyId', async () => {
      process.env.MELIPAYAMAK_ORDER_SHIPPED_PATTERN_ID = '777666';

      const order = createSampleOrder('8844');
      await orderRepo.create(order);

      const result = await notificationService.notifyCustomerOfOrderShipped(order, 'post');
      expect(result.success).toBe(true);

      const dispatch = mockSmsProvider.dispatchedPatterns[0];
      expect(dispatch.bodyId).toBe(777666);
    });
  });
});
