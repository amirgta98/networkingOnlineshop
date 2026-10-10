"use client";

import * as React from "react";
import Link from "next/link";
import type { AdminPageDefinition } from "../types/admin.types";
import {
  LayoutDashboard,
  Package,
  FileText,
  FileSpreadsheet,
  Building2,
  Users2,
  Layers,
  ShieldCheck,
  Headphones,
  ShieldAlert,
  Palette,
  ArrowRight,
  Clock,
  CheckCircle2,
  Server,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";

const ICON_MAP: Record<string, React.ElementType> = {
  LayoutDashboard,
  Package,
  FileText,
  FileSpreadsheet,
  Building2,
  Users2,
  Layers,
  ShieldCheck,
  Headphones,
  ShieldAlert,
  Palette,
};

interface AdminPagePlaceholderProps {
  page: AdminPageDefinition;
}

export function AdminPagePlaceholder({ page }: AdminPagePlaceholderProps) {
  const Icon = ICON_MAP[page.iconName] || Layers;

  const getExpectedFeatures = (id: string): string[] => {
    switch (id) {
      case "orders":
        return [
          "تغییر وضعیت سفارش‌ها (تایید مالی، تخصیص انبار، بسته‌بندی، تحویل باربری)",
          "تخصیص بارکد رهگیری پستی و شماره بارنامه ناوگان تخصصی تجهیزات شبکه",
          "صدور و ارسال فاکتور رسمی منطبق بر استانداردهای بازرگانی",
          "انطباق شماره سریال قطعات ارسالی (سیسکو و نگزنس) با پرونده گارانتی",
        ];
      case "rfq":
        return [
          "بررسی لیست تجمیعی BOM قطعات استعلام‌شده توسط پیمانکاران فناوری اطلاعات",
          "محاسبه و ارائه تخفیف‌های پروژه‌ای متناسب با متراژ کابل و تیراژ سوئیچ",
          "صدور و ارسال پیش‌فاکتور رسمی با مهر الکترونیک و مدت اعتبار مشخص",
          "ارجاع فنی به مهندسان شبکه جهت ارائه پارت‌نامبرهای معادل و جایگزین",
        ];
      case "invoices":
        return [
          "ارسال برخط صورتحساب‌های فروش به کارپوشه سامانه جامع مودیان مالیاتی",
          "محاسبه ۱۰٪ مالیات بر ارزش افزوده و اعمال شناسه یکتای کالا",
          "دانلود گزارش‌های فصلی دفاتر مالیاتی جهت ارائه به حسابرسان شرکت",
          "تطبیق فیش‌های واریز بانکی و تاییدیه‌های انتقال وجه پایا/ساتنا",
        ];
      case "partners":
        return [
          "بررسی و صحه‌گذاری آگهی تاسیس، روزنامه رسمی و کد اقتصادی شرکت‌های متقاضی",
          "تصویب و افزایش سقف خرید اعتباری تا ۵۰۰ میلیون تومان بر اساس اعتبارسنجی",
          "پایش وضعیت چک‌های صیادی بنفش ثبت‌شده در سامانه پیچک",
          "تخصیص کارشناس فروش اختصاصی به شرکت‌ها و پروژه‌های B2B",
        ];
      case "users":
        return [
          "مدیریت کلیه حساب‌های کاربری حقیقی و حقوقی با تفکیک نقش‌ها",
          "بررسی وضعیت مدارک احراز هویت و کدهای ملی متصل به حساب",
          "مشاهده سابقه خریدهای هر کاربر، لاگ ورود و اعتبارات کیف پول",
          "تعیین دسترسی‌های ویژه یا محدودسازی موقت حساب‌های مشکوک",
        ];
      case "products":
        return [
          "مدیریت موجودی فیزیکی انبارهای مرکزی، انبار لاله زار و گمرک",
          "تعریف آستانه هشدار کسری موجودی کالاها برای سفارش‌گذاری مجدد",
          "به‌روزرسانی قیمت‌های همکاری B2B و قیمت مصرف‌کننده با فرمول‌های ارزی",
          "بارگذاری مشخصات فنی، دیتاشیت‌های سیسکو و راهنمای نصب تجهیزات",
        ];
      case "warranty":
        return [
          "استعلام تاریخچه گارانتی طلایی با اسکن شماره سریال قطعه",
          "ثبت پرونده RMA و تخصیص قطعه به لابراتوار مهندسی تست و تعمیر ققنوس آکادمی",
          "فرآیند تعویض درجا ۴۸ ساعته ویژه خریداران سازمانی و سرورها",
          "صدور کارت ضمانت دیجیتال با کد QR اختصاصی",
        ];
      case "support":
        return [
          "پاسخگویی سریع به تیکت‌های فنی با قابلیت ضمیمه فایل کانفیگ و توپولوژی",
          "ارجاع تیکت‌های حساس زیرساخت به مهندسان سطح ۳ (دارندگان مدارک CCIE/MTCNA)",
          "دسته‌بندی موضوعی تیکت‌ها (مشاوره خرید، خطای کانفیگ، گارانتی)",
          "سیستم ارزیابی کیفیت پاسخگویی و رضایت‌سنجی از خدمات کارشناسان",
        ];
      case "security":
        return [
          "پایش بلادرنگ سوییچ‌های Core دیتاسنتر و آپلینک‌های شبکه",
          "مانیتورینگ بار پردازشی سرورها، مصرف RAM و زمان پاسخگویی پایگاه داده",
          "استریم لاگ‌های ورود دو مرحله‌ای و رویدادهای سیستمی جهت ممیزی",
          "مدیریت نشست‌های فعال ادمین و صدور فرمان خروج اضطراری",
        ];
      default:
        return [
          "امکانات کامل این ماژول بر اساس معماری فاز بعدی ادمین پیاده‌سازی خواهد شد.",
          "تطبیق کامل با سطوح دسترسی مدیر ارشد و نیازمندی‌های شبکه.",
        ];
    }
  };

  const expectedFeatures = getExpectedFeatures(page.id);

  return (
    <div className="flex flex-col gap-6" dir="rtl">
      {/* Header card */}
      <div className="relative overflow-hidden rounded-3xl border border-emerald-500/30 bg-gradient-to-br from-emerald-950/20 via-[var(--theme-surface)] to-[var(--theme-surface)] p-6 sm:p-8 backdrop-blur-xl shadow-xl">
        <div className="absolute top-0 left-0 w-80 h-80 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-emerald-500/30 bg-emerald-500/15 text-emerald-400 text-2xl shadow-lg shadow-emerald-500/10">
              <Icon className="h-8 w-8" />
            </div>

            <div className="flex flex-col gap-1.5 text-right">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="text-xs text-neutral-400 font-mono">
                  دسته‌بندی: {page.categoryLabel}
                </span>
                <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                  ماژول مدیریت اختصاصی (دسترسی Root)
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

          <Link href="/admin">
            <Button
              variant="outline"
              className="gap-2 shrink-0 border-emerald-500/30 hover:bg-emerald-500/10 text-emerald-300 cursor-pointer self-start sm:self-center"
            >
              <ArrowRight className="h-4 w-4" />
              <span>بازگشت به پیشخوان ادمین</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Specification Card */}
      <div className="rounded-3xl border border-[var(--theme-border-color)] bg-[var(--theme-surface)] p-6 sm:p-7 shadow-sm">
        <div className="flex items-center gap-2.5 mb-4 text-right">
          <Clock className="h-5 w-5 text-emerald-400" />
          <h2 className="text-base font-bold text-[var(--theme-foreground)]">
            ابزارها و اختیارات پیش‌بینی‌شده برای ماژول «{page.title}»
          </h2>
        </div>

        <p className="text-xs text-neutral-400 leading-relaxed mb-6 text-right">
          این بخش به عنوان یکی از بازوهای کنترلی پنل مدیریت طراحی شده و اختیارات زیر به زودی در دسترس
          قرار خواهد گرفت:
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
            <span>نیاز به بررسی سریع خلاصه وضعیت این بخش دارید؟</span>
            <span className="block text-[11px] text-neutral-500 mt-0.5">
              اطلاعات تجمیعی، سفارشات فعال و هشدارهای این بخش در پیشخوان اصلی مدیریت قابل مشاهده است.
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/admin">
              <Button
                variant="default"
                className="text-xs font-semibold gap-2 bg-emerald-600 hover:bg-emerald-500 text-white"
              >
                <span>مشاهده پیشخوان مدیریت کل</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
