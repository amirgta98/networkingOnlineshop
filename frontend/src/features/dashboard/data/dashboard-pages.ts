import type { UserRole, AuthUser } from "@/features/auth";
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
    rolesAllowed: ["customer", "partner", "admin"],
    isPrimary: true,
  },
  {
    id: "orders",
    title: "سفارش‌ها و رهگیری مرسولات",
    shortDescription: "لیست کلیه خریدهای در حال پردازش، ارسال شده، تحویل شده و لغو شده",
    category: "commerce",
    categoryLabel: "خرید و مبادلات",
    iconName: "Package",
    rolesAllowed: ["customer", "partner", "admin"],
    badge: "۲ سفارش",
    badgeVariant: "info",
  },
  {
    id: "invoices",
    title: "فاکتورها و اسناد مالی",
    shortDescription: "دانلود فاکتورهای استاندارد و رسمی با شناسه یکتای مالیاتی و مهر الکترونیک",
    category: "commerce",
    categoryLabel: "خرید و مبادلات",
    iconName: "FileText",
    rolesAllowed: ["customer", "partner", "admin"],
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
    rolesAllowed: ["customer", "partner", "admin"],
    badge: "موجودی: ۲,۴۵۰,۰۰۰ تومان",
    badgeVariant: "success",
  },
  {
    id: "wishlist",
    title: "علاقه‌مندی‌ها و اطلاع از موجودی",
    shortDescription: "تجهیزات نشان‌شده، مقایسه سریع مشخصات فنی و هشدار کاهش قیمت",
    category: "commerce",
    categoryLabel: "خرید و مبادلات",
    iconName: "Heart",
    rolesAllowed: ["customer", "partner", "admin"],
    badge: "۴ قلم کالا",
    badgeVariant: "default",
  },
  {
    id: "addresses",
    title: "آدرس‌ها و اطلاعات تحویل",
    shortDescription: "دفاتر، انبارها و پروژه‌های مقصد جهت ارسال سریع تجهیزات شبکه با پیک و باربری",
    category: "commerce",
    categoryLabel: "خرید و مبادلات",
    iconName: "MapPin",
    rolesAllowed: ["customer", "partner", "admin"],
    badge: "۱ آدرس پیش‌فرض",
    badgeVariant: "default",
  },

  // ─── دسته ۲: خدمات تخصصی شبکه و پروژه‌ها ───────────────────────
  {
    id: "rfq",
    title: "استعلام قیمت پروژه‌ای (RFQ)",
    shortDescription: "درخواست استعلام لیست تجمیعی سوئیچ، روتر، رک و کابل شبکه با قیمت ویژه پروژه",
    category: "services",
    categoryLabel: "خدمات تخصصی زیرساخت",
    iconName: "FileSpreadsheet",
    rolesAllowed: ["customer", "partner", "admin"],
    badge: "ویژه پروژه‌ها",
    badgeVariant: "purple",
  },
  {
    id: "warranty",
    title: "استعلام اصالت و گارانتی (RMA)",
    shortDescription: "بررسی سریال نامبر تجهیزات سیسکو، میکروتیک و ثبت درخواست تعویض یا تعمیر",
    category: "services",
    categoryLabel: "خدمات تخصصی زیرساخت",
    iconName: "ShieldCheck",
    rolesAllowed: ["customer", "partner", "admin"],
    badge: "گارانتی طلایی ولوکس",
    badgeVariant: "success",
  },
  {
    id: "support",
    title: "تیکت‌ها و پشتیبانی مهندسی",
    shortDescription: "مشاوره با مهندسان ارشد شبکه CCIE/MTCNA جهت طراحی توپولوژی و کانفیگ",
    category: "services",
    categoryLabel: "خدمات تخصصی زیرساخت",
    iconName: "Headphones",
    rolesAllowed: ["customer", "partner", "admin"],
    badge: "۱ تیکت در جریان",
    badgeVariant: "warning",
  },

  // ─── دسته ۳: اطلاعات و امنیت حساب ─────────────────────────────
  {
    id: "profile",
    title: "مشخصات حساب و احراز هویت",
    shortDescription: "اطلاعات هویتی، کد ملی، شماره شبا، شماره تماس اضطراری و کد پستی",
    category: "account",
    categoryLabel: "امنیت و حساب کاربری",
    iconName: "User",
    rolesAllowed: ["customer", "partner", "admin"],
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
    rolesAllowed: ["customer", "partner", "admin"],
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
    badge: "۴۸۰ امتیاز",
    badgeVariant: "info",
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
    id: "partner-catalog",
    title: "کاتالوگ و لیست قیمت عمده همکاران",
    shortDescription: "مشاهده قیمت‌های همکاری بر اساس تیراژ کارتن و قرقره به همراه فایل اکسل روزانه",
    category: "role-specific",
    categoryLabel: "امکانات اختصاصی سازمانی B2B",
    iconName: "Building2",
    rolesAllowed: ["partner", "admin"],
    badge: "تخفیف تا ۱۸٪",
    badgeVariant: "purple",
  },
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
  {
    id: "partner-agents",
    title: "مدیریت کارشناسان خرید شرکت",
    shortDescription: "افزودن دسترسی کارشناسان تدارکات و پیمانکاران زیرمجموعه جهت ثبت سفارش",
    category: "role-specific",
    categoryLabel: "امکانات اختصاصی سازمانی B2B",
    iconName: "Users2",
    rolesAllowed: ["partner", "admin"],
    badge: "۳ نماینده فعال",
    badgeVariant: "info",
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
  },
];

/**
 * فیلتر کردن صفحات بر اساس نقش کاربر فعلی
 */
export function getPagesForRole(role: UserRole = "customer"): DashboardPageDefinition[] {
  return ALL_DASHBOARD_PAGES.filter((page) => page.rolesAllowed.includes(role));
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

  if (user.role === "admin") {
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

  if (user.role === "partner") {
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
    creditText: "اعتبار هدیه ۲,۴۵۰,۰۰۰ تومان",
    warrantyText: "گارانتی طلایی ۱۲ ماهه ولوکس",
    perks: [
      "۳٪ تخفیف نقدی روی تمام تجهیزات شبکه و اتصالات",
      "ارسال رایگان اکسپرس سفارش‌های بالای ۵ میلیون تومان",
      "۷ روز مهلت تست فنی و بازگشت بی قیدوشرط کالا",
      "پشتیبانی فنی تلفنی و راهنمایی انتخاب تجهیزات",
      "کسب ۴۸۰ امتیاز باشگاه مشتریان قابل تبدیل به ووچر تخفیف",
      "امکان ثبت پیش‌فاکتور برای پروژه‌های شخصی و اداری",
    ],
    nextTierGoal: "ارتقا به سطح طلایی (تنها ۱۵ میلیون تومان تا دسترسی به ۵٪ تخفیف دائمی)",
    nextTierProgressPercent: 40,
  };
}
