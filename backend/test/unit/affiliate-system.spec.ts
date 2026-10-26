import { describe, it, expect, beforeEach } from 'vitest';
import { InMemoryAffiliateRepository } from '../../src/infrastructure/database/in-memory/in-memory-affiliate.repository.js';
import { AffiliateCalculationService } from '../../src/application/use-cases/affiliate/affiliate-calculation.use-case.js';
import {
  GetAffiliateSettingsUseCase,
  UpdateAffiliateSettingsUseCase,
} from '../../src/application/use-cases/affiliate/affiliate-settings.use-case.js';
import {
  GetAffiliatePartnersUseCase,
  GetAffiliatePartnerByIdUseCase,
  UpdateAffiliatePartnerUseCase,
  ResetPartnerDefaultsUseCase,
} from '../../src/application/use-cases/affiliate/affiliate-partners.use-case.js';
import {
  GetAffiliateCommissionsUseCase,
  UpdateCommissionStatusUseCase,
  CreateAffiliatePayoutUseCase,
  GetAffiliatePayoutsUseCase,
} from '../../src/application/use-cases/affiliate/affiliate-commissions.use-case.js';
import { CreateOrderUseCase } from '../../src/application/use-cases/order/create-order.use-case.js';
import { UpdateOrderStatusUseCase } from '../../src/application/use-cases/order/update-order-status.use-case.js';
import { InMemoryOrderRepository } from '../../src/infrastructure/database/in-memory/in-memory-order.repository.js';
import { InMemoryProductRepository } from '../../src/infrastructure/database/in-memory/in-memory-product.repository.js';
import { InMemoryUserRepository } from '../../src/infrastructure/database/in-memory/in-memory-user.repository.js';
import { Product } from '../../src/domain/entities/product.entity.js';
import { User } from '../../src/domain/entities/user.entity.js';
import { OrderStatus } from '../../src/domain/entities/order.entity.js';

describe('Affiliate / Partner System Comprehensive Scenarios (سیستم همکاران فروش)', () => {
  let affiliateRepo: InMemoryAffiliateRepository;
  let calculationService: AffiliateCalculationService;
  let orderRepo: InMemoryOrderRepository;
  let productRepo: InMemoryProductRepository;
  let userRepo: InMemoryUserRepository;
  let createOrderUseCase: CreateOrderUseCase;
  let updateOrderStatusUseCase: UpdateOrderStatusUseCase;

  beforeEach(async () => {
    affiliateRepo = new InMemoryAffiliateRepository();
    calculationService = new AffiliateCalculationService(affiliateRepo);
    orderRepo = new InMemoryOrderRepository();
    productRepo = new InMemoryProductRepository();
    userRepo = new InMemoryUserRepository();

    createOrderUseCase = new CreateOrderUseCase(
      orderRepo,
      productRepo,
      userRepo,
      undefined,
      undefined,
      calculationService,
      affiliateRepo,
    );

    updateOrderStatusUseCase = new UpdateOrderStatusUseCase(
      orderRepo,
      undefined,
      affiliateRepo,
    );

    // Setup standard test hardware product (no discounts)
    const productA = new Product({
      id: 'prod-switch-c2960',
      name: 'سیسکو Catalyst 2960-X 24Port',
      slug: 'cisco-catalyst-2960x-24port',
      sku: 'WS-C2960X-24TD-L',
      category: 'switches',
      brand: 'Cisco',
      price: 10000000, // 10M Tomans
      costPrice: 8500000,
      stock: 20,
      minStockAlert: 2,
      reservedStock: 0,
      warehouseLocation: 'MAIN-A1',
      status: 'active',
      featured: true,
      rating: 4.8,
      reviewCount: 15,
      images: ['https://example.com/switch.jpg'],
      warranty: 'گارانتی طلایی ۳۶ ماهه تعویض درجا',
      badges: ['اورجینال'],
      specs: ['24 Port Gigabit', '2x 10G SFP+'],
      shortDescription: 'سوئیچ ۲۴ پورت سیسکو',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    await productRepo.save(productA);

    // Setup product with standard discount
    const productDiscounted = new Product({
      id: 'prod-discounted-router',
      name: 'روتر سیسکو ISR 4331',
      slug: 'cisco-isr-4331',
      sku: 'ISR4331/K9',
      category: 'routers',
      brand: 'Cisco',
      price: 18000000,
      originalPrice: 20000000, // Has standard discount (10% off)
      discountPercent: 10,
      costPrice: 15000000,
      stock: 10,
      minStockAlert: 1,
      reservedStock: 0,
      warehouseLocation: 'MAIN-B2',
      status: 'active',
      featured: false,
      rating: 4.5,
      reviewCount: 8,
      images: ['https://example.com/router.jpg'],
      warranty: 'گارانتی ۲۴ ماهه ققنوس',
      badges: ['فروش ویژه'],
      specs: ['100Mbps to 300Mbps WAN', '3 GE ports'],
      shortDescription: 'روتر سازمانی سیسکو',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    await productRepo.save(productDiscounted);

    // Setup Internet product
    const internetService = new Product({
      id: 'prod-ftth-dedicated',
      name: 'سرویس اینترنت پرسرعت FTTH پهنای باند اختصاصی',
      slug: 'internet-ftth-dedicated-300m',
      sku: 'INT-FTTH-300M',
      category: 'internet',
      brand: 'Velox',
      price: 2500000,
      costPrice: 1200000,
      stock: 100,
      minStockAlert: 1,
      reservedStock: 0,
      warehouseLocation: 'NOC-CLOUD',
      status: 'active',
      featured: true,
      rating: 4.9,
      reviewCount: 40,
      images: ['https://example.com/ftth.jpg'],
      warranty: 'SLA 99.9%',
      badges: ['پهنای باند متقارن'],
      specs: ['300Mbps Symmetric', 'Dedicated Optical Fiber'],
      shortDescription: 'سرویس اینترنت فیبر نوری اختصاصی',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    await productRepo.save(internetService);

    // Setup Static IP product
    const staticIpPackage = new Product({
      id: 'prod-static-ip-pack',
      name: 'بسته IP استاتیک اختصاصی سازمانی (۱ عدد)',
      slug: 'static-ip-package-single',
      sku: 'IP-STATIC-SINGLE',
      category: 'static-ip',
      brand: 'Velox',
      price: 600000,
      costPrice: 200000,
      stock: 100,
      minStockAlert: 1,
      reservedStock: 0,
      warehouseLocation: 'NOC-CLOUD',
      status: 'active',
      featured: false,
      rating: 5.0,
      reviewCount: 25,
      images: ['https://example.com/ip.jpg'],
      warranty: 'پشتیبانی ۲۴ ساعته NOC',
      badges: ['IP ثابت معتبر'],
      specs: ['IPv4 Public Static', 'Dedicated Subnet Routing'],
      shortDescription: 'آی‌پی استاتیک برای دوربین و فایروال',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    await productRepo.save(staticIpPackage);

    // Seed partner user in userRepo
    await userRepo.save(
      User.create({
        id: '00000000-0000-4000-a000-000000000002',
        name: 'کامران رستمی',
        email: 'kamran.rostami@partner.velox.ir',
        phone: '09162947222',
        role: 'partner',
        status: 'ACTIVE',
      }),
    );
  });

  // Scenario 1 & 3: همکار با تخفیف پیش‌فرض ۸ درصد و خرید محصول بدون تخفیف
  it('Scenario 1 & 3: applies 8% default discount for active partner purchasing non-discounted product', async () => {
    const partner = await affiliateRepo.findPartnerById('00000000-0000-4000-a000-000000000002');
    expect(partner).toBeDefined();
    expect(partner?.status).toBe('ACTIVE');
    expect(partner?.customDiscountPercent).toBeNull(); // Inherits default 8%

    const evalResult = await calculationService.evaluateProductAffiliateDiscount(
      {
        productId: 'prod-switch-c2960',
        price: 10000000,
      },
      partner,
    );

    expect(evalResult.isEligible).toBe(true);
    expect(evalResult.discountPercent).toBe(8);
    expect(evalResult.discountAmount).toBe(800000); // 8% of 10,000,000
    expect(evalResult.unitPriceAfterDiscount).toBe(9200000);
  });

  // Scenario 2: همکار با تخفیف اختصاصی ۱۲ درصد
  it('Scenario 2: applies custom 12% discount when partner has explicit override', async () => {
    const partner = await affiliateRepo.findPartnerById('partner-reza-karimi');
    expect(partner).toBeDefined();
    expect(partner?.customDiscountPercent).toBe(12);

    const evalResult = await calculationService.evaluateProductAffiliateDiscount(
      {
        productId: 'prod-switch-c2960',
        price: 10000000,
      },
      partner,
    );

    expect(evalResult.isEligible).toBe(true);
    expect(evalResult.discountPercent).toBe(12);
    expect(evalResult.discountAmount).toBe(1200000); // 12% of 10,000,000
    expect(evalResult.unitPriceAfterDiscount).toBe(8800000);
  });

  // Scenario 4: خرید محصول دارای تخفیف عادی (عدم ترکیب و اولویت با تخفیف عادی)
  it('Scenario 4: denies affiliate discount when product already has standard sale discount', async () => {
    const partner = await affiliateRepo.findPartnerById('partner-reza-karimi');

    const evalResult = await calculationService.evaluateProductAffiliateDiscount(
      {
        productId: 'prod-discounted-router',
        price: 18000000,
        originalPrice: 20000000,
        discountPercent: 10,
      },
      partner,
    );

    expect(evalResult.isEligible).toBe(false);
    expect(evalResult.discountAmount).toBe(0);
    expect(evalResult.unitPriceAfterDiscount).toBe(18000000);
    expect(evalResult.reason).toContain('تخفیف عادی');
  });

  // Scenario 5: خرید محصول دارای تخفیف پلکانی (عدم ترکیب و عدم جایگزینی تخفیف پلکانی)
  it('Scenario 5: denies affiliate discount when product has tiered stepped discounts', async () => {
    const partner = await affiliateRepo.findPartnerById('00000000-0000-4000-a000-000000000002');

    const evalResult = await calculationService.evaluateProductAffiliateDiscount(
      {
        productId: 'prod-switch-c2960',
        price: 10000000,
        hasTieredDiscount: true,
      },
      partner,
    );

    expect(evalResult.isEligible).toBe(false);
    expect(evalResult.discountAmount).toBe(0);
    expect(evalResult.reason).toContain('تخفیف پلکانی');
  });

  // Scenario 6: خرید اینترنت و محاسبه پورسانت ۴۰۰ هزار تومانی
  it('Scenario 6: awards 400,000 Toman commission for internet product without applying discount', async () => {
    const partner = await affiliateRepo.findPartnerById('00000000-0000-4000-a000-000000000002');
    expect(partner).toBeDefined();

    // Verify it doesn't get discount
    const evalResult = await calculationService.evaluateProductAffiliateDiscount(
      {
        sku: 'INT-FTTH-300M',
        title: 'سرویس اینترنت پرسرعت FTTH',
        price: 2500000,
      },
      partner,
    );
    expect(evalResult.isEligible).toBe(false);
    expect(evalResult.reason).toContain('پورسانت');

    // Commission generation
    const commission = await calculationService.processOrderCommissions(
      {
        id: 'ord-test-net-01',
        orderNumber: 'VX-5501',
        payableAmount: 2500000,
        items: [
          {
            sku: 'INT-FTTH-300M',
            title: 'سرویس اینترنت پرسرعت FTTH',
            quantity: 1,
            unitPrice: 2500000,
          },
        ],
      },
      partner!.id,
    );

    expect(commission).toBe(400000);

    const commList = await affiliateRepo.findCommissions({ orderId: 'ord-test-net-01' });
    expect(commList.items.length).toBe(1);
    expect(commList.items[0].productType).toBe('INTERNET');
    expect(commList.items[0].unitCommission).toBe(400000);
    expect(commList.items[0].totalCommission).toBe(400000);
    expect(commList.items[0].status).toBe('PENDING');
  });

  // Scenario 7: خرید IP استاتیک و محاسبه پورسانت ۱۵۰ هزار تومانی
  it('Scenario 7: awards 150,000 Toman commission for static IP product', async () => {
    const partner = await affiliateRepo.findPartnerById('00000000-0000-4000-a000-000000000002');

    const commission = await calculationService.processOrderCommissions(
      {
        id: 'ord-test-ip-01',
        orderNumber: 'VX-5502',
        payableAmount: 600000,
        items: [
          {
            sku: 'IP-STATIC-SINGLE',
            title: 'بسته ۱ عدد IP استاتیک اختصاصی',
            quantity: 1,
            unitPrice: 600000,
          },
        ],
      },
      partner!.id,
    );

    expect(commission).toBe(150000);

    const commList = await affiliateRepo.findCommissions({ orderId: 'ord-test-ip-01' });
    expect(commList.items.length).toBe(1);
    expect(commList.items[0].productType).toBe('STATIC_IP');
    expect(commList.items[0].unitCommission).toBe(150000);
    expect(commList.items[0].totalCommission).toBe(150000);
  });

  // Scenario 8: خرید چند واحد از یک محصول اینترنت یا IP (ضرب پورسانت در تعداد)
  it('Scenario 8: scales commission linearly for multiple units of IP and internet products', async () => {
    const partner = await affiliateRepo.findPartnerById('partner-reza-karimi'); // has custom 200k IP and 500k internet

    const commission = await calculationService.processOrderCommissions(
      {
        id: 'ord-test-multi-01',
        orderNumber: 'VX-5503',
        payableAmount: 8000000,
        items: [
          {
            sku: 'IP-STATIC-SINGLE',
            title: 'بسته IP استاتیک',
            quantity: 4, // 4 units * 200k = 800k
            unitPrice: 600000,
          },
          {
            sku: 'INT-FTTH-300M',
            title: 'سرویس اینترنت سازمانی',
            quantity: 2, // 2 units * 500k = 1,000k
            unitPrice: 2500000,
          },
        ],
      },
      partner!.id,
    );

    expect(commission).toBe(1800000); // 800k + 1,000k

    const commList = await affiliateRepo.findCommissions({ orderId: 'ord-test-multi-01' });
    expect(commList.items.length).toBe(2);

    const ipComm = commList.items.find((c) => c.productType === 'STATIC_IP');
    expect(ipComm?.quantity).toBe(4);
    expect(ipComm?.unitCommission).toBe(200000);
    expect(ipComm?.totalCommission).toBe(800000);

    const netComm = commList.items.find((c) => c.productType === 'INTERNET');
    expect(netComm?.quantity).toBe(2);
    expect(netComm?.unitCommission).toBe(500000);
    expect(netComm?.totalCommission).toBe(1000000);
  });

  // Scenario 9: تغییر تنظیمات عمومی بدون تغییر تنظیمات اختصاصی همکار
  it('Scenario 9: changing global defaults preserves existing custom overrides of individual partners', async () => {
    const updateSettingsUseCase = new UpdateAffiliateSettingsUseCase(affiliateRepo);
    await updateSettingsUseCase.execute({
      defaultDiscountPercent: 10, // increased from 8 to 10
      defaultStaticIpCommission: 180000, // increased from 150k to 180k
      defaultInternetCommission: 450000, // increased from 400k to 450k
    });

    // Partner 1 had null custom rates, so should now reflect new global values
    const partner1 = await affiliateRepo.findPartnerById('00000000-0000-4000-a000-000000000002');
    const settings = await affiliateRepo.getSettings();
    expect(partner1?.getEffectiveDiscountPercent(settings.defaultDiscountPercent)).toBe(10);
    expect(partner1?.getEffectiveStaticIpCommission(settings.defaultStaticIpCommission)).toBe(180000);

    // Partner 2 had custom rates (12%, 200k, 500k), which MUST NOT change!
    const partner2 = await affiliateRepo.findPartnerById('partner-reza-karimi');
    expect(partner2?.customDiscountPercent).toBe(12);
    expect(partner2?.customStaticIpCommission).toBe(200000);
    expect(partner2?.customInternetCommission).toBe(500000);
    expect(partner2?.getEffectiveDiscountPercent(settings.defaultDiscountPercent)).toBe(12);
    expect(partner2?.getEffectiveStaticIpCommission(settings.defaultStaticIpCommission)).toBe(200000);
  });

  // Scenario 10: غیرفعال کردن همکاری یک کاربر
  it('Scenario 10: suspended / inactive partner receives neither discount nor commissions', async () => {
    const updatePartnerUseCase = new UpdateAffiliatePartnerUseCase(affiliateRepo);
    await updatePartnerUseCase.execute('00000000-0000-4000-a000-000000000002', {
      status: 'INACTIVE',
    });

    const partner = await affiliateRepo.findPartnerById('00000000-0000-4000-a000-000000000002');
    expect(partner?.status).toBe('INACTIVE');

    const evalResult = await calculationService.evaluateProductAffiliateDiscount(
      {
        productId: 'prod-switch-c2960',
        price: 10000000,
      },
      partner,
    );
    expect(evalResult.isEligible).toBe(false);

    const commAmount = await calculationService.processOrderCommissions(
      {
        id: 'ord-inactive-01',
        orderNumber: 'VX-9999',
        payableAmount: 5000000,
        items: [{ sku: 'INT-FTTH-300M', quantity: 1, unitPrice: 2500000 }],
      },
      partner!.id,
    );
    expect(commAmount).toBe(0);
  });

  // Scenario 11: لغو سفارش و اصلاح پورسانت
  it('Scenario 11: cancelling an order marks associated commissions as CANCELLED and adjusts partner stats', async () => {
    const partner = await affiliateRepo.findPartnerById('partner-reza-karimi');
    const initialApproved = partner!.approvedCommission;

    // Generate commission
    await calculationService.processOrderCommissions(
      {
        id: 'ord-to-cancel-01',
        orderNumber: 'VX-6611',
        payableAmount: 2500000,
        items: [{ sku: 'INT-FTTH-300M', quantity: 1, unitPrice: 2500000 }],
      },
      partner!.id,
    );

    let comms = await affiliateRepo.findCommissions({ orderId: 'ord-to-cancel-01' });
    expect(comms.items[0].status).toBe('PENDING');

    // Cancel order
    await affiliateRepo.cancelCommissionsByOrderId('ord-to-cancel-01');

    comms = await affiliateRepo.findCommissions({ orderId: 'ord-to-cancel-01' });
    expect(comms.items[0].status).toBe('CANCELLED');
    expect(comms.items[0].notes).toContain('لغو');

    const updatedPartner = await affiliateRepo.findPartnerById('partner-reza-karimi');
    expect(updatedPartner!.approvedCommission).toBe(initialApproved);
  });

  // Scenario 12: جلوگیری از محاسبه پورسانت تکراری
  it('Scenario 12: prevents duplicate commission calculation on identical orders or duplicate API triggers', async () => {
    const partner = await affiliateRepo.findPartnerById('partner-reza-karimi');

    // First run
    const comm1 = await calculationService.processOrderCommissions(
      {
        id: 'ord-idempotency-01',
        orderNumber: 'VX-7700',
        payableAmount: 1000000,
        items: [{ sku: 'IP-STATIC-SINGLE', quantity: 1, unitPrice: 600000 }],
      },
      partner!.id,
    );
    expect(comm1).toBe(200000);

    const partnerAfter1 = await affiliateRepo.findPartnerById('partner-reza-karimi');
    const salesAfter1 = partnerAfter1?.totalSales;
    const ordersAfter1 = partnerAfter1?.totalOrders;

    // Duplicate run with same orderId and productType
    const comm2 = await calculationService.processOrderCommissions(
      {
        id: 'ord-idempotency-01',
        orderNumber: 'VX-7700',
        payableAmount: 1000000,
        items: [{ sku: 'IP-STATIC-SINGLE', quantity: 1, unitPrice: 600000 }],
      },
      partner!.id,
    );
    expect(comm2).toBe(0);

    const partnerAfter2 = await affiliateRepo.findPartnerById('partner-reza-karimi');
    expect(partnerAfter2?.totalSales).toBe(salesAfter1);
    expect(partnerAfter2?.totalOrders).toBe(ordersAfter1);

    const commList = await affiliateRepo.findCommissions({ orderId: 'ord-idempotency-01' });
    expect(commList.items.length).toBe(1); // Still exactly 1
  });

  // Scenario 13: ثبت و مشاهده پرداخت پورسانت توسط ادمین
  it('Scenario 13: admin records commission payout, deducting from approved and adding to paid commission', async () => {
    const partner = await affiliateRepo.findPartnerById('partner-reza-karimi');
    const initialPaid = partner!.paidCommission;
    const initialApproved = partner!.approvedCommission;

    const createPayoutUseCase = new CreateAffiliatePayoutUseCase(affiliateRepo);
    const payout = await createPayoutUseCase.execute({
      partnerId: partner!.id,
      amount: 1500000,
      trackingCode: 'PAY-SATNA-998822',
      paymentMethod: 'SATNA_PAYA',
      description: 'تسویه پورسانت فروش اینترنت مهر ۱۴۰۵',
    });

    expect(payout.amount).toBe(1500000);
    expect(payout.trackingCode).toBe('PAY-SATNA-998822');
    expect(payout.status).toBe('COMPLETED');

    const updatedPartner = await affiliateRepo.findPartnerById('partner-reza-karimi');
    expect(updatedPartner!.paidCommission).toBe(initialPaid + 1500000);
    expect(updatedPartner!.approvedCommission).toBe(initialApproved - 1500000);

    const getPayoutsUseCase = new GetAffiliatePayoutsUseCase(affiliateRepo);
    const payoutsList = await getPayoutsUseCase.execute({ partnerId: partner!.id });
    expect(payoutsList.items.some((p) => p.trackingCode === 'PAY-SATNA-998822')).toBe(true);
  });

  // Scenario 14: بررسی عدم امکان دستکاری تخفیف و پورسانت از سمت کاربر (محاسبات نهایی در سرور)
  it('Scenario 14: server calculates exact discount and commissions independently of client inputs', async () => {
    const partner = await affiliateRepo.findPartnerById('00000000-0000-4000-a000-000000000002');

    // Customer attempts to send fabricated unitPrice or discount in order command
    const placedOrder = await createOrderUseCase.execute({
      userId: partner!.userId,
      items: [
        {
          productId: 'prod-switch-c2960',
          sku: 'WS-C2960X-24TD-L',
          quantity: 2,
          unitPrice: 1000, // Attacker tries to pass 1,000 Tomans instead of 10,000,000
        },
      ],
      shippingAddress: {
        recipientName: 'کامران رستمی',
        phoneNumber: '09162947222',
        province: 'تهران',
        city: 'تهران',
        postalCode: '1998765432',
        address: 'خیابان ولیعصر',
      },
    });

    // Server looked up real price (10,000,000) and computed exact 8% partner discount (800,000 per unit = 1,600,000 total)
    expect(placedOrder.financialSummary.subtotal).toBe(20000000); // 2 * 10M
    expect(placedOrder.financialSummary.affiliateDiscount).toBe(1600000); // 2 * 800k
    expect(placedOrder.financialSummary.payableTotal).toBe(18400000); // 20M - 1.6M
    expect(placedOrder.items[0].unitPrice).toBe(9200000); // 10M - 800k
  });

  // Scenario 15: خرید چند قلم مجزا از یک نوع خدمت (مثلاً ۲ بسته متفاوت IP استاتیک)
  it('Scenario 15: accurately creates distinct commission entries for multiple line items of same type', async () => {
    const partner = await affiliateRepo.findPartnerById('partner-reza-karimi');

    const totalComm = await calculationService.processOrderCommissions(
      {
        id: 'ord-multi-same-type-01',
        orderNumber: 'VX-8811',
        payableAmount: 3000000,
        items: [
          { sku: 'IP-STATIC-SINGLE', title: 'آی پی استاتیک انفرادی', quantity: 2, unitPrice: 500000 },
          { sku: 'IP-STATIC-BLOCK-4', title: 'بسته ۴ تایی IP استاتیک', quantity: 1, unitPrice: 2000000 },
        ],
      },
      partner!.id,
    );

    // Partner has custom 200k IP commission. Item 1: 2 * 200k = 400k. Item 2: 1 * 200k = 200k. Total = 600k.
    expect(totalComm).toBe(600000);

    const commList = await affiliateRepo.findCommissions({ orderId: 'ord-multi-same-type-01' });
    expect(commList.items.length).toBe(2);
    expect(commList.items.every((c) => c.productType === 'STATIC_IP')).toBe(true);
  });

  // Scenario 16: لغو سفارش و اصلاح آمار همکار و برگشت پورسانت (همراه با بررسی عدم اجرای مکرر)
  it('Scenario 16: updateOrderStatusUseCase to CANCELLED voids commissions and decrements partner stats once', async () => {
    const partner = await affiliateRepo.findPartnerById('00000000-0000-4000-a000-000000000002');
    const initialSales = partner!.totalSales;
    const initialOrders = partner!.totalOrders;

    // Place an order with affiliate code
    const placedOrder = await createOrderUseCase.execute({
      userId: partner!.userId,
      items: [
        {
          productId: 'prod-switch-c2960',
          sku: 'WS-C2960X-24TD-L',
          quantity: 1,
          unitPrice: 10000000,
        },
      ],
      shippingAddress: {
        recipientName: 'کامران رستمی',
        phoneNumber: '09162947222',
        province: 'تهران',
        city: 'تهران',
        postalCode: '1998765432',
        address: 'خیابان ولیعصر',
      },
      affiliateCode: partner!.partnerCode,
    });

    const partnerAfterOrder = await affiliateRepo.findPartnerById(partner!.id);
    expect(partnerAfterOrder!.totalOrders).toBe(initialOrders + 1);
    expect(partnerAfterOrder!.totalSales).toBe(initialSales + placedOrder.financialSummary.payableTotal);

    // Cancel order
    await updateOrderStatusUseCase.execute(placedOrder.orderId, 'CANCELLED');

    const partnerAfterCancel = await affiliateRepo.findPartnerById(partner!.id);
    expect(partnerAfterCancel!.totalOrders).toBe(initialOrders);
    expect(partnerAfterCancel!.totalSales).toBe(initialSales);

    // Second cancel call (idempotency check: totalSales and totalOrders must NOT be deducted again)
    await updateOrderStatusUseCase.execute(placedOrder.orderId, 'CANCELLED');
    const partnerAfterSecondCancel = await affiliateRepo.findPartnerById(partner!.id);
    expect(partnerAfterSecondCancel!.totalOrders).toBe(initialOrders);
    expect(partnerAfterSecondCancel!.totalSales).toBe(initialSales);
  });

  // Scenario 17: سفارش شامل کالای دارای تخفیف پلکانی نباید تخفیف همکاری دریافت کند
  it('Scenario 17: createOrderUseCase does not apply affiliate discount to products with tiered discounts', async () => {
    const tieredProduct = new Product({
      id: 'prod-tiered-cable-cat6',
      name: 'کابل شبکه لگراند Cat6 SFTP',
      slug: 'legrand-cat6-sftp-cable',
      sku: 'LEG-CAT6-SFTP',
      category: 'cables',
      brand: 'Legrand',
      price: 5000000,
      costPrice: 4000000,
      stock: 50,
      minStockAlert: 5,
      reservedStock: 0,
      warehouseLocation: 'CABLE-RACK',
      status: 'active',
      featured: false,
      rating: 4.7,
      reviewCount: 12,
      images: ['https://example.com/cable.jpg'],
      specs: ['Cat6 SFTP', '305m Reel'],
      shortDescription: 'قرقره ۳۰۵ متری کابل شبکه',
      tieredPricing: [{ minQuantity: 5, discountPercent: 15, label: 'خرید عمده بالای ۵ قرقره' }],
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    await productRepo.save(tieredProduct);

    const partner = await affiliateRepo.findPartnerById('00000000-0000-4000-a000-000000000002');

    const placedOrder = await createOrderUseCase.execute({
      userId: partner!.userId,
      items: [
        {
          productId: 'prod-tiered-cable-cat6',
          sku: 'LEG-CAT6-SFTP',
          quantity: 2,
          unitPrice: 5000000,
        },
      ],
      shippingAddress: {
        recipientName: 'کامران رستمی',
        phoneNumber: '09162947222',
        province: 'تهران',
        city: 'تهران',
        postalCode: '1998765432',
        address: 'خیابان ولیعصر',
      },
      affiliateCode: partner!.partnerCode,
    });

    // Should receive 0 affiliate discount
    expect(placedOrder.financialSummary.affiliateDiscount).toBe(0);
    expect(placedOrder.financialSummary.subtotal).toBe(10000000);
    expect(placedOrder.financialSummary.payableTotal).toBe(10000000);
  });

  // Scenario 18: بررسی اعمال دقیق لیست سفید دسته‌بندی‌ها در تنظیمات عمومی
  it('Scenario 18: enforces category whitelist when eligibleCategoryIds is defined in settings', async () => {
    const updateSettingsUseCase = new UpdateAffiliateSettingsUseCase(affiliateRepo);
    await updateSettingsUseCase.execute({
      eligibleCategoryIds: ['switches'], // Only switches are eligible!
    });

    const partner = await affiliateRepo.findPartnerById('00000000-0000-4000-a000-000000000002');

    // Switch -> Eligible!
    const switchEval = await calculationService.evaluateProductAffiliateDiscount(
      {
        productId: 'prod-switch-c2960',
        categoryId: 'switches',
        price: 10000000,
      },
      partner,
    );
    expect(switchEval.isEligible).toBe(true);
    expect(switchEval.discountPercent).toBe(8);

    // Router -> NOT whitelisted -> Ineligible!
    const routerEval = await calculationService.evaluateProductAffiliateDiscount(
      {
        productId: 'prod-regular-router',
        categoryId: 'routers',
        price: 15000000,
      },
      partner,
    );
    expect(routerEval.isEligible).toBe(false);
    expect(routerEval.discountAmount).toBe(0);
    expect(routerEval.reason).toContain('لیست مشمولین');

    // Reset settings whitelist back to empty
    await updateSettingsUseCase.execute({
      eligibleCategoryIds: [],
    });
  });
});
