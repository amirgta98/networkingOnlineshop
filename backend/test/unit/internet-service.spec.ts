import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  InternetService,
  CreateInternetPlanDto,
  CalculateInternetCostDto,
  CreateInternetOrderDto,
} from '../../src/application/services/internet.service.js';
import { NightTrafficType, InternetOrderStatus } from '@prisma/client';
import { NotFoundException, ForbiddenException, BadRequestException, UnauthorizedException } from '@nestjs/common';

describe('InternetService', () => {
  let service: InternetService;
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = {
      internetPlan: {
        count: vi.fn(),
        createMany: vi.fn(),
        findMany: vi.fn(),
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
      internetSetting: {
        findMany: vi.fn(),
        upsert: vi.fn(),
      },
      internetOrder: {
        count: vi.fn(),
        create: vi.fn(),
        findMany: vi.fn(),
        findUnique: vi.fn(),
        update: vi.fn(),
      },
      user: {
        findUnique: vi.fn(),
      },
      userAddress: {
        findUnique: vi.fn(),
        findMany: vi.fn(),
      },
    };

    service = new InternetService(mockPrisma as any);
  });

  describe('calculateCost', () => {
    it('calculates 12-month plan cost with 20% discount and static IP and modem correctly', async () => {
      const mockPlan = {
        id: 'plan-1',
        title: 'FTTH Turbo',
        monthlyPrice: BigInt(2000000),
        discountYearly: 20,
        discountSixMonths: 10,
        discountThreeMonths: 5,
        isActive: true,
      };

      mockPrisma.internetPlan.findUnique.mockResolvedValue(mockPlan);
      mockPrisma.internetSetting.findMany.mockResolvedValue([
        { key: 'static_ip_monthly_price', value: '250000' },
        { key: 'modem_price', value: '3850000' },
        { key: 'installation_price', value: '450000' },
        { key: 'partner_internet_commission', value: '400000' },
        { key: 'partner_static_ip_commission', value: '150000' },
      ]);

      const dto: CalculateInternetCostDto = {
        planId: 'plan-1',
        serviceDurationMonths: 12,
        hasStaticIp: true,
        includeModem: true,
        includeInstallation: true,
      };

      const result = await service.calculateCost(dto);

      expect(result.planId).toBe('plan-1');
      expect(result.durationMonths).toBe(12);
      expect(result.baseMonthlyPrice).toBe(2000000);
      expect(result.discountPercent).toBe(20);
      expect(result.discountedMonthlyPrice).toBe(1600000);
      expect(result.planDurationTotal).toBe(19200000);
      expect(result.planDiscountAmount).toBe(4800000);

      // Static IP: 250000 with 20% discount for 12 months = 200000 * 12 = 2400000
      expect(result.hasStaticIp).toBe(true);
      expect(result.staticIpMonthlyDiscounted).toBe(200000);
      expect(result.staticIpTotal).toBe(2400000);

      // Addons: modem (3850000) + install (450000) = 4300000
      expect(result.modemCost).toBe(3850000);
      expect(result.installationCost).toBe(450000);
      expect(result.addonsTotal).toBe(4300000);

      // Final amount = 19200000 + 2400000 + 4300000 = 25900000
      expect(result.finalAmount).toBe(25900000);
      expect(result.partnerCommission).toBe(550000);
    });

    it('throws NotFoundException if plan does not exist', async () => {
      mockPrisma.internetPlan.findUnique.mockResolvedValue(null);

      await expect(
        service.calculateCost({ planId: 'non-existent', serviceDurationMonths: 1 }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('createOrder', () => {
    it('throws UnauthorizedException if userId is missing', async () => {
      const dto: CreateInternetOrderDto = {
        planId: 'plan-1',
        serviceDurationMonths: 12,
        fullName: 'علی رضایی',
        phoneNumber: '09123456789',
        province: 'تهران',
        city: 'تهران',
        address: 'خیابان آزادی',
      };

      await expect(service.createOrder(dto, '')).rejects.toThrow(UnauthorizedException);
    });

    it('throws ForbiddenException if user cannot buy internet and is not admin or partner', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        canBuyInternet: false,
        roles: [],
      });

      const dto: CreateInternetOrderDto = {
        planId: 'plan-1',
        serviceDurationMonths: 12,
        fullName: 'علی رضایی',
        phoneNumber: '09123456789',
        province: 'تهران',
        city: 'تهران',
        address: 'خیابان آزادی',
      };

      await expect(service.createOrder(dto, 'user-1')).rejects.toThrow(ForbiddenException);
    });

    it('creates order successfully for user with canBuyInternet: true', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        canBuyInternet: true,
        roles: [],
      });

      mockPrisma.internetPlan.findUnique.mockResolvedValue({
        id: 'plan-1',
        title: 'FTTH Turbo',
        monthlyPrice: BigInt(2000000),
        discountYearly: 20,
        discountSixMonths: 10,
        discountThreeMonths: 5,
        isActive: true,
      });

      mockPrisma.internetSetting.findMany.mockResolvedValue([]);
      mockPrisma.internetOrder.findUnique.mockResolvedValue(null); // No collision

      mockPrisma.internetOrder.create.mockImplementation((args: any) => ({
        id: 'order-1',
        ...args.data,
      }));

      const dto: CreateInternetOrderDto = {
        planId: 'plan-1',
        serviceDurationMonths: 12,
        fullName: 'علی رضایی',
        phoneNumber: '09123456789',
        province: 'تهران',
        city: 'تهران',
        address: 'خیابان آزادی',
      };

      const result = await service.createOrder(dto, 'user-1');

      expect(result).toBeDefined();
      expect(result.id).toBe('order-1');
      expect(result.trackingCode).toMatch(/^NET-ISP-\d+$/);
      expect(result.status).toBe(InternetOrderStatus.PENDING);
      expect(result.finalAmount).toBeGreaterThan(0);
    });

    it('allows partner to create order even if canBuyInternet is false on user record', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'partner-user-1',
        canBuyInternet: false, // Default in DB
        roles: [{ role: { name: 'partner' } }],
      });

      mockPrisma.internetPlan.findUnique.mockResolvedValue({
        id: 'plan-1',
        title: 'FTTH Turbo',
        monthlyPrice: BigInt(2000000),
        discountYearly: 20,
        discountSixMonths: 10,
        discountThreeMonths: 5,
        isActive: true,
      });

      mockPrisma.internetSetting.findMany.mockResolvedValue([]);
      mockPrisma.internetOrder.findUnique.mockResolvedValue(null);

      mockPrisma.userAddress.findUnique.mockResolvedValue({
        id: 'site-1',
        userId: 'partner-user-1',
        type: 'NETWORK_PROJECT_SITE',
      });

      mockPrisma.internetOrder.create.mockImplementation((args: any) => ({
        id: 'order-p1',
        ...args.data,
      }));

      const dto: CreateInternetOrderDto = {
        planId: 'plan-1',
        siteId: 'site-1',
        serviceDurationMonths: 12,
        fullName: 'همکار رسمی',
        phoneNumber: '09123456789',
        province: 'تهران',
        city: 'تهران',
        address: 'کارگاه پروژه',
      };

      const result = await service.createOrder(dto, 'partner-user-1');
      expect(result).toBeDefined();
      expect(result.siteId).toBe('site-1');
    });

    it('rejects partner order if siteId is missing', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'partner-user-1',
        canBuyInternet: true,
        roles: [{ role: { name: 'partner' } }],
      });

      mockPrisma.internetPlan.findUnique.mockResolvedValue({
        id: 'plan-1',
        isActive: true,
        monthlyPrice: BigInt(2000000),
        discountYearly: 20,
      });

      const dto: CreateInternetOrderDto = {
        planId: 'plan-1',
        // siteId omitted!
        serviceDurationMonths: 12,
        fullName: 'همکار سازمانی',
        phoneNumber: '09123456789',
        province: 'اصفهان',
        city: 'اصفهان',
        address: 'شهرک صنعتی',
      };

      await expect(service.createOrder(dto, 'partner-user-1')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('rejects partner order if siteId does not belong to the partner', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'partner-user-1',
        canBuyInternet: true,
        roles: [{ role: { name: 'partner' } }],
      });

      mockPrisma.internetPlan.findUnique.mockResolvedValue({
        id: 'plan-1',
        isActive: true,
        monthlyPrice: BigInt(2000000),
        discountYearly: 20,
      });

      mockPrisma.userAddress.findUnique.mockResolvedValue({
        id: 'site-999',
        userId: 'other-user', // Not matching partner-user-1
        type: 'NETWORK_PROJECT_SITE',
      });

      const dto: CreateInternetOrderDto = {
        planId: 'plan-1',
        siteId: 'site-999',
        serviceDurationMonths: 12,
        fullName: 'همکار سازمانی',
        phoneNumber: '09123456789',
        province: 'اصفهان',
        city: 'اصفهان',
        address: 'شهرک صنعتی',
      };

      await expect(service.createOrder(dto, 'partner-user-1')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('rejects partner order if address type is not NETWORK_PROJECT_SITE', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'partner-user-1',
        canBuyInternet: true,
        roles: [{ role: { name: 'partner' } }],
      });

      mockPrisma.internetPlan.findUnique.mockResolvedValue({
        id: 'plan-1',
        isActive: true,
        monthlyPrice: BigInt(2000000),
        discountYearly: 20,
      });

      mockPrisma.userAddress.findUnique.mockResolvedValue({
        id: 'site-home',
        userId: 'partner-user-1',
        type: 'PERSONAL_RESIDENCE', // Wrong type!
      });

      const dto: CreateInternetOrderDto = {
        planId: 'plan-1',
        siteId: 'site-home',
        serviceDurationMonths: 12,
        fullName: 'همکار سازمانی',
        phoneNumber: '09123456789',
        province: 'اصفهان',
        city: 'اصفهان',
        address: 'شهرک صنعتی',
      };

      await expect(service.createOrder(dto, 'partner-user-1')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('Admin Plan CRUD', () => {
    it('creates a new plan with default discounts and serializes BigInt', async () => {
      mockPrisma.internetPlan.create.mockImplementation((args: any) => ({
        id: 'new-plan-1',
        ...args.data,
      }));

      const dto: CreateInternetPlanDto = {
        title: 'پلن اختصاصی جدید',
        monthlyPrice: 3500000,
        isFeatured: true,
        sortOrder: 5,
        nightTraffic: NightTrafficType.NORMAL,
      };

      const created = await service.createPlan(dto);
      expect(created.id).toBe('new-plan-1');
      expect(created.title).toBe('پلن اختصاصی جدید');
      expect(created.monthlyPrice).toBe(3500000);
      expect(typeof created.monthlyPrice).toBe('number');
    });

    it('deactivates plan instead of hard deleting if plan has orders', async () => {
      mockPrisma.internetPlan.findUnique.mockResolvedValue({
        id: 'plan-with-orders',
        isActive: true,
        monthlyPrice: BigInt(1000000),
      });

      mockPrisma.internetOrder.count.mockResolvedValue(3); // 3 orders exist
      mockPrisma.internetPlan.update.mockResolvedValue({
        id: 'plan-with-orders',
        isActive: false,
        monthlyPrice: BigInt(1000000),
      });

      const res = await service.deletePlan('plan-with-orders');
      expect(res.action).toBe('deactivated');
      expect(mockPrisma.internetPlan.delete).not.toHaveBeenCalled();
      expect(mockPrisma.internetPlan.update).toHaveBeenCalledWith({
        where: { id: 'plan-with-orders' },
        data: { isActive: false },
      });
    });
  });
});
