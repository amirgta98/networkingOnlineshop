import { apiClient } from "@/shared/lib/api-client";
import { DeliveryMethod, DeliveryDateOption, DeliveryTimeSlotOption, ProvinceShippingRule } from "../types";
import { areProvincesMatching } from "@/shared/lib/utils";

export const FALLBACK_DELIVERY_METHODS: DeliveryMethod[] = [
  {
    id: "express_courier",
    title: "پیک اختصاصی ققنوس آکادمی (تهران و البرز)",
    subtitle: "ارسال سریع با بسته‌بندی ضدضربه قطعات حساس شبکه",
    description: "تحویل در بازه زمانی انتخابی، بیمه سلامت فیزیکی رک‌ها و ماژول‌های نوری، تحویل تا درب دیتاسنتر یا شرکت",
    cost: 45000,
    freeThreshold: 5000000,
    estimatedDeliveryTime: "امروز یا ۲۴ ساعت کاری (بازه ۲ تا ۴ ساعته)",
    iconName: "zap",
    isExpress: true,
    isActive: true,
    allowedProvinces: ["تهران", "البرز"],
  },
  {
    id: "tipax_express",
    title: "تیپاکس و چاپار اکسپرس (سراسر کشور)",
    subtitle: "ارسال هوایی و زمینی سریع به تمام نقاط ایران",
    description: "کد رهگیری پیامکی آنی، پوشش کامل بیمه حمل تجهیزات شبکه تا سقف ۱۰۰ میلیون تومان",
    cost: 75000,
    freeThreshold: 8000000,
    estimatedDeliveryTime: "۲۴ الی ۴۸ ساعت کاری",
    iconName: "truck",
    isExpress: false,
    isActive: true,
    allowedProvinces: [],
    provinceRules: [
      {
        province: "تهران",
        cost: 60000,
        estimatedDeliveryTime: "۲۴ ساعت کاری",
        freeThreshold: 6000000,
      },
      {
        province: "قم",
        cost: 0,
        estimatedDeliveryTime: "۲۴ الی ۳۶ ساعت کاری",
        freeThreshold: 0,
        isFree: true,
      },
      {
        province: "خراسان رضوی",
        cost: 85000,
        estimatedDeliveryTime: "۴۸ ساعت کاری",
        freeThreshold: 9000000,
      },
    ],
  },
  {
    id: "heavy_freight",
    title: "باربری و ناوگان اختصاصی (تجهیزات سنگین)",
    subtitle: "مخصوص رک‌های سرور ایستاده (24U الی 44U)، قرقره‌های کابل و یو‌پی‌اس",
    description: "بسته‌بندی پالت چوبی و فوم محافظ صنعتی، تخلیه ایمن در محل پروژه یا سایت مشتری",
    cost: 140000,
    estimatedDeliveryTime: "۲ الی ۳ روز کاری",
    iconName: "package",
    isExpress: false,
    isActive: true,
    allowedProvinces: [],
  },
  {
    id: "warehouse_pickup",
    title: "تحویل حضوری در انبار مرکزی ققنوس آکادمی",
    subtitle: "تهران، خیابان ولیعصر، بالاتر از طالقانی، مجتمع تجهیزات شبکه",
    description: "تحویل فوری در ساعات کاری (۹ الی ۱۸) با امکان تست و بررسی پلمپ کالا در محل انبار",
    cost: 0,
    freeThreshold: 0,
    estimatedDeliveryTime: "آماده تحویل پس از ۱ ساعت کاری",
    iconName: "building2",
    isExpress: false,
    isActive: true,
    allowedProvinces: ["تهران"],
  },
  {
    id: "post_pishtaz",
    title: "پست پیشتاز جمهوری اسلامی ایران",
    subtitle: "ارسال اقتصادی به تمام شهرها و روستاهای کشور",
    description: "تحویل درب آدرس توسط موزع رسمی شرکت پست با شماره رهگیری ۲۰ رقمی معتبر",
    cost: 40000,
    freeThreshold: 6000000,
    estimatedDeliveryTime: "۳ الی ۵ روز کاری",
    iconName: "truck",
    isExpress: false,
    isActive: true,
    allowedProvinces: [],
    provinceRules: [
      {
        province: "تهران",
        cost: 35000,
        estimatedDeliveryTime: "۲ الی ۳ روز کاری",
        freeThreshold: 5000000,
      },
    ],
  },
];

export const FALLBACK_TIME_SLOTS: DeliveryTimeSlotOption[] = [
  {
    id: "morning",
    title: "صبح (ساعت ۹:۰۰ الی ۱۳:۰۰)",
    startTime: "09:00",
    endTime: "13:00",
    description: "تحویل قبل از ظهر در ساعات اداری رسمی",
    maxCapacity: 40,
    isActive: true,
  },
  {
    id: "afternoon",
    title: "عصر (ساعت ۱۴:۰۰ الی ۱۸:۰۰)",
    startTime: "14:00",
    endTime: "18:00",
    description: "تحویل مناسب پروژه‌ها، شرکت‌های خصوصی و اتاق سرور",
    maxCapacity: 45,
    isActive: true,
  },
  {
    id: "evening",
    title: "شب (ساعت ۱۹:۰۰ الی ۲۲:۰۰)",
    startTime: "19:00",
    endTime: "22:00",
    description: "تحویل شیفت عصر و شب برای سایت‌های پروژه‌ای و دیتاسنترها",
    maxCapacity: 25,
    isActive: true,
  },
];

export function generateFallbackSchedule(daysCount = 7): DeliveryDateOption[] {
  const days: DeliveryDateOption[] = [];
  const now = new Date();

  const tehranYMD = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Tehran",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  const tehranWeekday = new Intl.DateTimeFormat("fa-IR", {
    timeZone: "Asia/Tehran",
    weekday: "long",
  });

  const tehranMonthDay = new Intl.DateTimeFormat("fa-IR", {
    timeZone: "Asia/Tehran",
    month: "long",
    day: "numeric",
  });

  const weekdayEn = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Tehran",
    weekday: "short",
  });

  const hourFormatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Tehran",
    hour: "numeric",
    hour12: false,
  });
  const currentTehranHour = parseInt(hourFormatter.format(now), 10) || now.getHours();

  const todayTehranStr = tehranYMD.format(now);
  const tomorrowTarget = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const tomorrowTehranStr = tehranYMD.format(tomorrowTarget);

  let offset = 0;
  // If after 14:00, cannot deliver today
  if (currentTehranHour >= 14) {
    offset = 1;
  }

  let dayStep = 0;
  while (days.length < daysCount && dayStep < 20) {
    const target = new Date(now.getTime() + (offset + dayStep) * 24 * 60 * 60 * 1000);
    const dayAbbr = weekdayEn.format(target);

    // Skip Friday (dayAbbr === "Fri")
    if (dayAbbr !== "Fri") {
      const isoDate = tehranYMD.format(target);
      const dayName = tehranWeekday.format(target);
      const formattedDate = tehranMonthDay.format(target);
      const jalaliDate = `${dayName} ${formattedDate}`;

      const isToday = isoDate === todayTehranStr;
      const isTomorrow = isoDate === tomorrowTehranStr;

      days.push({
        date: isoDate,
        jalaliDate,
        dayName,
        isToday,
        isTomorrow,
        slots: FALLBACK_TIME_SLOTS,
      });
    }
    dayStep++;
  }

  return days;
}

export const shippingApi = {
  /**
   * Fetches available shipping methods, optionally filtered by destination province and cart subtotal
   */
  async getMethods(
    province?: string,
    subtotal?: number,
    includeRestricted = true
  ): Promise<DeliveryMethod[]> {
    try {
      const queryParams: Record<string, string> = {};
      if (province) queryParams.province = province;
      if (subtotal !== undefined) queryParams.subtotal = String(subtotal);
      if (includeRestricted) queryParams.includeRestricted = "true";

      const data = await apiClient.get<DeliveryMethod[]>("/shipping/methods", {
        params: queryParams,
        timeout: 4000,
      });
      if (Array.isArray(data) && data.length > 0) {
        return data;
      }
    } catch {
      // Fallback
    }

    // Local storage check (if admin modified methods locally)
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("velox_admin_shipping_methods");
        if (stored) {
          const parsed = JSON.parse(stored) as DeliveryMethod[];
          if (Array.isArray(parsed) && parsed.length > 0) {
            return includeRestricted ? parsed.filter((m) => m.isActive !== false) : filterMethods(parsed, province);
          }
        }
      } catch {
        // ignore
      }
    }

    return includeRestricted ? FALLBACK_DELIVERY_METHODS.filter((m) => m.isActive !== false) : filterMethods(FALLBACK_DELIVERY_METHODS, province);
  },

  /**
   * Fetches delivery schedule (upcoming days and time slots)
   */
  async getSchedule(province?: string): Promise<DeliveryDateOption[]> {
    try {
      const queryParams: Record<string, string> = {};
      if (province) queryParams.province = province;

      const data = await apiClient.get<DeliveryDateOption[]>("/shipping/schedule", {
        params: queryParams,
        timeout: 4000,
      });
      if (Array.isArray(data) && data.length > 0) {
        return data;
      }
    } catch {
      // Fallback
    }

    return generateFallbackSchedule(7);
  },

  /**
   * Calculates shipping rate
   */
  async calculateShipping(methodId: string, subtotal: number, province?: string) {
    try {
      return await apiClient.post<{
        methodId: string;
        cost: number;
        isFree: boolean;
        freeThreshold: number | null;
        amountNeededForFree: number;
        estimatedDeliveryTime?: string;
        province?: string;
        isProvinceCustomized?: boolean;
      }>("/shipping/calculate", {
        methodId,
        subtotal,
        province,
      });
    } catch {
      const methods = await this.getMethods(province, subtotal);
      const method = methods.find((m) => m.id === methodId) || methods[0];
      const details = getEffectiveMethodDetails(method, province);
      const isFree =
        details.isFree ||
        (details.freeThreshold !== null &&
          details.freeThreshold !== undefined &&
          subtotal >= details.freeThreshold);
      const cost = isFree ? 0 : details.cost;
      const freeThreshold = details.freeThreshold ?? null;
      const amountNeededForFree =
        freeThreshold !== null && subtotal < freeThreshold ? freeThreshold - subtotal : 0;

      return {
        methodId: method.id,
        cost,
        isFree,
        freeThreshold,
        amountNeededForFree,
        estimatedDeliveryTime: details.estimatedDeliveryTime,
        province,
        isProvinceCustomized: details.isCustomized,
      };
    }
  },
};

export function isMethodAvailableForProvince(method: DeliveryMethod, province?: string): boolean {
  if (method.isActive === false) return false;
  if (!method.allowedProvinces || method.allowedProvinces.length === 0) return true;
  if (!province) return true;
  return method.allowedProvinces.some((p) => areProvincesMatching(p, province));
}

export function getEffectiveMethodDetails(method: DeliveryMethod, province?: string): {
  cost: number;
  freeThreshold: number | null;
  estimatedDeliveryTime: string;
  isFree: boolean;
  isCustomized: boolean;
  effectiveCost: number;
  effectiveFreeThreshold: number | null;
  effectiveDeliveryTime: string;
  effectiveIsFree: boolean;
  rule?: ProvinceShippingRule;
} {
  const rule =
    province && method.provinceRules && method.provinceRules.length > 0
      ? method.provinceRules.find((r) => areProvincesMatching(r.province, province))
      : undefined;

  const isFree = Boolean(
    rule?.isFree ||
    rule?.cost === 0 ||
    (!rule && method.cost === 0)
  );

  const cost = isFree
    ? 0
    : rule && rule.cost !== undefined
    ? Math.max(0, rule.cost)
    : method.cost;

  const freeThreshold = isFree
    ? 0
    : rule && rule.freeThreshold !== undefined
    ? rule.freeThreshold
    : method.freeThreshold ?? null;

  const estimatedDeliveryTime =
    rule && rule.estimatedDeliveryTime
      ? rule.estimatedDeliveryTime
      : method.estimatedDeliveryTime;

  return {
    cost,
    freeThreshold,
    estimatedDeliveryTime,
    isFree,
    isCustomized: Boolean(rule),
    effectiveCost: cost,
    effectiveFreeThreshold: freeThreshold,
    effectiveDeliveryTime: estimatedDeliveryTime,
    effectiveIsFree: isFree,
    rule,
  };
}

function filterMethods(list: DeliveryMethod[], province?: string): DeliveryMethod[] {
  return list.filter((m) => isMethodAvailableForProvince(m, province));
}
