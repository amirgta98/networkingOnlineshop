import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../infrastructure/database/prisma/prisma.service.js';
import { NightTrafficType, InternetOrderStatus } from '@prisma/client';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsArray,
  IsEnum,
  Min,
  Max,
} from 'class-validator';

export class CreateInternetPlanDto {
  @IsString()
  @IsOptional()
  badge?: string;

  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsOptional()
  internationalTraffic?: number | null;

  @IsNumber()
  @IsOptional()
  domesticTraffic?: number | null;

  @IsEnum(NightTrafficType)
  @IsOptional()
  nightTraffic?: NightTrafficType;

  @IsArray()
  @IsOptional()
  features?: string[];

  @IsNumber()
  @Min(0)
  monthlyPrice!: number;

  @IsBoolean()
  @IsOptional()
  isFeatured?: boolean;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsNumber()
  @IsOptional()
  sortOrder?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  discountThreeMonths?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  discountSixMonths?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  discountYearly?: number;
}

export class UpdateInternetPlanDto {
  @IsString()
  @IsOptional()
  badge?: string;

  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsOptional()
  internationalTraffic?: number | null;

  @IsNumber()
  @IsOptional()
  domesticTraffic?: number | null;

  @IsEnum(NightTrafficType)
  @IsOptional()
  nightTraffic?: NightTrafficType;

  @IsArray()
  @IsOptional()
  features?: string[];

  @IsNumber()
  @IsOptional()
  @Min(0)
  monthlyPrice?: number;

  @IsBoolean()
  @IsOptional()
  isFeatured?: boolean;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsNumber()
  @IsOptional()
  sortOrder?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  discountThreeMonths?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  discountSixMonths?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  discountYearly?: number;
}

export class CalculateInternetCostDto {
  @IsString()
  @IsNotEmpty()
  planId!: string;

  @IsNumber()
  @IsOptional()
  serviceDurationMonths: number = 12; // 1, 3, 6, 12

  @IsBoolean()
  @IsOptional()
  hasStaticIp?: boolean;

  @IsBoolean()
  @IsOptional()
  includeModem?: boolean;

  @IsBoolean()
  @IsOptional()
  includeInstallation?: boolean;
}

export class CreateInternetOrderDto {
  @IsString()
  @IsNotEmpty()
  planId!: string;

  @IsString()
  @IsOptional()
  siteId?: string;

  @IsNumber()
  @IsOptional()
  serviceDurationMonths: number = 12;

  @IsBoolean()
  @IsOptional()
  hasStaticIp?: boolean;

  @IsBoolean()
  @IsOptional()
  includeModem?: boolean;

  @IsBoolean()
  @IsOptional()
  includeInstallation?: boolean;

  @IsString()
  @IsNotEmpty()
  fullName!: string;

  @IsString()
  @IsOptional()
  companyName?: string;

  @IsString()
  @IsNotEmpty()
  phoneNumber!: string;

  @IsString()
  @IsOptional()
  nationalCode?: string;

  @IsString()
  @IsNotEmpty()
  province!: string;

  @IsString()
  @IsNotEmpty()
  city!: string;

  @IsString()
  @IsNotEmpty()
  address!: string;

  @IsString()
  @IsOptional()
  landlineNumber?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class UpdateInternetOrderStatusDto {
  @IsEnum(InternetOrderStatus)
  @IsNotEmpty()
  status!: InternetOrderStatus;
}

export class InternetOrderQueryDto {
  @IsString()
  @IsOptional()
  status?: string;

  @IsString()
  @IsOptional()
  search?: string;

  @IsNumber()
  @IsOptional()
  page?: number;

  @IsNumber()
  @IsOptional()
  limit?: number;
}

@Injectable()
export class InternetService {
  private readonly logger = new Logger(InternetService.name);

  constructor(private readonly prisma: PrismaService) {}

  // ─── Helpers: Serialization ──────────────────────────────────

  private serializePlan(plan: any) {
    if (!plan) return null;
    return {
      ...plan,
      monthlyPrice: Number(plan.monthlyPrice),
    };
  }

  private serializeOrder(order: any) {
    if (!order) return null;
    return {
      ...order,
      baseAmount: Number(order.baseAmount),
      discountAmount: Number(order.discountAmount),
      staticIpAmount: Number(order.staticIpAmount),
      addonsAmount: Number(order.addonsAmount),
      finalAmount: Number(order.finalAmount),
      partnerCommission: Number(order.partnerCommission),
      plan: order.plan ? this.serializePlan(order.plan) : undefined,
      user: order.user
        ? {
            id: order.user.id,
            name: order.user.name,
            phone: order.user.phone,
            email: order.user.email,
          }
        : undefined,
      site: order.site
        ? {
            id: order.site.id,
            title: order.site.title,
            province: order.site.province,
            city: order.site.city,
            detailedAddress: order.site.detailedAddress,
          }
        : undefined,
    };
  }

  // ─── Initial Seeding ──────────────────────────────────────────

  async seedInitialPlansAndSettingsIfEmpty() {
    try {
      const planCount = await this.prisma.internetPlan.count();
      if (planCount === 0) {
        this.logger.log('Seeding initial Internet plans...');
        await this.prisma.internetPlan.createMany({
          data: [
            {
              badge: 'پیشنهاد ویژه سازمانی',
              title: 'فیبر نوری سازمانی توربو الترا (FTTH Turbo)',
              description: 'اتصال اختصاصی فیبر نوری با پهنای باند متقارن و پایداری ۹۹.۹٪ مناسب سازمان‌های متوسط و بزرگ',
              internationalTraffic: null,
              domesticTraffic: null,
              nightTraffic: NightTrafficType.FREE_BUSINESS,
              monthlyPrice: BigInt(2450000),
              isFeatured: true,
              isActive: true,
              sortOrder: 1,
              discountThreeMonths: 5,
              discountSixMonths: 12,
              discountYearly: 20,
              features: [
                'پینگ تک‌رقمی به سرورهای ایران و پایداری زیر ۵۰ میلی‌ثانیه به اروپا',
                'تخصیص ساب‌نت رسمی و پشتیبانی از روتینگ BGP',
                'پشتیبانی تلفنی و NOC اختصاصی ۲۴ ساعته',
                'امکان ارتقای پهنای باند لحظه‌ای در ساعات ترافیک سنگین',
              ],
            },
            {
              badge: 'تضمین SLA ۹۹.۹۹٪',
              title: 'پهنای باند اختصاصی متقارن (Dedicated DIA)',
              description: 'پهنای باند ۱ به ۱ کاملاً متقارن بر بستر رادیو مایکروویو یا فیبر مستقیم تاریک',
              internationalTraffic: null,
              domesticTraffic: null,
              nightTraffic: NightTrafficType.FREE_BUSINESS,
              monthlyPrice: BigInt(6800000),
              isFeatured: false,
              isActive: true,
              sortOrder: 2,
              discountThreeMonths: 5,
              discountSixMonths: 12,
              discountYearly: 20,
              features: [
                'تضمین کامل نرخ پهنای باند (CIR 100%) بدون افت سرعت',
                'مانیتورینگ Real-time از طریق پرتال Zabbix اختصاصی',
                'تخصیص آی‌پی استاتیک رایگان و کارشناس معین سازمانی',
                'اتصال به حداقل دو گیت‌وی مجزای زیرساخت جهت افزونگی (Redundancy)',
              ],
            },
            {
              badge: 'اقتصادی شرکت‌ها',
              title: 'اینترنت اداری VDSL2 پرو (VDSL Office Pro)',
              description: 'اینترنت پرسرعت مناسب شرکت‌های نوپا، آژانس‌های تبلیغاتی و دفاتر با مصرف متوسط',
              internationalTraffic: 500,
              domesticTraffic: 1500,
              nightTraffic: NightTrafficType.HALF_PRICE,
              monthlyPrice: BigInt(890000),
              isFeatured: false,
              isActive: true,
              sortOrder: 3,
              discountThreeMonths: 5,
              discountSixMonths: 10,
              discountYearly: 15,
              features: [
                'سرعت دانلود تا ۷۰ مگابیت و آپلود تا ۳۰ مگابیت',
                'ترافیک داخلی با محاسبه ۱ به ۳ و پایداری بالا',
                'راه‌اندازی سریع روی خطوط سیم مسی بدون نیاز به فیبرکشی',
                'امکان افزودن IP استاتیک برای دوربین‌های مداربسته',
              ],
            },
            {
              badge: 'پوشش سراسری',
              title: 'اینترنت بی‌سیم سازمانی TD-LTE اولترا',
              description: 'بدون نیاز به خط تلفن یا سیم‌کشی مخابراتی، اتصال سریع با مودم سیم‌کارتی صنعتی Cat6',
              internationalTraffic: 300,
              domesticTraffic: 900,
              nightTraffic: NightTrafficType.NORMAL,
              monthlyPrice: BigInt(650000),
              isFeatured: false,
              isActive: true,
              sortOrder: 4,
              discountThreeMonths: 0,
              discountSixMonths: 5,
              discountYearly: 10,
              features: [
                'تحویل و فعال‌سازی فوری در کمتر از ۲۴ ساعت',
                'مودم رومیزی Cat6 با وای‌فای دوبانده گیگابیتی',
                'قابلیت جابجایی بین کارگاه‌ها و پروژه‌های موقت',
                'پوشش سراسری در کلیه شهرک‌های صنعتی و کارگاهی',
              ],
            },
          ],
        });
        this.logger.log('Initial Internet plans seeded successfully.');
      }

      // Settings seed
      const defaultSettings = [
        { key: 'static_ip_monthly_price', value: '250000' },
        { key: 'partner_internet_commission', value: '400000' },
        { key: 'partner_static_ip_commission', value: '150000' },
      ];

      for (const item of defaultSettings) {
        await this.prisma.internetSetting.upsert({
          where: { key: item.key },
          update: {},
          create: {
            key: item.key,
            value: item.value,
          },
        });
      }
    } catch (err) {
      this.logger.error('Failed seeding initial internet data:', err);
    }
  }

  // ─── Settings ────────────────────────────────────────────────

  async getPublicSettings(): Promise<Record<string, number>> {
    const records = await this.prisma.internetSetting.findMany();
    const defaults: Record<string, number> = {
      staticIpMonthlyPrice: 250000,
      partnerInternetCommission: 400000,
      partnerStaticIpCommission: 150000,
      modemPrice: 3850000,
      installationPrice: 450000,
    };

    const keyMap: Record<string, string> = {
      static_ip_monthly_price: 'staticIpMonthlyPrice',
      partner_internet_commission: 'partnerInternetCommission',
      partner_static_ip_commission: 'partnerStaticIpCommission',
      modem_price: 'modemPrice',
      installation_price: 'installationPrice',
    };

    for (const r of records) {
      const mappedKey = keyMap[r.key];
      if (mappedKey) {
        const num = parseInt(r.value, 10);
        if (!isNaN(num)) {
          defaults[mappedKey] = num;
        }
      }
    }

    return defaults;
  }

  async getAdminSettings(): Promise<Array<{ key: string; value: string; updatedAt: Date }>> {
    return this.prisma.internetSetting.findMany({
      where: {
        key: {
          notIn: ['modem_price', 'installation_price'],
        },
      },
      orderBy: { key: 'asc' },
    });
  }

  async updateAdminSettings(settings: Record<string, string | number>) {
    const results = [];
    for (const [key, val] of Object.entries(settings)) {
      const strVal = String(val);
      const updated = await this.prisma.internetSetting.upsert({
        where: { key },
        update: { value: strVal },
        create: { key, value: strVal },
      });
      results.push(updated);
    }
    return results;
  }

  // ─── Public Plans ─────────────────────────────────────────────

  async getActivePlans() {
    const plans = await this.prisma.internetPlan.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: 'asc' }, { monthlyPrice: 'asc' }],
    });
    return plans.map((p) => this.serializePlan(p));
  }

  // ─── Cost Calculation ─────────────────────────────────────────

  async calculateCost(dto: CalculateInternetCostDto) {
    const plan = await this.prisma.internetPlan.findUnique({
      where: { id: dto.planId },
    });

    if (!plan) {
      throw new NotFoundException('پلن اینترنت مورد نظر یافت نشد.');
    }

    const duration = [1, 3, 6, 12].includes(dto.serviceDurationMonths)
      ? dto.serviceDurationMonths
      : 12;

    const discountPercent =
      duration === 12
        ? plan.discountYearly
        : duration === 6
        ? plan.discountSixMonths
        : duration === 3
        ? plan.discountThreeMonths
        : 0;

    const settings = await this.getPublicSettings();

    const baseMonthlyPrice = Number(plan.monthlyPrice);
    const discountedMonthlyPrice = Math.round((baseMonthlyPrice * (100 - discountPercent)) / 100);
    const planDurationTotal = discountedMonthlyPrice * duration;
    const baseDurationTotal = baseMonthlyPrice * duration;
    const planDiscountAmount = baseDurationTotal - planDurationTotal;

    // Static IP cost (discounted with term duration)
    const hasStaticIp = Boolean(dto.hasStaticIp);
    const staticIpBaseMonthly = hasStaticIp ? (settings.staticIpMonthlyPrice ?? 250000) : 0;
    const staticIpMonthlyDiscounted = Math.round((staticIpBaseMonthly * (100 - discountPercent)) / 100);
    const staticIpTotal = staticIpMonthlyDiscounted * duration;

    // Optional addons (modem & installation)
    const modemCost = dto.includeModem ? (settings.modemPrice ?? 3850000) : 0;
    const installationCost = dto.includeInstallation ? (settings.installationPrice ?? 450000) : 0;
    const addonsTotal = modemCost + installationCost;

    const finalAmount = planDurationTotal + staticIpTotal + addonsTotal;

    const partnerCommission =
      settings.partnerInternetCommission + (hasStaticIp ? settings.partnerStaticIpCommission : 0);

    return {
      planId: plan.id,
      planTitle: plan.title,
      durationMonths: duration,
      baseMonthlyPrice,
      discountPercent,
      discountedMonthlyPrice,
      planDurationTotal,
      planDiscountAmount,
      hasStaticIp,
      staticIpMonthlyPrice: staticIpBaseMonthly,
      staticIpMonthlyDiscounted,
      staticIpTotal,
      includeModem: Boolean(dto.includeModem),
      modemCost,
      includeInstallation: Boolean(dto.includeInstallation),
      installationCost,
      addonsTotal,
      finalAmount,
      partnerCommission,
    };
  }

  // ─── Order Placement ──────────────────────────────────────────

  async createOrder(dto: CreateInternetOrderDto, userId: string, userMeta?: any) {
    if (!userId) {
      throw new UnauthorizedException('برای ثبت سفارش اینترنت ابتدا وارد حساب کاربری خود شوید.');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        roles: { include: { role: true } },
      },
    });

    if (!user) {
      throw new NotFoundException('حساب کاربری یافت نشد.');
    }

    const roleNames = user.roles.map((r) => r.role.name.toLowerCase());
    const isAdmin =
      roleNames.includes('admin') ||
      roleNames.includes('super_admin') ||
      userMeta?.role === 'admin' ||
      userMeta?.role === 'super_admin';
    const isPartner =
      roleNames.includes('partner') ||
      roleNames.includes('partner_b2b') ||
      userMeta?.role === 'partner' ||
      userMeta?.isPartner === true;

    if (!user.canBuyInternet && !isAdmin && !isPartner) {
      throw new ForbiddenException(
        'امکان خرید مستقیم اینترنت برای حساب شما غیرفعال است. لطفاً جهت استعلام خط و فعال‌سازی با پشتیبانی تماس بگیرید.',
      );
    }

    // Validate plan
    const plan = await this.prisma.internetPlan.findUnique({
      where: { id: dto.planId },
    });

    if (!plan || !plan.isActive) {
      throw new BadRequestException('پلن اینترنت انتخابی نامعتبر یا غیرفعال است.');
    }

    // Partner Site validation
    let validatedSiteId: string | null = null;
    if (dto.siteId) {
      const address = await this.prisma.userAddress.findUnique({
        where: { id: dto.siteId },
      });
      if (!address || address.userId !== userId) {
        throw new BadRequestException('کارگاه یا آدرس انتخابی معتبر نبوده یا متعلق به شما نمی‌باشد.');
      }
      if (isPartner && address.type !== 'NETWORK_PROJECT_SITE') {
        throw new BadRequestException('کارگاه انتخابی برای همکار باید از نوع پروژه اجرایی (NETWORK_PROJECT_SITE) باشد.');
      }
      validatedSiteId = address.id;
    } else if (isPartner) {
      throw new BadRequestException('انتخاب کارگاه یا پروژه اجرایی برای همکاران الزامی است.');
    }

    // Compute exact prices
    const cost = await this.calculateCost({
      planId: dto.planId,
      serviceDurationMonths: dto.serviceDurationMonths,
      hasStaticIp: dto.hasStaticIp,
      includeModem: dto.includeModem,
      includeInstallation: dto.includeInstallation,
    });

    // Generate unique tracking code with collision avoidance
    let trackingCode = '';
    let isUnique = false;
    let attempts = 0;
    while (!isUnique && attempts < 10) {
      const randomSuffix = Math.floor(100000 + Math.random() * 900000);
      trackingCode = `NET-ISP-${randomSuffix}`;
      const existing = await this.prisma.internetOrder.findUnique({
        where: { trackingCode },
      });
      if (!existing) {
        isUnique = true;
      }
      attempts++;
    }
    if (!isUnique) {
      trackingCode = `NET-ISP-${Date.now().toString().slice(-6)}`;
    }

    const order = await this.prisma.internetOrder.create({
      data: {
        trackingCode,
        userId,
        planId: plan.id,
        siteId: validatedSiteId,
        serviceDurationMonths: cost.durationMonths,
        hasStaticIp: cost.hasStaticIp,
        includeModem: cost.includeModem,
        includeInstallation: cost.includeInstallation,
        baseAmount: BigInt(cost.baseMonthlyPrice * cost.durationMonths),
        discountAmount: BigInt(cost.planDiscountAmount),
        staticIpAmount: BigInt(cost.staticIpTotal),
        addonsAmount: BigInt(cost.addonsTotal),
        finalAmount: BigInt(cost.finalAmount),
        partnerCommission: BigInt(isPartner ? cost.partnerCommission : 0),
        status: InternetOrderStatus.PENDING,
        fullName: dto.fullName.trim(),
        companyName: dto.companyName?.trim() || null,
        phoneNumber: dto.phoneNumber.trim(),
        nationalCode: dto.nationalCode?.trim() || null,
        province: dto.province.trim(),
        city: dto.city.trim(),
        address: dto.address.trim(),
        landlineNumber: dto.landlineNumber?.trim() || null,
        notes: dto.notes?.trim() || null,
      },
      include: {
        plan: true,
        site: true,
        user: true,
      },
    });

    return this.serializeOrder(order);
  }

  async getMyOrders(userId: string) {
    const orders = await this.prisma.internetOrder.findMany({
      where: { userId },
      include: {
        plan: true,
        site: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    return orders.map((o) => this.serializeOrder(o));
  }

  async trackOrderByCode(trackingCode: string) {
    const order = await this.prisma.internetOrder.findUnique({
      where: { trackingCode },
      include: {
        plan: true,
        site: true,
      },
    });

    if (!order) {
      throw new NotFoundException('سفارشی با این کد رهگیری یافت نشد.');
    }

    return this.serializeOrder(order);
  }

  // ─── Admin: Plans Management ──────────────────────────────────

  async getAllPlans() {
    const plans = await this.prisma.internetPlan.findMany({
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    });
    return plans.map((p) => this.serializePlan(p));
  }

  async getPlanById(id: string) {
    const plan = await this.prisma.internetPlan.findUnique({
      where: { id },
    });
    if (!plan) {
      throw new NotFoundException('پلن اینترنت مورد نظر یافت نشد.');
    }
    return this.serializePlan(plan);
  }

  async createPlan(dto: CreateInternetPlanDto) {
    const newPlan = await this.prisma.internetPlan.create({
      data: {
        badge: dto.badge?.trim() || null,
        title: dto.title.trim(),
        description: dto.description?.trim() || null,
        internationalTraffic: dto.internationalTraffic ?? null,
        domesticTraffic: dto.domesticTraffic ?? null,
        nightTraffic: dto.nightTraffic ?? NightTrafficType.NORMAL,
        features: dto.features || [],
        monthlyPrice: BigInt(Math.round(dto.monthlyPrice)),
        isFeatured: Boolean(dto.isFeatured),
        isActive: dto.isActive !== undefined ? Boolean(dto.isActive) : true,
        sortOrder: dto.sortOrder ?? 0,
        discountThreeMonths: dto.discountThreeMonths ?? 0,
        discountSixMonths: dto.discountSixMonths ?? 0,
        discountYearly: dto.discountYearly ?? 20,
      },
    });
    return this.serializePlan(newPlan);
  }

  async updatePlan(id: string, dto: UpdateInternetPlanDto) {
    await this.getPlanById(id);

    const data: any = {};
    if (dto.badge !== undefined) data.badge = dto.badge?.trim() || null;
    if (dto.title !== undefined) data.title = dto.title.trim();
    if (dto.description !== undefined) data.description = dto.description?.trim() || null;
    if (dto.internationalTraffic !== undefined) data.internationalTraffic = dto.internationalTraffic;
    if (dto.domesticTraffic !== undefined) data.domesticTraffic = dto.domesticTraffic;
    if (dto.nightTraffic !== undefined) data.nightTraffic = dto.nightTraffic;
    if (dto.features !== undefined) data.features = dto.features;
    if (dto.monthlyPrice !== undefined) data.monthlyPrice = BigInt(Math.round(dto.monthlyPrice));
    if (dto.isFeatured !== undefined) data.isFeatured = Boolean(dto.isFeatured);
    if (dto.isActive !== undefined) data.isActive = Boolean(dto.isActive);
    if (dto.sortOrder !== undefined) data.sortOrder = dto.sortOrder;
    if (dto.discountThreeMonths !== undefined) data.discountThreeMonths = dto.discountThreeMonths;
    if (dto.discountSixMonths !== undefined) data.discountSixMonths = dto.discountSixMonths;
    if (dto.discountYearly !== undefined) data.discountYearly = dto.discountYearly;

    const updated = await this.prisma.internetPlan.update({
      where: { id },
      data,
    });
    return this.serializePlan(updated);
  }

  async togglePlanActive(id: string) {
    const existing = await this.getPlanById(id);
    const updated = await this.prisma.internetPlan.update({
      where: { id },
      data: { isActive: !existing.isActive },
    });
    return this.serializePlan(updated);
  }

  async togglePlanFeatured(id: string) {
    const existing = await this.getPlanById(id);
    const updated = await this.prisma.internetPlan.update({
      where: { id },
      data: { isFeatured: !existing.isFeatured },
    });
    return this.serializePlan(updated);
  }

  async deletePlan(id: string) {
    const existing = await this.getPlanById(id);

    // Check if plan has orders
    const orderCount = await this.prisma.internetOrder.count({
      where: { planId: id },
    });

    if (orderCount > 0) {
      // Soft deactivate
      const deactivated = await this.prisma.internetPlan.update({
        where: { id },
        data: { isActive: false },
      });
      return {
        success: true,
        action: 'deactivated',
        message: 'به دلیل وجود سفارش‌های ثبت‌شده برای این پلن، به جای حذف، به حالت غیرفعال درآمد.',
        plan: this.serializePlan(deactivated),
      };
    }

    await this.prisma.internetPlan.delete({
      where: { id },
    });

    return {
      success: true,
      action: 'deleted',
      message: 'پلن اینترنت با موفقیت حذف گردید.',
    };
  }

  // ─── Admin: Orders Management ─────────────────────────────────

  async getAllOrders(query: InternetOrderQueryDto) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(query.limit) || 20));
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query.status && query.status !== 'all') {
      where.status = query.status.toUpperCase() as InternetOrderStatus;
    }

    if (query.search && query.search.trim()) {
      const q = query.search.trim();
      where.OR = [
        { trackingCode: { contains: q, mode: 'insensitive' } },
        { fullName: { contains: q, mode: 'insensitive' } },
        { phoneNumber: { contains: q, mode: 'insensitive' } },
        { companyName: { contains: q, mode: 'insensitive' } },
      ];
    }

    const [total, orders] = await Promise.all([
      this.prisma.internetOrder.count({ where }),
      this.prisma.internetOrder.findMany({
        where,
        include: {
          plan: true,
          site: true,
          user: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
    ]);

    return {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      orders: orders.map((o) => this.serializeOrder(o)),
    };
  }

  async getOrderById(id: string) {
    const order = await this.prisma.internetOrder.findUnique({
      where: { id },
      include: {
        plan: true,
        site: true,
        user: true,
      },
    });

    if (!order) {
      throw new NotFoundException('سفارش اینترنت یافت نشد.');
    }

    return this.serializeOrder(order);
  }

  async updateOrderStatus(id: string, status: InternetOrderStatus) {
    await this.getOrderById(id);

    const updated = await this.prisma.internetOrder.update({
      where: { id },
      data: { status },
      include: {
        plan: true,
        site: true,
        user: true,
      },
    });

    return this.serializeOrder(updated);
  }
}
