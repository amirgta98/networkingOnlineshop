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
  // 1. Normal User (Without 2FA)
  "09121111111": {
    user: {
      id: "usr_b2c_01",
      phone: "09121111111",
      name: "آرش رادمنش",
      role: "customer",
      twoFactorEnabled: false,
      email: "arash.rad@example.com",
      createdAt: "1402/08/15",
    },
    description: "کاربر عادی — ورود مستقیم با پیامک بدون تایید دو مرحله‌ای",
    badgeLabel: "کاربر عادی (بدون ۲FA)",
  },

  // 2. Normal User (With 2FA)
  "09122222222": {
    user: {
      id: "usr_b2c_02",
      phone: "09122222222",
      name: "سارا محمدی",
      role: "customer",
      twoFactorEnabled: true,
      twoFactorMethod: "pin",
      email: "sara.m@example.com",
      createdAt: "1402/10/20",
    },
    twoFactorPin: "123456",
    description: "کاربر عادی — دارای لایه امنیتی تایید دو مرحله‌ای (رمز دوم)",
    badgeLabel: "کاربر عادی (با ۲FA)",
  },

  // 3. Partner / Organization (B2B)
  "09123333333": {
    user: {
      id: "usr_partner_01",
      phone: "09123333333",
      name: "مهندس کامران کاظمی",
      role: "partner",
      twoFactorEnabled: true,
      twoFactorMethod: "pin",
      email: "procurement@kahkeshan-net.ir",
      companyName: "شرکت داده‌پردازی کهکشان ارتباط",
      economicCode: "411589763214",
      nationalId: "14009876543",
      creditLimit: 500_000_000,
      creditBalance: 320_000_000,
      createdAt: "1401/04/10",
    },
    twoFactorPin: "123456",
    description: "پنل سازمانی یا همکاری — قیمت‌های عمده B2B، فاکتور رسمی و خرید اعتباری",
    badgeLabel: "پنل سازمانی / همکار (B2B)",
  },

  // 4. Admin / Website Owner
  "09129999999": {
    user: {
      id: "usr_admin_01",
      phone: "09129999999",
      name: "عرفان سعیدی",
      role: "admin",
      adminLevel: "owner",
      twoFactorEnabled: true,
      twoFactorMethod: "pin",
      email: "admin@velox-net.ir",
      createdAt: "1400/01/01",
    },
    twoFactorPin: "999999",
    description: "صاحب وبسایت و مدیر ارشد — دسترسی کامل به مدیریت سرورها، تم، محصولات و سفارش‌ها",
    badgeLabel: "ادمین / صاحب وبسایت",
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
