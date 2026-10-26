import type { AuthUser } from "../types/auth.types";

export interface MockUserRecord {
  user: AuthUser;
  twoFactorPin?: string;
  description: string;
  badgeLabel: string;
}

/**
 * Pre-seeded accounts representing the 3 primary architectural layers
 */
export const MOCK_USER_RECORDS: Record<string, MockUserRecord> = {
  // 1. مدیر سایت (Admin / SuperAdmin)
  "09162947221": {
    user: {
      id: "usr_admin_01",
      phone: "09162947221",
      name: "مدیر سایت (عرفان سعیدی)",
      role: "admin",
      adminLevel: "owner",
      twoFactorEnabled: false,
      canBuyInternet: true,
      email: "admin@fonix-academic.ir",
      createdAt: "1400/01/01",
    },
    twoFactorPin: "999999",
    description: "مدیر کل و صاحب وبسایت — دسترسی کامل به مدیریت سرورها، تم، محصولات و سفارش‌ها",
    badgeLabel: "مدیر سایت",
  },

  "09134761097": {
    user: {
      id: "usr_admin_owner_02",
      phone: "09134761097",
      name: "صاحب وبسایت (مدیر کل)",
      role: "admin",
      adminLevel: "owner",
      twoFactorEnabled: false,
      canBuyInternet: true,
      email: "owner@fonix-academic.ir",
      createdAt: "1400/01/01",
    },
    twoFactorPin: "999999",
    description: "مالک و صاحب وبسایت — دسترسی کامل به تمامی بخش‌های ادمین، ناوگان ارسال، سفارش‌ها، محصولات و تنظیمات",
    badgeLabel: "صاحب سایت",
  },

  // 2. همکار سازمانی (Partner / B2B)
  "09162947222": {
    user: {
      id: "usr_partner_01",
      phone: "09162947222",
      name: "همکار سازمانی (مهندس کامران رستمی)",
      role: "partner",
      twoFactorEnabled: false,
      canBuyInternet: true,
      email: "partner@kahkeshan-net.ir",
      companyName: "شرکت داده‌پردازی کهکشان ارتباط",
      economicCode: "411589763214",
      nationalId: "14009876543",
      creditLimit: 500_000_000,
      creditBalance: 320_000_000,
      createdAt: "1401/04/10",
    },
    twoFactorPin: "123456",
    description: "پنل همکار سازمانی — قیمت‌های عمده B2B، فاکتور رسمی و خرید اعتباری",
    badgeLabel: "همکار",
  },

  // 3. کاربر ساده (Customer)
  "09162947223": {
    user: {
      id: "usr_customer_01",
      phone: "09162947223",
      name: "کاربر ساده (علیرضا رضوانی)",
      role: "customer",
      twoFactorEnabled: false,
      canBuyInternet: false,
      email: "customer@fonix-academic.ir",
      createdAt: "1402/08/15",
    },
    description: "کاربر عادی — دسترسی به پیشخوان کاربری و ثبت سفارش",
    badgeLabel: "کاربر ساده",
  },

  // Backward-compatibility aliases for existing test mocks
  "09121111111": {
    user: {
      id: "usr_b2c_legacy",
      phone: "09121111111",
      name: "کاربر آزمایشی",
      role: "customer",
      twoFactorEnabled: false,
      email: "test.customer@example.com",
      createdAt: "1402/08/15",
    },
    description: "کاربر عادی تستی",
    badgeLabel: "کاربر عادی",
  },
  "09123333333": {
    user: {
      id: "usr_partner_legacy",
      phone: "09123333333",
      name: "همکار آزمایشی",
      role: "partner",
      twoFactorEnabled: false,
      email: "test.partner@example.com",
      companyName: "شرکت آزمایشی",
      createdAt: "1401/04/10",
    },
    description: "همکار آزمایشی",
    badgeLabel: "همکار",
  },
  "09129999999": {
    user: {
      id: "usr_admin_legacy",
      phone: "09129999999",
      name: "ادمین آزمایشی",
      role: "admin",
      adminLevel: "owner",
      twoFactorEnabled: false,
      email: "test.admin@example.com",
      createdAt: "1400/01/01",
    },
    description: "ادمین آزمایشی",
    badgeLabel: "ادمین",
  },
};

/**
 * Normalizes Persian / Arabic digits to English and removes extra symbols
 */
export function normalizePhoneNumber(input: string): string {
  if (!input) return "";

  // Persian & Arabic digits mapping
  const persianDigits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
  const arabicDigits = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];

  let cleaned = input.trim();
  for (let i = 0; i < 10; i++) {
    cleaned = cleaned
      .replace(new RegExp(persianDigits[i], "g"), i.toString())
      .replace(new RegExp(arabicDigits[i], "g"), i.toString());
  }

  // Remove non-digit characters except leading plus
  cleaned = cleaned.replace(/[^\d+]/g, "");

  // Convert +98 or 0098 to 0
  if (cleaned.startsWith("+98")) {
    cleaned = "0" + cleaned.slice(3);
  } else if (cleaned.startsWith("0098")) {
    cleaned = "0" + cleaned.slice(4);
  } else if (cleaned.startsWith("98") && cleaned.length === 12) {
    cleaned = "0" + cleaned.slice(2);
  } else if (cleaned.startsWith("9") && cleaned.length === 10) {
    cleaned = "0" + cleaned;
  }

  return cleaned;
}

/**
 * Validates Iranian mobile number (09xxxxxxxxx, 11 digits)
 */
export function isValidIranianMobile(phone: string): boolean {
  const normalized = normalizePhoneNumber(phone);
  return /^09[0-9]{9}$/.test(normalized);
}

/**
 * Formats phone number for display (e.g., 0912 345 6789)
 */
export function formatPhoneForDisplay(phone: string): string {
  const normalized = normalizePhoneNumber(phone);
  if (normalized.length !== 11) return phone;
  return `${normalized.slice(0, 4)} ${normalized.slice(4, 7)} ${normalized.slice(7)}`;
}

/**
 * Masks phone number for security (e.g., 0912***6789)
 */
export function maskPhone(phone: string): string {
  const normalized = normalizePhoneNumber(phone);
  if (normalized.length !== 11) return phone;
  return `${normalized.slice(0, 4)}***${normalized.slice(7)}`;
}
