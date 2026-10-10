"use client";

import * as React from "react";
import Link from "next/link";
import type { DashboardPageDefinition } from "../types/dashboard.types";
import type { AuthUser } from "@/features/auth";
import {
  LayoutDashboard,
  Package,
  FileText,
  Wallet,
  Heart,
  MapPin,
  FileSpreadsheet,
  ShieldCheck,
  Headphones,
  User,
  Lock,
  Award,
  Sparkles,
  Building2,
  CreditCard,
  Users2,
  ShieldAlert,
  Palette,
  ArrowRight,
  Clock,
  Layers,
  CheckCircle2,
  Globe2,
  Wifi,
  Server,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";

const ICON_MAP: Record<string, React.ElementType> = {
  LayoutDashboard,
  Package,
  FileText,
  Wallet,
  Heart,
  MapPin,
  FileSpreadsheet,
  ShieldCheck,
  Headphones,
  User,
  Lock,
  Award,
  Sparkles,
  Building2,
  Globe2,
  Wifi,
  Server,
  CreditCard,
  Users2,
  ShieldAlert,
  Palette,
};

interface DashboardPagePlaceholderProps {
  page: DashboardPageDefinition;
  user: AuthUser | null;
  onBackToOverview?: () => void;
}

export function DashboardPagePlaceholder({
  page,
  user,
  onBackToOverview,
}: DashboardPagePlaceholderProps) {
  const Icon = ICON_MAP[page.iconName] || Layers;

  // Expected features preview based on page id
  const getExpectedFeatures = (id: string): string[] => {
    switch (id) {
      case "orders":
        return [
          "فیلتر بر اساس وضعیت سفارش (جاری، تحویل شده، لغو شده)",
          "رهگیری زنده موقعیت مرسوله با بارکد پستی و پیک اختصاصی",
          "مشاهده اقلام دقیق سفارش با شماره سریال قطعات شبکه",
          "امکان لغو یا ثبت درخواست عودت تا ۷ روز",
        ];
      case "invoices":
        return [
          "صدور و دریافت PDF فاکتور رسمی منطبق با سامانه مودیان",
          "محاسبه ۱۰٪ مالیات بر ارزش افزوده و تخفیف‌های ردیفی",
          "گزارش‌گیری فصلی جهت ارائه به دوایر مالیاتی شرکت‌ها",
          "امکان چاپ مستقیم و ارسال فاکتور به ایمیل حسابداری",
        ];
      case "wallet":
        return [
          "شارژ آنی موجودی از طریق کلیه درگاه‌های عضو شبکه شتاب",
          "امکان برداشت نقدی به شماره شبای تایید شده",
          "ریز تراکنش‌های واریز، برداشت و پاداش‌های بازگشت نقدی (Cashback)",
          "استفاده ترکیبی از کیف پول و درگاه برای تسویه سبد خرید",
        ];
      case "wishlist":
        return [
          "دسته‌بندی تجهیزات بر اساس پروژه‌ها (اتاق سرور، پسیو، سوئیچینگ)",
          "فعال‌سازی آلارم پیامکی در صورت شارژ موجودی انبار",
          "اطلاع‌رسانی کاهش قیمت و تخفیف‌های شگفت‌انگیز",
          "انتقال یکجای کالاهای نشان‌شده به سبد خرید",
        ];
      case "addresses":
        return [
          "ثبت چندین آدرس با تفکیک (دفتر مرکزی، انبار، پروژه اجرایی)",
          "انتخاب موقعیت روی نقشه و دریافت خودکار کد پستی",
          "تعیین تحویل‌گیرنده مجاز به همراه شماره تماس",
          "تنظیم آدرس پیش‌فرض جهت خرید با یک کلیک",
        ];
      case "rfq":
        return [
          "بارگذاری فایل اکسل BOM (Bill of Materials) تجهیزات پروژه",
          "استعلام قیمت رقابتی برای متراژ بالای کابل و رک‌های شبکه",
          "دریافت پیش‌فاکتور رسمی ظرف کمتر از ۳ ساعت کاری",
          "تخصیص کارشناس فنی جهت جایگزینی پارت‌نامبرهای ناموجود",
        ];
      case "warranty":
        return [
          "استعلام اعتبار گارانتی طلایی با اسکن بارکد سریال (Serial No)",
          "ثبت آنلاین درخواست RMA و تحویل کالا به مرکز سرویس ققنوس آکادمی",
          "رهگیری وضعیت تعمیر یا تعویض قطعه در لابراتوار فنی",
          "تمدید گارانتی و خرید بسته خدمات پشتیبانی ویژه",
        ];
      case "support":
        return [
          "ارسال تیکت مستقیم به مهندسان شبکه سیسکو و فیبر نوری",
          "پیوست کردن فایل‌های لاگ، فایل کانفیگ و نقشه‌های شبکه",
          "امتیازدهی به کیفیت پاسخگویی کارشناسان فنی",
          "دریافت اعلان پیامکی هنگام پاسخگویی به تیکت",
        ];
      case "profile":
        return [
          "تکمیل اطلاعات فردی و مشخصات هویتی مطابق کارت ملی",
          "تأیید ایمیل و شماره شبای بانکی جهت بازگشت وجوه",
          "مدیریت شماره تماس‌های پشتیبان و هماهنگی ارسال",
          "تنظیم ترجیحات ارتباطی و دریافت خبرنامه تخصصی شبکه",
        ];
      case "security":
        return [
          "تنظیم و تغییر رمز عبور لایه دوم (PIN شش رقمی)",
          "مشاهده کلیه نشست‌های فعال (Active Sessions) و دستگاه‌های متصل",
          "خروج اضطراری از سایر دستگاه‌ها با یک کلیک",
          "تاریخچه آخرین ورودها با درج آی‌پی و موقعیت جغرافیایی",
        ];
      case "club":
        return [
          "مشاهده امتیازات کسب‌شده از هر سفارش تجهیزات شبکه",
          "تبدیل امتیازات به کدهای تخفیف میلیونی و بن‌های خرید",
          "هدایای سالروز عضویت و بسته‌های شگفت‌انگیز فصلی",
          "ارتقا به سطوح بالاتر با مزایای نقدی بیشتر",
        ];
      case "upgrade-partner":
        return [
          "بارگذاری روزنامه رسمی، آگهی تاسیس و کد اقتصادی شرکت",
          "احراز هویت حقوقی و دریافت تاییده صلاحیت همکاری",
          "اعطای خط اعتباری اولیه ۲۰۰ تا ۵۰۰ میلیون تومانی",
          "دسترسی به تخفیف‌های ویژه همکاران عمده و پیمانکاران",
        ];
      case "partner-catalog":
        return [
          "دانلود لیست قیمت روزانه تجهیزات به تفکیک برندها (Cisco, Nexans, MikroTik)",
          "قیمت‌های پلکانی متناسب با حجم خرید کارتن و پالت",
          "رزرو آنلاین موجودی انبار برای پروژه‌های در حال مناقصه",
          "دریافت دیتاشیت رسمی و تاییدیه اصالت کالاها",
        ];
      case "partner-internet":
        return [
          "خرید آنلاین پهنای باند وایرلس متقارن ۱:۱ پوینت تو پوینت (P2P)",
          "انتخاب دقیق بر اساس سرعت (۵۰ تا ۱۰۰۰ مگابیت) و ترافیک (۵۰۰GB تا نامحدود)",
          "دوره‌های زمانی منعطف ۱، ۳، ۶ و ۱۲ ماهه با تخفیف مازاد همکاری تا ۲۰٪",
          "امکان افزودن مستقیم آدرس IP استاتیک و تسویه از محل خط اعتباری ۵۰۰ میلیونی",
        ];
      case "partner-static-ip":
        return [
          "خرید و تخصیص مستقیم آدرس‌های آی‌پی ثابت سازمانی (IPv4)",
          "دوره‌های زمانی ۱، ۳، ۶ و ۱۲ ماهه در تعداد دلخواه (تکی، /30, /29, /28, /27)",
          "تنظیم خودکار رکوردهای Reverse DNS (rDNS/PTR) و ثبت رسمی RIPE",
          "امکان استفاده مستقل روی لینک‌های موجود با تحویل آنی",
        ];
      case "partner-credit":
        return [
          "مدیریت چک‌های صیادی بنفش ثبت‌شده در سامانه پیچک",
          "سررسید پرداخت‌ها و گزارش صورتحساب‌های معوق",
          "درخواست افزایش سقف اعتبار بر اساس سابقه خرید",
          "تسویه خودکار فاکتورها از محل خط اعتباری فعال",
        ];
      case "partner-agents":
        return [
          "افزودن نام و تلفن کارشناسان خرید و تحویل‌گیرندگان پروژه",
          "تعیین سقف خرید مجاز برای هر کارشناس",
          "مشاهده لاگ سفارش‌های ثبت‌شده توسط پرسنل شرکت",
          "امکان غیرفعال‌سازی فوری دسترسی پرسنل",
        ];
      case "admin-overview":
        return [
          "داشبورد جامع نظارت بر سیستم و سفارش‌های کل پلتفرم",
          "تأیید حساب‌های حقوقی شرکت‌های جدید",
          "مانیتورینگ تراکنش‌های درگاه پرداخت و گزارش‌های فروش",
          "مدیریت موجودی انبارهای تجهیزات پسیو و اکتیو",
        ];
      case "admin-theme":
        return [
          "شخصی‌سازی زنده رنگ‌های اصلی و فرعی پلتفرم",
          "تغییر تایپوگرافی، مقیاس اندازه قلم و حاشیه‌ها",
          "تنظیم شدت درخشش المان‌های Cyber و LEDها",
          "ذخیره و اعمال تغییرات به صورت بلادرنگ در کل سایت",
        ];
      default:
        return [
          "امکانات کامل این بخش بر اساس معماری فاز بعدی توسعه خواهد یافت.",
          "تطبیق کامل با سطح کاربری و نیازمندی‌های فنی شما.",
        ];
    }
  };

  const expectedFeatures = getExpectedFeatures(page.id);

  return (
    <div className="flex flex-col gap-6" dir="rtl">
      {/* Header card */}
      <div className="relative overflow-hidden rounded-3xl border border-[var(--theme-border-color)] bg-[var(--theme-surface)] p-6 sm:p-8 backdrop-blur-xl shadow-xl">
        <div className="absolute top-0 left-0 w-80 h-80 bg-orange-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-orange-500/30 bg-orange-500/15 text-orange-400 text-2xl shadow-lg shadow-orange-500/10">
              <Icon className="h-8 w-8" />
            </div>

            <div className="flex flex-col gap-1.5 text-right">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="text-xs text-neutral-400 font-mono">
                  دسته‌بندی: {page.categoryLabel}
                </span>
                <span className="text-[11px] font-semibold text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                  در دست توسعه (طبق نیازمندی‌های فاز بعد)
                </span>
              </div>

              <h1 className="text-xl sm:text-2xl font-black text-[var(--theme-foreground)]">
                {page.title}
              </h1>

              <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed max-w-2xl mt-1">
                {page.shortDescription}
              </p>
            </div>
          </div>

          <Link href="/dashboard" onClick={onBackToOverview}>
            <Button
              variant="outline"
              className="gap-2 shrink-0 border-neutral-700 hover:bg-neutral-800 text-neutral-200 cursor-pointer self-start sm:self-center"
            >
              <ArrowRight className="h-4 w-4" />
              <span>بازگشت به پیشخوان اصلی</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Specification Card */}
      <div className="rounded-3xl border border-[var(--theme-border-color)] bg-[var(--theme-surface)] p-6 sm:p-7 shadow-sm">
        <div className="flex items-center gap-2.5 mb-4 text-right">
          <Clock className="h-5 w-5 text-orange-400" />
          <h2 className="text-base font-bold text-[var(--theme-foreground)]">
            امکانات و اختیارات پیش‌بینی‌شده برای صفحه «{page.title}»
          </h2>
        </div>

        <p className="text-xs text-neutral-400 leading-relaxed mb-6 text-right">
          این صفحه با توجه به سطح کاربری فعلی شما (
          <strong className="text-neutral-200">
            {user?.role === "admin"
              ? "ادمین / صاحب سایت"
              : user?.role === "partner"
              ? "همکار سازمانی B2B"
              : "کاربر عادی"}
          </strong>
          ) طراحی شده و در فاز بعدی امکانات زیر در آن پیاده‌سازی خواهد شد:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 mb-8 text-right">
          {expectedFeatures.map((feat, idx) => (
            <div
              key={idx}
              className="flex items-start gap-3 p-3.5 rounded-2xl border border-neutral-800/80 bg-neutral-900/40 text-neutral-200"
            >
              <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <CheckCircle2 className="h-3.5 w-3.5" />
              </div>
              <span className="text-xs leading-relaxed font-medium">{feat}</span>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl border border-neutral-800 bg-neutral-950/60">
          <div className="text-xs text-neutral-400 text-right">
            <span>آیا به دسترسی فوری به اطلاعات این صفحه نیاز دارید؟</span>
            <span className="block text-[11px] text-neutral-500 mt-0.5">
              کارشناسان فنی ققنوس آکادمی به صورت ۲۴ ساعته از طریق تلفن و تیکت پاسخگوی شما هستند.
            </span>
          </div>

          <div className="flex items-center gap-2">
            {page.id === "partner-internet" && (
              <Link href="/partner/internet">
                <Button className="bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold gap-2">
                  <Wifi className="h-4 w-4" />
                  <span>ورود مستقیم به صفحه خرید اینترنت P2P</span>
                </Button>
              </Link>
            )}
            {page.id === "partner-static-ip" && (
              <Link href="/partner/static-ip">
                <Button className="bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold gap-2">
                  <Server className="h-4 w-4" />
                  <span>ورود مستقیم به صفحه خرید آی‌پی استاتیک</span>
                </Button>
              </Link>
            )}
            <Button
              variant={page.id === "partner-internet" || page.id === "partner-static-ip" ? "outline" : "default"}
              onClick={onBackToOverview}
              className="text-xs font-semibold gap-2 border-neutral-700"
            >
              <span>مشاهده پیشخوان و سایر خدمات</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
