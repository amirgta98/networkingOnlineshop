import type { PartnerPageDefinition } from "../types/partner.types";

export const PARTNER_PAGES: PartnerPageDefinition[] = [
  // ─── دسته ۱: راهبری و پیشخوان ────────────────────────────────
  {
    id: "overview",
    title: "پیشخوان و خلاصه وضعیت",
    shortDescription: "نمای جامع خط اعتباری ۵۰۰ میلیونی، آخرین وضعیت چک‌های صیادی و خلاصه سفارش‌های فعال",
    category: "overview",
    categoryLabel: "راهبری و پیشخوان همکار",
    iconName: "LayoutDashboard",
    href: "/partner",
    badge: "فعال",
    badgeVariant: "sky",
  },

  // ─── دسته ۲: خرید سازمانی و سفارش‌ها ─────────────────────────
  {
    id: "orders",
    title: "سفارش‌ها و مرسولات شرکتی",
    shortDescription: "رهگیری سفارش‌های پروژه‌ای و حجیم، تفکیک بر اساس انبار مقصد و بارنامه‌های باربری",
    category: "procurement",
    categoryLabel: "خرید سازمانی و سفارش‌ها",
    iconName: "Package",
    href: "/partner/orders",
  },
  {
    id: "rfq",
    title: "استعلام قیمت پروژه‌ای (RFQ)",
    shortDescription: "ارسال لیست BOM تجهیزات پسیو و اکتیو پروژه، صدور پیش‌فاکتور رسمی و مهلت اعتبار قیمت‌ها",
    category: "procurement",
    categoryLabel: "خرید سازمانی و سفارش‌ها",
    iconName: "FileSpreadsheet",
    href: "/partner/rfq",
  },

  // ─── دسته ۳: امور مالی، اعتبار و مالیات ───────────────────────
  {
    id: "wallet",
    title: "کیف پول و موجودی نقدی",
    shortDescription: "مدیریت موجودی نقد آزاد، تسویه پورسانت‌های همکار به شماره کارت و شبا و سوابق واریزها",
    category: "finance",
    categoryLabel: "امور مالی، اعتبار و مالیات",
    iconName: "Wallet",
    href: "/partner/wallet",
    badge: "تسویه شتاب",
    badgeVariant: "success",
  },
  {
    id: "credit",
    title: "خط اعتباری و چک‌های صیادی",
    shortDescription: "مدیریت سقف اعتبار ۵۰۰ میلیون تومانی، ثبت چک صیادی بنفش در سامانه پیچک و سررسیدهای ۴۵ روزه",
    category: "finance",
    categoryLabel: "امور مالی، اعتبار و مالیات",
    iconName: "CreditCard",
    href: "/partner/credit",
  },
  {
    id: "invoices",
    title: "فاکتورهای رسمی و سامانه مودیان",
    shortDescription: "صورتحساب‌های الکترونیکی مالیاتی با شناسه یکتا، ارزش افزوده ۱۰٪، دانلود نسخه‌های PDF و دفاتر",
    category: "finance",
    categoryLabel: "امور مالی، اعتبار و مالیات",
    iconName: "FileText",
    href: "/partner/invoices",
    badge: "سامانه مودیان",
    badgeVariant: "sky",
  },

  // ─── دسته ۴: پروژه‌ها و مقاصد تحویل ───────────────────────────
  {
    id: "projects",
    title: "پروژه‌ها و مقاصد تحویل کارگاهی",
    shortDescription: "مدیریت سایت‌های اجرایی، کارگاه‌های نصب و دیتاسنترها جهت تحویل مستقیم به سرپرست کارگاه",
    category: "operations",
    categoryLabel: "پروژه‌ها و تحویل کارگاهی",
    iconName: "Building2",
    href: "/partner/projects",
  },

  // ─── دسته ۵: گارانتی شرکتی و پشتیبانی VIP ─────────────────────
  {
    id: "warranty",
    title: "گارانتی تعویض درجا (RMA)",
    shortDescription: "تعهد تعویض ۲۴ ساعته ویژه همکاران، استعلام دسته‌ای سریال قطعات و پیگیری آزمایشگاه فنی",
    category: "services",
    categoryLabel: "گارانتی شرکتی و پشتیبانی VIP",
    iconName: "ShieldCheck",
    href: "/partner/warranty",
    badge: "SLA ۲۴ ساعته",
    badgeVariant: "success",
  },
  {
    id: "support",
    title: "مدیر حساب و پشتیبانی مهندسی",
    shortDescription: "ارتباط مستقیم با مدیر ارشد حساب شرکتی (Account Manager) و تیکت‌های اضطراری زیرساخت",
    category: "services",
    categoryLabel: "گارانتی شرکتی و پشتیبانی VIP",
    iconName: "Headphones",
    href: "/partner/support",
    badge: "اکانت منیجر VIP",
    badgeVariant: "purple",
  },

  // ─── دسته ۶: مدارک ثبتی و امنیت حساب ──────────────────────────
  {
    id: "profile",
    title: "مشخصات شرکت و مدارک حقوقی",
    shortDescription: "شناسه ملی، کد اقتصادی، روزنامه رسمی، آگهی آخرین تغییرات و وضعیت تایید اسناد حقوقی",
    category: "legal",
    categoryLabel: "مدارک ثبتی و امنیت حساب",
    iconName: "FileCheck2",
    href: "/partner/profile",
    badge: "احراز شده ✓",
    badgeVariant: "success",
  },
  {
    id: "security",
    title: "امنیت، نشست‌ها و تایید ۲FA",
    shortDescription: "پایش نشست‌های ورود نمایندگان، رمز عبور لایه دوم پیامکی و گزارش امنیتی تراکنش‌ها",
    category: "legal",
    categoryLabel: "مدارک ثبتی و امنیت حساب",
    iconName: "Lock",
    href: "/partner/security",
    badge: "محافظت شده",
    badgeVariant: "warning",
  },
];
