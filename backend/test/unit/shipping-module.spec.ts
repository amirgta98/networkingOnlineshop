import { describe, it, expect, beforeEach } from 'vitest';
import { InMemoryShippingRepository } from '../../src/infrastructure/database/in-memory/in-memory-shipping.repository.js';
import { GetShippingMethodsUseCase } from '../../src/application/use-cases/shipping/get-shipping-methods.use-case.js';
import { GetDeliveryScheduleUseCase } from '../../src/application/use-cases/shipping/get-delivery-schedule.use-case.js';
import { CalculateShippingUseCase } from '../../src/application/use-cases/shipping/calculate-shipping.use-case.js';
import { ManageShippingMethodsUseCase } from '../../src/application/use-cases/shipping/manage-shipping-methods.use-case.js';
import { ManageShippingConfigUseCase } from '../../src/application/use-cases/shipping/manage-shipping-config.use-case.js';

describe('Shipping Module Unit Tests', () => {
  let repository: InMemoryShippingRepository;
  let getShippingMethodsUseCase: GetShippingMethodsUseCase;
  let getDeliveryScheduleUseCase: GetDeliveryScheduleUseCase;
  let calculateShippingUseCase: CalculateShippingUseCase;
  let manageShippingMethodsUseCase: ManageShippingMethodsUseCase;
  let manageShippingConfigUseCase: ManageShippingConfigUseCase;

  beforeEach(() => {
    repository = new InMemoryShippingRepository();
    getShippingMethodsUseCase = new GetShippingMethodsUseCase(repository);
    getDeliveryScheduleUseCase = new GetDeliveryScheduleUseCase(repository);
    calculateShippingUseCase = new CalculateShippingUseCase(repository);
    manageShippingMethodsUseCase = new ManageShippingMethodsUseCase(repository);
    manageShippingConfigUseCase = new ManageShippingConfigUseCase(repository);
  });

  describe('Initial Seeded Methods', () => {
    it('should return 5 active methods by default', async () => {
      const methods = await getShippingMethodsUseCase.execute();
      expect(methods).toHaveLength(5);
      const ids = methods.map((m) => m.id);
      expect(ids).toContain('express_courier');
      expect(ids).toContain('tipax_express');
      expect(ids).toContain('heavy_freight');
      expect(ids).toContain('warehouse_pickup');
      expect(ids).toContain('post_pishtaz');
    });

    it('should filter methods based on province restriction', async () => {
      // Tehran should have express courier and warehouse pickup
      const tehranMethods = await getShippingMethodsUseCase.execute({ province: 'تهران' });
      expect(tehranMethods.some((m) => m.id === 'express_courier')).toBe(true);
      expect(tehranMethods.some((m) => m.id === 'warehouse_pickup')).toBe(true);

      // Fars (Shiraz) should NOT have express courier or warehouse pickup
      const farsMethods = await getShippingMethodsUseCase.execute({ province: 'فارس' });
      expect(farsMethods.some((m) => m.id === 'express_courier')).toBe(false);
      expect(farsMethods.some((m) => m.id === 'warehouse_pickup')).toBe(false);
      expect(farsMethods.some((m) => m.id === 'tipax_express')).toBe(true);
      expect(farsMethods.some((m) => m.id === 'heavy_freight')).toBe(true);
      expect(farsMethods.some((m) => m.id === 'post_pishtaz')).toBe(true);
    });
  });

  describe('Calculate Shipping & Free Thresholds', () => {
    it('should return normal cost if subtotal is below free threshold', async () => {
      const res = await calculateShippingUseCase.execute({
        methodId: 'express_courier',
        subtotal: 3000000, // threshold is 5,000,000
      });

      expect(res.isFree).toBe(false);
      expect(res.cost).toBe(45000);
      expect(res.amountNeededForFree).toBe(2000000);
    });

    it('should return 0 cost if subtotal reaches free threshold', async () => {
      const res = await calculateShippingUseCase.execute({
        methodId: 'express_courier',
        subtotal: 5000000,
      });

      expect(res.isFree).toBe(true);
      expect(res.cost).toBe(0);
      expect(res.amountNeededForFree).toBe(0);
    });

    it('should handle zero-cost method (warehouse pickup)', async () => {
      const res = await calculateShippingUseCase.execute({
        methodId: 'warehouse_pickup',
        subtotal: 100000,
      });

      expect(res.isFree).toBe(true);
      expect(res.cost).toBe(0);
      expect(res.amountNeededForFree).toBe(0);
    });
  });

  describe('Manage Shipping Methods', () => {
    it('should create, update, toggle and delete a shipping method', async () => {
      // 1. Create
      const created = await manageShippingMethodsUseCase.create({
        id: 'special_drone',
        title: 'ارسال با پهپاد',
        subtitle: 'تحویل فوق سریع نیم ساعته',
        description: 'مخصوص قطعات بسیار ضروری دیتا سنتر',
        cost: 250000,
        freeThreshold: 20000000,
        estimatedDeliveryTime: '۳۰ دقیقه',
        iconName: 'zap',
        isExpress: true,
        allowedProvinces: ['تهران'],
      });

      expect(created.id).toBe('special_drone');
      expect(created.cost).toBe(250000);
      expect(created.isActive).toBe(true);

      // 2. Toggle Active
      const toggled = await manageShippingMethodsUseCase.toggle('special_drone');
      expect(toggled.isActive).toBe(false);

      // Inactive should not be in public listing
      const activeMethods = await getShippingMethodsUseCase.execute();
      expect(activeMethods.some((m) => m.id === 'special_drone')).toBe(false);

      // But should be in admin listing (includeInactive: true)
      const allMethods = await getShippingMethodsUseCase.execute({ includeInactive: true });
      expect(allMethods.some((m) => m.id === 'special_drone')).toBe(true);

      // 3. Update
      const updated = await manageShippingMethodsUseCase.update('special_drone', {
        cost: 300000,
        isActive: true,
      });
      expect(updated.cost).toBe(300000);
      expect(updated.isActive).toBe(true);

      // 4. Delete
      const deleted = await manageShippingMethodsUseCase.delete('special_drone');
      expect(deleted).toBe(true);
      const afterDelete = await manageShippingMethodsUseCase.getById('special_drone');
      expect(afterDelete).toBeNull();
    });
  });

  describe('Delivery Schedule and Time Slots', () => {
    it('should return upcoming delivery days with Jalali labels and active time slots', async () => {
      const schedule = await getDeliveryScheduleUseCase.execute();
      expect(schedule.length).toBeGreaterThan(0);
      expect(schedule[0].jalaliDate).toBeDefined();
      expect(schedule[0].dayName).toBeDefined();
      expect(schedule[0].slots.length).toBe(3);
      expect(schedule[0].slots[0].id).toBe('morning');
    });

    it('should manage time slots', async () => {
      const createdSlot = await manageShippingConfigUseCase.createTimeSlot({
        id: 'midnight',
        title: 'نیمه‌شب (ساعت ۲۳ الی ۲ بامداد)',
        startTime: '23:00',
        endTime: '02:00',
        description: 'مخصوص نگهداری و اورهال شبانه دیتاسنتر',
        maxCapacity: 10,
      });

      expect(createdSlot.id).toBe('midnight');
      const allSlots = await manageShippingConfigUseCase.getAllTimeSlots(true);
      expect(allSlots.some((s) => s.id === 'midnight')).toBe(true);

      // Update
      const updated = await manageShippingConfigUseCase.updateTimeSlot('midnight', {
        maxCapacity: 15,
      });
      expect(updated.maxCapacity).toBe(15);

      // Delete
      const deleted = await manageShippingConfigUseCase.deleteTimeSlot('midnight');
      expect(deleted).toBe(true);
    });

    it('should update shipping configuration', async () => {
      const config = await manageShippingConfigUseCase.getConfig();
      expect(config.sameDayCutoffHour).toBe(14);

      const updated = await manageShippingConfigUseCase.updateConfig({
        sameDayCutoffHour: 16,
        daysInAdvance: 10,
      });

      expect(updated.sameDayCutoffHour).toBe(16);
      expect(updated.daysInAdvance).toBe(10);
    });

    it('should skip configured holidays from delivery schedule', async () => {
      // 1. Get initial schedule
      const initial = await getDeliveryScheduleUseCase.execute();
      expect(initial.length).toBeGreaterThan(0);
      const targetHolidayDate = initial[0].date;

      // 2. Set this date as a holiday
      await manageShippingConfigUseCase.updateConfig({
        holidayDates: [targetHolidayDate],
      });

      // 3. New schedule must not include that date
      const updated = await getDeliveryScheduleUseCase.execute();
      expect(updated.some((d) => d.date === targetHolidayDate)).toBe(false);
    });

    it('should return all methods when includeRestricted is true', async () => {
      const methods = await getShippingMethodsUseCase.execute({
        province: 'فارس',
        includeRestricted: true,
      });
      expect(methods.length).toBe(5);
      expect(methods.some((m) => m.id === 'express_courier')).toBe(true);
    });

    it('should verify exact free threshold boundary at 4,999,999 vs 5,000,000', async () => {
      const below = await calculateShippingUseCase.execute({
        methodId: 'express_courier',
        subtotal: 4999999,
      });
      expect(below.isFree).toBe(false);
      expect(below.cost).toBe(45000);
      expect(below.amountNeededForFree).toBe(1);

      const exact = await calculateShippingUseCase.execute({
        methodId: 'express_courier',
        subtotal: 5000000,
      });
      expect(exact.isFree).toBe(true);
      expect(exact.cost).toBe(0);
      expect(exact.amountNeededForFree).toBe(0);
    });
  });

  describe('Province-Specific Shipping Rules & Overrides', () => {
    it('should apply province-specific pricing override when province is specified', async () => {
      // Default Tipax cost is 75,000
      const defaultCalc = await calculateShippingUseCase.execute({
        methodId: 'tipax_express',
        subtotal: 2000000,
      });
      expect(defaultCalc.cost).toBe(75000);
      expect(defaultCalc.isProvinceCustomized).toBe(false);

      // Tehran override cost is 60,000
      const tehranCalc = await calculateShippingUseCase.execute({
        methodId: 'tipax_express',
        subtotal: 2000000,
        province: 'تهران',
      });
      expect(tehranCalc.cost).toBe(60000);
      expect(tehranCalc.estimatedDeliveryTime).toBe('۲۴ ساعت کاری');
      expect(tehranCalc.isProvinceCustomized).toBe(true);

      // Khorasan Razavi override cost is 85,000
      const khorasanCalc = await calculateShippingUseCase.execute({
        methodId: 'tipax_express',
        subtotal: 2000000,
        province: 'خراسان رضوی',
      });
      expect(khorasanCalc.cost).toBe(85000);
      expect(khorasanCalc.estimatedDeliveryTime).toBe('۴۸ ساعت کاری');
      expect(khorasanCalc.isProvinceCustomized).toBe(true);
    });

    it('should apply province-specific free shipping override (isFree: true)', async () => {
      // Tipax for Qom is configured with isFree: true
      const qomCalc = await calculateShippingUseCase.execute({
        methodId: 'tipax_express',
        subtotal: 500000, // Small order
        province: 'قم',
      });

      expect(qomCalc.isFree).toBe(true);
      expect(qomCalc.cost).toBe(0);
      expect(qomCalc.amountNeededForFree).toBe(0);
      expect(qomCalc.isProvinceCustomized).toBe(true);
    });

    it('should apply province-specific custom free threshold', async () => {
      // Default Tipax threshold is 8,000,000
      // Tehran Tipax threshold is 6,000,000
      const subtotal7mTehran = await calculateShippingUseCase.execute({
        methodId: 'tipax_express',
        subtotal: 7000000,
        province: 'تهران',
      });
      // 7M >= 6M -> Free for Tehran!
      expect(subtotal7mTehran.isFree).toBe(true);
      expect(subtotal7mTehran.cost).toBe(0);

      const subtotal7mDefault = await calculateShippingUseCase.execute({
        methodId: 'tipax_express',
        subtotal: 7000000,
        province: 'یزد', // No rule -> uses default threshold 8M
      });
      // 7M < 8M -> Not free for Yazd!
      expect(subtotal7mDefault.isFree).toBe(false);
      expect(subtotal7mDefault.cost).toBe(75000);
      expect(subtotal7mDefault.amountNeededForFree).toBe(1000000);
    });

    it('should create and update methods with custom provinceRules and iconUrl', async () => {
      const created = await manageShippingMethodsUseCase.create({
        title: 'چاپار اختصاصی',
        subtitle: 'حمل هوایی و زمینی اکسپرس',
        description: 'تحویل سریع قطعات سرور',
        cost: 90000,
        freeThreshold: 10000000,
        estimatedDeliveryTime: '۲ روز',
        iconName: 'truck',
        iconUrl: '/uploads/icons/carrier-chapar.png',
        allowedProvinces: [],
        provinceRules: [
          {
            province: 'اصفهان',
            cost: 45000,
            estimatedDeliveryTime: '۱ روز کاری',
            freeThreshold: 4000000,
          },
          {
            province: 'سیستان و بلوچستان',
            cost: 130000,
            estimatedDeliveryTime: '۳ الی ۴ روز کاری',
            freeThreshold: 15000000,
          },
        ],
      });

      expect(created.iconUrl).toBe('/uploads/icons/carrier-chapar.png');
      expect(created.provinceRules).toHaveLength(2);

      // Verify calculation for Isfahan
      const isfahanCost = created.calculateCost(2000000, 'اصفهان');
      expect(isfahanCost).toBe(45000);
      expect(created.getEffectiveDeliveryTime('اصفهان')).toBe('۱ روز کاری');

      // Verify calculation for Sistan & Baluchestan
      const sistanCost = created.calculateCost(2000000, 'سیستان و بلوچستان');
      expect(sistanCost).toBe(130000);

      // Verify calculation for unspecified province (fallback to base)
      const tehranCost = created.calculateCost(2000000, 'تهران');
      expect(tehranCost).toBe(90000);
      expect(created.getEffectiveDeliveryTime('تهران')).toBe('۲ روز');
    });

    it('should strictly distinguish overlapping province names (Kerman vs Kermanshah)', async () => {
      const method = await manageShippingMethodsUseCase.create({
        title: 'پست پیشتاز کویر',
        subtitle: 'حمل مرسوله',
        description: 'تست استان‌ها',
        cost: 60000,
        estimatedDeliveryTime: '۳ روز',
        iconName: 'box',
        allowedProvinces: ['کرمان'],
        provinceRules: [
          {
            province: 'کرمان',
            cost: 20000,
            estimatedDeliveryTime: '۱ روز',
          },
        ],
      });

      // 1. Kerman destination matches Kerman rule
      expect(method.isAvailableFor('کرمان')).toBe(true);
      expect(method.isAvailableFor('استان کرمان')).toBe(true);
      expect(method.calculateCost(100000, 'کرمان')).toBe(20000);
      expect(method.getEffectiveDeliveryTime('کرمان')).toBe('۱ روز');

      // 2. Kermanshah destination MUST NOT match Kerman rule and MUST NOT be available
      expect(method.isAvailableFor('کرمانشاه')).toBe(false);
      expect(method.isAvailableFor('استان کرمانشاه')).toBe(false);
      expect(method.findProvinceRule('کرمانشاه')).toBeUndefined();
      expect(method.calculateCost(100000, 'کرمانشاه')).toBe(60000); // base cost
      expect(method.getEffectiveDeliveryTime('کرمانشاه')).toBe('۳ روز'); // base delivery time
    });

    it('should treat cost: 0 as completely free with zero effective threshold', async () => {
      const method = await manageShippingMethodsUseCase.create({
        title: 'ارسال رایگان ویژه',
        subtitle: '',
        description: '',
        cost: 40000,
        freeThreshold: 5000000,
        estimatedDeliveryTime: '۲ روز',
        iconName: 'truck',
        provinceRules: [
          {
            province: 'یزد',
            cost: 0,
          },
        ],
      });

      expect(method.calculateCost(50000, 'یزد')).toBe(0);
      expect(method.isFreeFor(50000, 'یزد')).toBe(true);
      expect(method.getEffectiveFreeThreshold('یزد')).toBe(0);

      // Other province uses standard threshold
      expect(method.calculateCost(50000, 'اصفهان')).toBe(40000);
      expect(method.isFreeFor(50000, 'اصفهان')).toBe(false);
      expect(method.getEffectiveFreeThreshold('اصفهان')).toBe(5000000);
    });
  });
});
