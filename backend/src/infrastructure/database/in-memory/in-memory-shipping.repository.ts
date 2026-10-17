import { Injectable } from '@nestjs/common';
import { ShippingMethod } from '../../../domain/entities/shipping-method.entity.js';
import { DeliveryTimeSlot } from '../../../domain/entities/delivery-time-slot.entity.js';
import { ShippingScheduleConfig } from '../../../domain/entities/shipping-config.entity.js';
import {
  IShippingRepository,
  DeliveryScheduleDay,
} from '../../../domain/repositories/shipping.repository.interface.js';

@Injectable()
export class InMemoryShippingRepository implements IShippingRepository {
  private methods: Map<string, ShippingMethod> = new Map();
  private timeSlots: Map<string, DeliveryTimeSlot> = new Map();
  private config: ShippingScheduleConfig;

  constructor() {
    this.config = new ShippingScheduleConfig({
      sameDayCutoffHour: 14,
      leadTimeDays: 0,
      workingDays: [0, 1, 2, 3, 4, 5], // شنبه تا پنجشنبه (جمعه تعطیل)
      daysInAdvance: 7,
      holidayDates: [],
    });
    this.seedDefaults();
  }

  private seedDefaults(): void {
    const defaultMethods: ShippingMethod[] = [
      new ShippingMethod({
        id: 'express_courier',
        title: 'پیک اختصاصی ققنوس آکادمی (تهران و حومه)',
        subtitle: 'ارسال سریع با بسته‌بندی ضدضربه قطعات حساس شبکه',
        description: 'تحویل در بازه زمانی انتخابی، بیمه سلامت فیزیکی رک‌ها و ماژول‌های نوری، تحویل تا درب دیتاسنتر یا شرکت',
        cost: 45000,
        freeThreshold: 5000000,
        estimatedDeliveryTime: 'امروز یا ۲۴ ساعت کاری (بازه ۲ تا ۴ ساعته)',
        iconName: 'zap',
        isExpress: true,
        isActive: true,
        minOrderAmount: 0,
        maxWeightKg: 30,
        allowedProvinces: ['تهران', 'البرز'],
        displayOrder: 1,
      }),
      new ShippingMethod({
        id: 'tipax_express',
        title: 'تیپاکس و چاپار اکسپرس (سراسر کشور)',
        subtitle: 'ارسال هوایی و زمینی سریع به تمام نقاط ایران',
        description: 'کد رهگیری پیامکی آنی، پوشش کامل بیمه حمل تجهیزات شبکه تا سقف ۱۰۰ میلیون تومان',
        cost: 75000,
        freeThreshold: 8000000,
        estimatedDeliveryTime: '۲۴ الی ۴۸ ساعت کاری',
        iconName: 'truck',
        isExpress: false,
        isActive: true,
        minOrderAmount: 0,
        maxWeightKg: 50,
        allowedProvinces: [], // Nationwide
        provinceRules: [
          {
            province: 'تهران',
            cost: 60000,
            estimatedDeliveryTime: '۲۴ ساعت کاری',
            freeThreshold: 6000000,
          },
          {
            province: 'قم',
            cost: 0,
            estimatedDeliveryTime: '۲۴ الی ۳۶ ساعت کاری',
            freeThreshold: 0,
            isFree: true,
          },
          {
            province: 'خراسان رضوی',
            cost: 85000,
            estimatedDeliveryTime: '۴۸ ساعت کاری',
            freeThreshold: 9000000,
          },
        ],
        displayOrder: 2,
      }),
      new ShippingMethod({
        id: 'heavy_freight',
        title: 'باربری و ناوگان اختصاصی (تجهیزات سنگین)',
        subtitle: 'مخصوص رک‌های سرور ایستاده (24U الی 44U)، قرقره‌های کابل و یو‌پی‌اس',
        description: 'بسته‌بندی پالت چوبی و فوم محافظ صنعتی، تخلیه ایمن در محل پروژه یا سایت مشتری',
        cost: 140000,
        freeThreshold: null,
        estimatedDeliveryTime: '۲ الی ۳ روز کاری',
        iconName: 'package',
        isExpress: false,
        isActive: true,
        minOrderAmount: 0,
        maxWeightKg: 500,
        allowedProvinces: [], // Nationwide
        displayOrder: 3,
      }),
      new ShippingMethod({
        id: 'warehouse_pickup',
        title: 'تحویل حضوری در انبار مرکزی ققنوس آکادمی',
        subtitle: 'تهران، خیابان ولیعصر، بالاتر از طالقانی، مجتمع تجهیزات شبکه',
        description: 'تحویل فوری در ساعات کاری (۹ الی ۱۸) با امکان تست و بررسی پلمپ کالا در محل انبار',
        cost: 0,
        freeThreshold: 0,
        estimatedDeliveryTime: 'آماده تحویل پس از ۱ ساعت کاری',
        iconName: 'building2',
        isExpress: false,
        isActive: true,
        minOrderAmount: 0,
        maxWeightKg: null,
        allowedProvinces: ['تهران'],
        displayOrder: 4,
      }),
      new ShippingMethod({
        id: 'post_pishtaz',
        title: 'پست پیشتاز جمهوری اسلامی ایران',
        subtitle: 'ارسال اقتصادی به تمام شهرها و روستاهای کشور',
        description: 'تحویل درب آدرس توسط موزع رسمی شرکت پست با شماره رهگیری ۲۰ رقمی معتبر',
        cost: 40000,
        freeThreshold: 6000000,
        estimatedDeliveryTime: '۳ الی ۵ روز کاری',
        iconName: 'truck',
        isExpress: false,
        isActive: true,
        minOrderAmount: 0,
        maxWeightKg: 10,
        allowedProvinces: [],
        provinceRules: [
          {
            province: 'تهران',
            cost: 35000,
            estimatedDeliveryTime: '۲ الی ۳ روز کاری',
            freeThreshold: 5000000,
          },
        ],
        displayOrder: 5,
      }),
    ];

    for (const m of defaultMethods) {
      this.methods.set(m.id, m);
    }

    const defaultSlots: DeliveryTimeSlot[] = [
      new DeliveryTimeSlot({
        id: 'morning',
        title: 'صبح (ساعت ۹:۰۰ الی ۱۳:۰۰)',
        startTime: '09:00',
        endTime: '13:00',
        description: 'تحویل قبل از ظهر در ساعات اداری رسمی شرکت‌ها و سازمان‌ها',
        maxCapacity: 40,
        isActive: true,
        displayOrder: 1,
      }),
      new DeliveryTimeSlot({
        id: 'afternoon',
        title: 'عصر (ساعت ۱۴:۰۰ الی ۱۸:۰۰)',
        startTime: '14:00',
        endTime: '18:00',
        description: 'تحویل مناسب پروژه‌ها، شرکت‌های خصوصی و اتاق سرور',
        maxCapacity: 45,
        isActive: true,
        displayOrder: 2,
      }),
      new DeliveryTimeSlot({
        id: 'evening',
        title: 'شب (ساعت ۱۹:۰۰ الی ۲۲:۰۰)',
        startTime: '19:00',
        endTime: '22:00',
        description: 'تحویل شیفت عصر و شب برای سایت‌های پروژه‌ای و دیتاسنترها',
        maxCapacity: 25,
        isActive: true,
        displayOrder: 3,
      }),
    ];

    for (const s of defaultSlots) {
      this.timeSlots.set(s.id, s);
    }
  }

  // --- Shipping Methods CRUD ---
  async findAllMethods(includeInactive = false): Promise<ShippingMethod[]> {
    const list = Array.from(this.methods.values());
    const filtered = includeInactive ? list : list.filter((m) => m.isActive);
    return filtered.sort((a, b) => a.displayOrder - b.displayOrder);
  }

  async findMethodById(id: string): Promise<ShippingMethod | null> {
    return this.methods.get(id) || null;
  }

  async createMethod(data: Partial<ShippingMethod>): Promise<ShippingMethod> {
    const id = data.id || `shipping_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const method = new ShippingMethod({
      id,
      title: data.title || 'شیوه ارسال جدید',
      subtitle: data.subtitle || '',
      description: data.description || '',
      cost: data.cost ?? 50000,
      freeThreshold: data.freeThreshold ?? null,
      estimatedDeliveryTime: data.estimatedDeliveryTime || '۲۴ الی ۴۸ ساعت',
      iconName: data.iconName || 'truck',
      iconUrl: data.iconUrl ?? null,
      isExpress: data.isExpress ?? false,
      isActive: data.isActive ?? true,
      minOrderAmount: data.minOrderAmount ?? 0,
      maxWeightKg: data.maxWeightKg ?? null,
      allowedProvinces: data.allowedProvinces ?? [],
      provinceRules: data.provinceRules ?? [],
      displayOrder: data.displayOrder ?? this.methods.size + 1,
    });
    this.methods.set(id, method);
    return method;
  }

  async updateMethod(id: string, data: Partial<ShippingMethod>): Promise<ShippingMethod> {
    const method = this.methods.get(id);
    if (!method) {
      throw new Error(`روش ارسال با شناسه ${id} یافت نشد.`);
    }
    method.update(data);
    return method;
  }

  async deleteMethod(id: string): Promise<boolean> {
    return this.methods.delete(id);
  }

  async toggleMethod(id: string): Promise<ShippingMethod> {
    const method = this.methods.get(id);
    if (!method) {
      throw new Error(`روش ارسال با شناسه ${id} یافت نشد.`);
    }
    method.toggleActive();
    return method;
  }

  // --- Time Slots CRUD ---
  async findAllTimeSlots(includeInactive = false): Promise<DeliveryTimeSlot[]> {
    const list = Array.from(this.timeSlots.values());
    const filtered = includeInactive ? list : list.filter((s) => s.isActive);
    return filtered.sort((a, b) => a.displayOrder - b.displayOrder);
  }

  async findTimeSlotById(id: string): Promise<DeliveryTimeSlot | null> {
    return this.timeSlots.get(id) || null;
  }

  async createTimeSlot(data: Partial<DeliveryTimeSlot>): Promise<DeliveryTimeSlot> {
    const id = data.id || `slot_${Date.now()}`;
    const slot = new DeliveryTimeSlot({
      id,
      title: data.title || 'بازه زمانی تحویل',
      startTime: data.startTime || '09:00',
      endTime: data.endTime || '13:00',
      description: data.description || '',
      maxCapacity: data.maxCapacity ?? 40,
      isActive: data.isActive ?? true,
      displayOrder: data.displayOrder ?? this.timeSlots.size + 1,
    });
    this.timeSlots.set(id, slot);
    return slot;
  }

  async updateTimeSlot(id: string, data: Partial<DeliveryTimeSlot>): Promise<DeliveryTimeSlot> {
    const slot = this.timeSlots.get(id);
    if (!slot) {
      throw new Error(`بازه زمانی با شناسه ${id} یافت نشد.`);
    }
    slot.update(data);
    return slot;
  }

  async deleteTimeSlot(id: string): Promise<boolean> {
    return this.timeSlots.delete(id);
  }

  // --- Config & Scheduling ---
  async getConfig(): Promise<ShippingScheduleConfig> {
    return this.config;
  }

  async updateConfig(data: Partial<ShippingScheduleConfig>): Promise<ShippingScheduleConfig> {
    this.config.update(data);
    return this.config;
  }

  async getSchedule(_province?: string): Promise<DeliveryScheduleDay[]> {
    const activeSlots = await this.findAllTimeSlots(false);
    const days: DeliveryScheduleDay[] = [];

    const now = new Date();

    // Asia/Tehran formatters
    const tehranYMD = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Tehran',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });

    const tehranWeekday = new Intl.DateTimeFormat('fa-IR', {
      timeZone: 'Asia/Tehran',
      weekday: 'long',
    });

    const tehranMonthDay = new Intl.DateTimeFormat('fa-IR', {
      timeZone: 'Asia/Tehran',
      month: 'long',
      day: 'numeric',
    });

    const weekdayEn = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Tehran',
      weekday: 'short',
    });

    const hourFormatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Tehran',
      hour: 'numeric',
      hour12: false,
    });
    const currentTehranHour = parseInt(hourFormatter.format(now), 10) || now.getHours();

    const enWeekdayToIranIndex: Record<string, number> = {
      Sat: 0,
      Sun: 1,
      Mon: 2,
      Tue: 3,
      Wed: 4,
      Thu: 5,
      Fri: 6,
    };

    const todayTehranStr = tehranYMD.format(now);
    const tomorrowTarget = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const tomorrowTehranStr = tehranYMD.format(tomorrowTarget);

    let dayOffset = this.config.leadTimeDays;
    if (dayOffset === 0 && currentTehranHour >= this.config.sameDayCutoffHour) {
      dayOffset = 1;
    }

    let checkedDays = 0;
    const maxLookaheadDays = Math.max(90, this.config.daysInAdvance * 4);

    while (days.length < this.config.daysInAdvance && checkedDays < maxLookaheadDays) {
      const targetDate = new Date(now.getTime() + (dayOffset + checkedDays) * 24 * 60 * 60 * 1000);
      const isoStr = tehranYMD.format(targetDate);
      const dayAbbr = weekdayEn.format(targetDate);
      const iranDayIndex = enWeekdayToIranIndex[dayAbbr] ?? 0;

      const isWorking = this.config.isWorkingDay(iranDayIndex);
      const dayName = tehranWeekday.format(targetDate);
      const formattedDate = tehranMonthDay.format(targetDate);
      const jalaliDate = `${dayName} ${formattedDate}`;
      const isHoliday = this.config.isHoliday(isoStr, jalaliDate);

      if (isWorking && !isHoliday) {
        const isToday = isoStr === todayTehranStr;
        const isTomorrow = isoStr === tomorrowTehranStr;

        days.push({
          date: isoStr,
          jalaliDate,
          dayName,
          isToday,
          isTomorrow,
          slots: activeSlots,
        });
      }

      checkedDays++;
    }

    return days;
  }
}
