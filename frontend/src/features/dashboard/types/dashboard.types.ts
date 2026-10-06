import type { UserRole } from "@/features/auth";

export type DashboardPageKey =
  | "overview"          // پیشخوان اصلی
  | "orders"            // سفارش‌ها و پیگیری مرسولات
  | "invoices"          // فاکتورها و اسناد مالی
  | "wallet"            // کیف پول و اعتبارات
  | "wishlist"          // کالاهای موردعلاقه و هشدار موجودی
  | "addresses"         // آدرس‌ها و اطلاعات تحویل
  | "rfq"               // استعلام قیمت پروژه‌ای و پیش‌فاکتور
  | "support"           // تیکت‌های پشتیبانی فنی تخصصی
  | "warranty"          // استعلام اصالت و گارانتی RMA
  | "security"          // امنیت، رمز عبور و ورود ۲FA
  | "profile"           // مشخصات فردی و حقوقی
  | "club"              // باشگاه مشتریان و سطح وفاداری
  | "upgrade-partner"   // درخواست ارتقا به همکار حقوقی / B2B
  // گزینه‌های اختصاصی همکار سازمانی
  | "partner-catalog"   // کاتالوگ و لیست قیمت عمده همکار
  | "partner-credit"    // خط اعتباری و چک‌های صیادی
  | "partner-agents"    // مدیریت کارشناسان خرید شرکت
  // گزینه‌های اختصاصی ادمین
  | "admin-overview"    // مرکز کنترل مدیریت کل
  | "admin-theme";      // شخصی‌سازی زنده تم

export type PageCategory = "main" | "commerce" | "services" | "account" | "role-specific";

export interface DashboardPageDefinition {
  id: DashboardPageKey;
  title: string;
  shortDescription: string;
  category: PageCategory;
  categoryLabel: string;
  iconName: string;
  rolesAllowed: UserRole[];
  badge?: string;
  badgeVariant?: "default" | "success" | "warning" | "info" | "purple";
  isPrimary?: boolean;
}

export interface UserTierInfo {
  tierName: string;
  tierEnglish: string;
  badgeLabel: string;
  levelNumber: number;
  discountRate: string;
  freeShippingText: string;
  creditText: string;
  warrantyText: string;
  perks: string[];
  nextTierGoal?: string;
  nextTierProgressPercent?: number;
}
