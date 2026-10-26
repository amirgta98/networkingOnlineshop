import { type UserRole, type AuthUser, normalizeUserRole } from "@/features/auth";
import type { DashboardPageDefinition, UserTierInfo } from "../types/dashboard.types";

/**
 * تمامی صفحاتی که کاربر با توجه به سطح کاربری خود باید به آن‌ها دسترسی داشته باشد.
 * صفحات به جز پیشخوان اصلی (overview)، نام و مشخصاتشان برای کاربر تعریف و نمایش داده می‌شود.
 */
export const ALL_DASHBOARD_PAGES: DashboardPageDefinition[] = [
  // ─── دسته ۱: دسترسی‌های اصلی ──────────────────────────────────
  {
    id: "overview",
    title: "پیشخوان و خلاصه وضعیت",
    shortDescription: "نمای کلی فعالیت‌ها، اعتبارات، سفارش‌های در جریان و اعلان‌های امنیتی",
    category: "main",
    categoryLabel: "اصلی و عمومی",
    iconName: "LayoutDashboard",
    rolesAllowed: ["customer", "admin"],
    isPrimary: true,
  },
  {
    id: "orders",
    title: "سفارش‌ها و رهگیری مرسولات",
    shortDescription: "لیست کلیه خریدهای در حال پردازش، ارسال شده، تحویل شده و لغو شده",
    category: "commerce",
    categoryLabel: "خرید و مبادلات",
    iconName: "Package",
    rolesAllowed: ["customer", "admin"],
  },
  {
    id: "invoices",
    title: "فاکتورها و اسناد مالی",
    shortDescription: "دانلود فاکتورهای استاندارد و رسمی با شناسه یکتای مالیاتی و مهر الکترونیک",
    category: "commerce",
    categoryLabel: "خرید و مبادلات",
    iconName: "FileText",
    rolesAllowed: ["customer", "admin"],
    badge: "رسمی / ارزش افزوده",
    badgeVariant: "default",
  },
  {
    id: "wallet",
    title: "کیف پول و اعتبارات خرید",
    shortDescription: "مدیریت موجودی نقد، شارژ سریع حساب و پیگیری تراکنش‌های مالی",
    category: "commerce",
    categoryLabel: "خرید و مبادلات",
    iconName: "Wallet",
    rolesAllowed: ["customer", "admin"],
  },
  {
    id: "wishlist",
    title: "علاقه‌مندی‌ها و اطلاع از موجودی",
    shortDescription: "تجهیزات نشان‌شده، مقایسه سریع مشخصات فنی و هشدار کاهش قیمت",
    category: "commerce",
    categoryLabel: "خرید و مبادلات",
    iconName: "Heart",
    rolesAllowed: ["customer", "admin"],
  },
  {
    id: "addresses",
    title: "آدرس‌ها و اطلاعات تحویل",
    shortDescription: "دفاتر، انبارها و پروژه‌های مقصد جهت ارسال سریع تجهیزات شبکه با پیک و باربری",
    category: "commerce",
    categoryLabel: "خرید و مبادلات",
    iconName: "MapPin",
    rolesAllowed: ["customer", "admin"],
  },

  // ─── دسته ۲: خدمات تخصصی شبکه و پروژه‌ها ───────────────────────
  {
    id: "rfq",
    title: "استعلام قیمت پروژه‌ای (RFQ)",
    shortDescription: "درخواست استعلام لیست تجمیعی سوئیچ، روتر، رک و کابل شبکه با قیمت ویژه پروژه",
    category: "services",
    categoryLabel: "خدمات تخصصی زیرساخت",
    iconName: "FileSpreadsheet",
    rolesAllowed: ["customer", "admin"],
    badge: "ویژه پروژه‌ها",
    badgeVariant: "purple",
  },
  {
    id: "installation",
    title: "درخواست‌های نصب و اجرای پروژه",
    shortDescription: "پیگیری وضعیت درخواست‌های کابل‌کشی، دیتاسنتر، فیبر نوری و نظارت کارگاهی",
    category: "services",
    categoryLabel: "خدمات تخصصی زیرساخت",
    iconName: "Wrench",
    rolesAllowed: ["customer", "admin"],
    badge: "تضمین فلوک",
    badgeVariant: "default",
  },
  {
    id: "warranty",
    title: "استعلام اصالت و گارانتی (RMA)",
    shortDescription: "بررسی سریال نامبر تجهیزات سیسکو، میکروتیک و ثبت درخواست تعویض یا تعمیر",
    category: "services",
    categoryLabel: "خدمات تخصصی زیرساخت",
    iconName: "ShieldCheck",
    rolesAllowed: ["customer", "admin"],
    badge: "گارانتی طلایی ققنوس آکادمی",
    badgeVariant: "success",
  },
  {
    id: "support",
    title: "تیکت‌ها و پشتیبانی مهندسی",
    shortDescription: "مشاوره با مهندسان ارشد شبکه CCIE/MTCNA جهت طراحی توپولوژی و کانفیگ",
    category: "services",
    categoryLabel: "خدمات تخصصی زیرساخت",
    iconName: "Headphones",
    rolesAllowed: ["customer", "admin"],
  },

  // ─── دسته ۳: اطلاعات و امنیت حساب ─────────────────────────────
  {
    id: "profile",
    title: "مشخصات حساب و احراز هویت",
    shortDescription: "اطلاعات هویتی، کد ملی، شماره شبا، شماره تماس اضطراری و کد پستی",
    category: "account",
    categoryLabel: "امنیت و حساب کاربری",
    iconName: "User",
    rolesAllowed: ["customer", "admin"],
    badge: "احراز شده ✓",
    badgeVariant: "success",
  },
  {
    id: "security",
    title: "امنیت و تایید دو مرحله‌ای (۲FA)",
    shortDescription: "رمز عبور لایه دوم، نشست‌های ورود، مانیتورینگ دستگاه‌ها و لاگ ورود",
    category: "account",
    categoryLabel: "امنیت و حساب کاربری",
    iconName: "Lock",
    rolesAllowed: ["customer", "admin"],
    badge: "محافظت شده",
    badgeVariant: "warning",
  },
  {
    id: "club",
    title: "باشگاه مشتریان و امتیاز وفاداری",
    shortDescription: "امتیازات کسب‌شده از هر خرید و تبدیل به بن تخفیف یا هدایای فنی",
    category: "account",
    categoryLabel: "امنیت و حساب کاربری",
    iconName: "Award",
    rolesAllowed: ["customer", "admin"],
  },
  {
    id: "upgrade-partner",
    title: "درخواست ارتقا به همکار سازمانی (B2B)",
    shortDescription: "ثبت اطلاعات شرکت و دریافت تخفیف‌های ویژه نمایندگی، خط اعتباری و خرید چکی",
    category: "account",
    categoryLabel: "امنیت و حساب کاربری",
    iconName: "Sparkles",
    rolesAllowed: ["customer"],
    badge: "ارتقای سطح",
    badgeVariant: "purple",
  },

  // ─── دسته ۴: صفحات اختصاصی همکار سازمانی (B2B) ──────────────────
  {
    id: "partner-credit",
    title: "مدیریت خط اعتباری و چک‌های صیادی",
    shortDescription: "مشاهده سقف اعتبار ۵۰۰ میلیون تومانی، وضعیت چک‌های صیادی بنفش و سررسیدها",
    category: "role-specific",
    categoryLabel: "امکانات اختصاصی سازمانی B2B",
    iconName: "CreditCard",
    rolesAllowed: ["partner", "admin"],
    badge: "اعتبار ۵۰۰ م.ت",
    badgeVariant: "success",
  },

  // ─── دسته ۵: صفحات اختصاصی ادمین و مدیر کل ──────────────────────
  {
    id: "admin-overview",
    title: "مرکز فرماندهی و مدیریت سامانه",
    shortDescription: "پایش بلادرنگ سرورها، تایید هویت شرکتی همکاران، گزارش‌های فروش کل و انبارداری",
    category: "role-specific",
    categoryLabel: "ابزارهای راهبری کل سامانه",
    iconName: "ShieldAlert",
    rolesAllowed: ["admin"],
    badge: "دسترسی Root",
    badgeVariant: "purple",
    href: "/admin",
  },
  {
    id: "admin-products",
    title: "کاتالوگ و موجودی انبار",
    shortDescription: "مدیریت کالاها، افزودن محصول جدید، آپلود و کراپ ۱:۱ تصاویر، واترمارک و ویژگی‌های داینامیک فنی",
    category: "role-specific",
    categoryLabel: "ابزارهای راهبری کل سامانه",
    iconName: "Layers",
    rolesAllowed: ["admin"],
    badge: "مدیریت محصولات",
    badgeVariant: "warning",
    href: "/admin/products",
  },
  {
    id: "admin-categories",
    title: "دسته‌بندی تجهیزات شبکه",
    shortDescription: "ساختار درختی دسته‌بندی‌ها، اسلاگ، آیکون اختصاصی و اتصال مستقیم به محصولات کاتالوگ",
    category: "role-specific",
    categoryLabel: "ابزارهای راهبری کل سامانه",
    iconName: "FolderTree",
    rolesAllowed: ["admin"],
    badge: "دسته‌بندی‌ها",
    badgeVariant: "info",
    href: "/admin/categories",
  },
  {
    id: "admin-orders",
    title: "سفارش‌ها و مرسولات کل",
    shortDescription: "مدیریت سفارش‌های عادی و سازمانی، تغییر وضعیت فاکتورها و رهگیری ناوگان ارسال",
    category: "role-specific",
    categoryLabel: "ابزارهای راهبری کل سامانه",
    iconName: "Package",
    rolesAllowed: ["admin"],
    badge: "سفارشات کل",
    badgeVariant: "default",
    href: "/admin/orders",
  },
  {
    id: "admin-partners",
    title: "همکاران سازمانی و B2B",
    shortDescription: "بررسی مدارک ثبتی شرکت‌ها، تخصیص خط اعتباری تا ۵۰۰ میلیون تومان و چک‌های صیادی",
    category: "role-specific",
    categoryLabel: "ابزارهای راهبری کل سامانه",
    iconName: "Building2",
    rolesAllowed: ["admin"],
    badge: "تایید شرکت‌ها",
    badgeVariant: "purple",
    href: "/admin/partners",
  },
  {
    id: "admin-users",
    title: "مدیریت کاربران و دسترسی‌ها",
    shortDescription: "لیست کلیه خریداران، سطوح دسترسی سازمانی، سوابق ورود و وضعیت احراز هویت",
    category: "role-specific",
    categoryLabel: "ابزارهای راهبری کل سامانه",
    iconName: "Users2",
    rolesAllowed: ["admin"],
    badge: "احراز هویت",
    badgeVariant: "default",
    href: "/admin/users",
  },
  {
    id: "admin-theme",
    title: "شخصی‌سازی زنده ظاهر و تم پلتفرم",
    shortDescription: "تغییر لحظه‌ای پالت رنگ‌های اکتیو، فونت‌های فارسی، حاشیه‌ها و نورپردازی LED",
    category: "role-specific",
    categoryLabel: "ابزارهای راهبری کل سامانه",
    iconName: "Palette",
    rolesAllowed: ["admin"],
    badge: "تنظیمات زنده",
    badgeVariant: "info",
    href: "/admin/theme",
  },
];

/**
 * فیلتر کردن صفحات بر اساس نقش کاربر فعلی
 */
export function getPagesForRole(role: UserRole = "customer", isPartnerFlag?: boolean): DashboardPageDefinition[] {
  const normRole = normalizeUserRole(role, isPartnerFlag);
  if (normRole === "partner") {
    return [];
  }
  return ALL_DASHBOARD_PAGES.filter((page) => page.rolesAllowed.includes(normRole));
}

/**
 * دریافت اطلاعات سطح کاربری و مزایای فعال آن
 */
export function getUserTierInfo(user: AuthUser | null): UserTierInfo {
  if (!user) {
    return {
      tierName: "مهمان",
      tierEnglish: "Guest",
      badgeLabel: "حساب احراز نشده",
      levelNumber: 0,
      discountRate: "۰٪",
      freeShippingText: "ندارد",
      creditText: "ندارد",
      warrantyText: "استاندارد",
      perks: ["مشاهده محصولات", "خرید به عنوان مهمان"],
    };
  }

  const rawRole = (user.role || "").toLowerCase().trim();

  if (rawRole === "admin" || rawRole === "super_admin" || rawRole === "staff_manager") {
    return {
      tierName: "مدیر کل و صاحب وبسایت",
      tierEnglish: "Root Administrator",
      badgeLabel: "دسترسی سطح روت (Root Access)",
      levelNumber: 99,
      discountRate: "کامل (اختیار تام)",
      freeShippingText: "نامحدود",
      creditText: "نامحدود",
      warrantyText: "تأیید مستقیم RMA",
      perks: [
        "دسترسی کامل به پنل مدیریت سرورها، سفارش‌ها و کاربران",
        "تغییر آنی و زنده پالت رنگ‌ها و تم سایت در Runtime",
        "تأیید مدارک احراز هویت شرکت‌های متقاضی همکاری B2B",
        "تنظیم تخفیف‌ها، کدهای کمپین و قیمت‌های لحظه‌ای بازار",
        "نظارت بر پرداخت‌های بانکی و چک‌های صیادی همکاران",
      ],
    };
  }

  if (rawRole === "partner" || rawRole === "partner_b2b") {
    return {
      tierName: "همکار سازمانی رسمی (سطح طلایی)",
      tierEnglish: "Corporate Gold Partner (Tier A)",
      badgeLabel: "همکار سازمانی تأیید شده (B2B)",
      levelNumber: 2,
      discountRate: "تا ۱۸٪ تخفیف همکاری",
      freeShippingText: "ارسال رایگان پروژه‌ای با ناوگان اختصاصی",
      creditText: "۵۰۰,۰۰۰,۰۰۰ تومان خط اعتباری فعال",
      warrantyText: "تعویض درجا ۴۸ ساعته (Enterprise RMA)",
      perks: [
        "قیمت‌های همکاری عمده در کل کاتالوگ پسیو و اکتیو",
        "خرید اینترنت سازمانی (FTTH / P2P) و تخصیص ساب‌نت IP استاتیک با تعرفه طلایی B2B",
        "صدور فاکتور رسمی قانونی همراه با ارزش افزوده و کد اقتصادی",
        "سقف خرید اعتباری تا ۵۰۰ میلیون تومان با تسویه ۴۵ روزه",
        "مدیر حساب و کارشناس پشتیبانی اختصاصی سازمانی",
        "اولویت اول در تخصیص موجودی انبارهای مرکزی و تجهیزات خاص",
        "امکان تعریف چند نماینده خرید مجاز برای شرکت",
      ],
      nextTierGoal: "سطح پلاتینیوم همکاران (خرید سالانه بالای ۲ میلیارد تومان)",
      nextTierProgressPercent: 65,
    };
  }

  // نقش کاربر عادی (مشتری خرد / retail customer)
  return {
    tierName: "کاربر حقیقی (سطح نقره‌ای)",
    tierEnglish: "Retail Silver Member",
    badgeLabel: "کاربر حقیقی تأیید شده",
    levelNumber: 1,
    discountRate: "۳٪ تخفیف وفاداری",
    freeShippingText: "رایگان برای سبدهای بالای ۵ میلیون تومان",
    creditText: "کیف پول اختصاصی و شارژ آنی",
    warrantyText: "گارانتی طلایی ۱۲ ماهه ققنوس آکادمی",
    perks: [
      "۳٪ تخفیف نقدی روی تمام تجهیزات شبکه و اتصالات",
      "ارسال رایگان اکسپرس سفارش‌های بالای ۵ میلیون تومان",
      "۷ روز مهلت تست فنی و بازگشت بی قیدوشرط کالا",
      "پشتیبانی فنی تلفنی و راهنمایی انتخاب تجهیزات",
      "کسب امتیاز باشگاه مشتریان و دریافت بن‌های تخفیف نقدی",
      "امکان ثبت پیش‌فاکتور برای پروژه‌های شخصی و اداری",
    ],
    nextTierGoal: "ارتقا به سطح طلایی (تنها ۱۵ میلیون تومان تا دسترسی به ۵٪ تخفیف دائمی)",
    nextTierProgressPercent: 40,
  };
}
