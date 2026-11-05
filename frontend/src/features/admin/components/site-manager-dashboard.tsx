"use client";

import * as React from "react";
import Link from "next/link";
import type { AuthUser } from "@/features/auth";
import { ADMIN_PAGES } from "../data/admin-pages";
import type { AdminPageDefinition } from "../types/admin.types";
import { toPersianDigits } from "@/shared/lib/utils";
import {
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  Layers,
  LayoutDashboard,
  Package,
  FileText,
  FileSpreadsheet,
  Building2,
  Users2,
  BadgePercent,
  FolderTree,
  Headphones,
  Palette,
  Truck,
  Flame,
  Wallet,
  BookOpen,
  Briefcase,
  Wrench,
  Globe2,
  Lock,
  Sparkles,
  ExternalLink,
  Info,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";

const ICON_MAP: Record<string, React.ElementType> = {
  LayoutDashboard,
  Package,
  FileText,
  FileSpreadsheet,
  Building2,
  Users2,
  BadgePercent,
  Layers,
  FolderTree,
  ShieldCheck,
  Headphones,
  ShieldAlert,
  Palette,
  Truck,
  Flame,
  Wallet,
  BookOpen,
  Briefcase,
  Wrench,
  Globe2,
};

const CATEGORY_INFO: Record<
  string,
  { label: string; icon: React.ElementType; color: string; border: string; bg: string }
> = {
  overview: {
    label: "راهبری و پایش سیستم",
    icon: LayoutDashboard,
    color: "text-emerald-400",
    border: "border-emerald-500/30",
    bg: "bg-emerald-500/10",
  },
  commerce: {
    label: "خرید، سفارش‌ها و مالی",
    icon: Package,
    color: "text-sky-400",
    border: "border-sky-500/30",
    bg: "bg-sky-500/10",
  },
  partners: {
    label: "همکاران سازمانی و مشتریان",
    icon: Building2,
    color: "text-purple-400",
    border: "border-purple-500/30",
    bg: "bg-purple-500/10",
  },
  inventory: {
    label: "انبارداری و خدمات مهندسی",
    icon: Layers,
    color: "text-amber-400",
    border: "border-amber-500/30",
    bg: "bg-amber-500/10",
  },
  content: {
    label: "محتوا و آکادمی تخصصی",
    icon: BookOpen,
    color: "text-rose-400",
    border: "border-rose-500/30",
    bg: "bg-rose-500/10",
  },
  system: {
    label: "تنظیمات و امنیت سامانه",
    icon: ShieldAlert,
    color: "text-indigo-400",
    border: "border-indigo-500/30",
    bg: "bg-indigo-500/10",
  },
};

interface SiteManagerDashboardProps {
  user: AuthUser | null;
}

export function SiteManagerDashboard({ user }: SiteManagerDashboardProps) {
  const userPerms = React.useMemo(() => new Set(user?.permissions || []), [user?.permissions]);

  // Permitted pages for this site manager
  const permittedPages = React.useMemo(() => {
    return ADMIN_PAGES.filter((p) => userPerms.has(`admin:${p.id}`));
  }, [userPerms]);

  // Group permitted pages by category
  const groupedPermitted = React.useMemo(() => {
    const groups: Record<string, AdminPageDefinition[]> = {};
    for (const page of permittedPages) {
      if (!groups[page.category]) {
        groups[page.category] = [];
      }
      groups[page.category].push(page);
    }
    return groups;
  }, [permittedPages]);

  const totalPossible = ADMIN_PAGES.length;
  const permittedCount = permittedPages.length;
  const coveragePercent = Math.round((permittedCount / (totalPossible || 1)) * 100);

  return (
    <div className="flex flex-col gap-6 sm:gap-8 text-right" dir="rtl">
      {/* 1. Welcome Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-purple-500/30 bg-gradient-to-br from-purple-950/40 via-[var(--theme-surface)] to-[var(--theme-surface)] p-6 sm:p-8 backdrop-blur-xl shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="flex h-16 w-16 sm:h-20 sm:w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500/25 via-indigo-600/20 to-purple-950/40 border border-purple-500/40 text-purple-400 text-2xl font-black ring-2 ring-purple-500/20 shadow-lg shadow-purple-500/10">
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.name} className="h-full w-full object-cover rounded-2xl" />
              ) : (
                user?.name?.slice(0, 1) || "س"
              )}
            </div>

            <div className="flex flex-col gap-1.5 min-w-0">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-xl sm:text-2xl font-black text-white">
                  خوش‌آمدید، {user?.name || "سایت‌گردان گرامی"}
                </h1>
                <span className="text-xs text-purple-300 bg-purple-500/20 px-2.5 py-0.5 rounded-full border border-purple-500/30 font-semibold flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-purple-400" />
                  <span>داشبورد اختصاصی سایت‌گردان</span>
                </span>
              </div>

              <p className="text-xs sm:text-sm text-neutral-300 max-w-2xl leading-relaxed">
                به مرکز کنترل عملیاتی خود خوش آمدید. شما دارای دسترسی‌های مدیریتی تعیین‌شده توسط ادمین اصلی هستید و کلیه عملیات‌های مجاز شما در سرور لاگ و محافظت می‌شوند.
              </p>

              <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-400 font-mono mt-1">
                <span>تلفن: {user?.phone}</span>
                {user?.email && <span>• ایمیل: {user.email}</span>}
                <span className="text-purple-300 font-sans font-medium">
                  • {toPersianDigits(permittedCount)} بخش مجاز فعال
                </span>
              </div>
            </div>
          </div>

          {/* Quick External Actions */}
          <div className="flex items-center gap-2.5 self-start md:self-center shrink-0">
            <Link href="/dashboard">
              <Button variant="outline" className="h-9 px-3.5 border-neutral-700 text-neutral-300 text-xs gap-1.5 hover:bg-neutral-800">
                <ExternalLink className="h-3.5 w-3.5 text-orange-400" />
                <span>داشبورد کاربری عادی</span>
              </Button>
            </Link>

            <Link href="/">
              <Button variant="outline" className="h-9 px-3.5 border-neutral-700 text-neutral-300 text-xs gap-1.5 hover:bg-neutral-800">
                <span>مشاهده سایت</span>
                <ArrowRight className="h-3.5 w-3.5 rotate-180" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Key Metrics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 sm:p-5 rounded-2xl border border-purple-500/20 bg-neutral-900/60 backdrop-blur-md flex items-center justify-between shadow-sm">
          <div className="flex flex-col gap-1">
            <span className="text-xs text-neutral-400 font-medium">بخش‌های مدیریتی فعال</span>
            <span className="text-xl sm:text-2xl font-black font-mono text-purple-300">
              {toPersianDigits(permittedCount)}{" "}
              <span className="text-xs text-neutral-400 font-sans font-normal">از {toPersianDigits(totalPossible)}</span>
            </span>
            <span className="text-[10px] text-purple-400">تخصیص‌یافته توسط مدیر ارشد</span>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-500/10 border border-purple-500/25 text-purple-400">
            <ShieldCheck className="h-6 w-6" />
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl border border-sky-500/20 bg-neutral-900/60 backdrop-blur-md flex items-center justify-between shadow-sm">
          <div className="flex flex-col gap-1">
            <span className="text-xs text-neutral-400 font-medium">دسته‌بندی‌های تحت پوشش</span>
            <span className="text-xl sm:text-2xl font-black font-mono text-sky-400">
              {toPersianDigits(Object.keys(groupedPermitted).length)}{" "}
              <span className="text-xs text-neutral-400 font-sans font-normal">از ۶ حوزه</span>
            </span>
            <span className="text-[10px] text-sky-400">ماژول‌های فعال عملیاتی</span>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-500/10 border border-sky-500/25 text-sky-400">
            <Layers className="h-6 w-6" />
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl border border-emerald-500/20 bg-neutral-900/60 backdrop-blur-md flex items-center justify-between shadow-sm">
          <div className="flex flex-col gap-1">
            <span className="text-xs text-neutral-400 font-medium">پوشش دسترسی پنل</span>
            <span className="text-xl sm:text-2xl font-black font-mono text-emerald-400">
              {toPersianDigits(coveragePercent)}٪
            </span>
            <span className="text-[10px] text-emerald-400">تفکیک وظایف دقیق (RBAC)</span>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-400">
            <Sparkles className="h-6 w-6" />
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl border border-neutral-800 bg-neutral-900/60 backdrop-blur-md flex items-center justify-between shadow-sm">
          <div className="flex flex-col gap-1">
            <span className="text-xs text-neutral-400 font-medium">امنیت حساب و ورود</span>
            <span className="text-sm font-bold text-white">
              {user?.twoFactorEnabled ? "۲FA فعال و امن" : "ورود با رمز پیامکی"}
            </span>
            <span className="text-[10px] text-neutral-500">نشست احراز هویت تاییدشده</span>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral-800 border border-neutral-700 text-neutral-300">
            <Lock className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* 3. Permitted Modules Grid (The Operational Hub) */}
      <div className="flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="flex h-3 w-3 rounded-full bg-purple-400 shadow-[0_0_8px_#c084fc]" />
            <h2 className="text-base sm:text-lg font-black text-white">
              ماژول‌ها و بخش‌های در دسترس شما
            </h2>
          </div>
          <span className="text-xs text-neutral-400">
            برای شروع عملیات، روی بخش مورد نظر کلیک کنید
          </span>
        </div>

        {permittedCount === 0 ? (
          <div className="flex flex-col items-center justify-center p-10 rounded-3xl border border-neutral-800 bg-neutral-900/40 text-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10 border border-amber-500/25 text-amber-400">
              <AlertCircle className="h-7 w-7" />
            </div>
            <h3 className="text-base font-bold text-white">هنوز دسترسی فعالی برای شما ثبت نشده است</h3>
            <p className="text-xs text-neutral-400 max-w-md leading-relaxed">
              نقش کاربری شما به «سایت‌گردان» تغییر یافته است اما ادمین اصلی هنوز مجوزی برای حساب شما انتخاب نکرده است. لطفاً با مدیر سیستم تماس بگیرید.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {Object.entries(groupedPermitted).map(([catKey, pages]) => {
              const catMeta = CATEGORY_INFO[catKey] || {
                label: catKey,
                icon: Layers,
                color: "text-purple-400",
                border: "border-purple-500/30",
                bg: "bg-purple-500/10",
              };
              const CatIcon = catMeta.icon;

              return (
                <div
                  key={catKey}
                  className="rounded-3xl border border-neutral-800/80 bg-neutral-900/40 p-4 sm:p-5 backdrop-blur-md flex flex-col gap-4 shadow-sm"
                >
                  {/* Category Title */}
                  <div className="flex items-center justify-between border-b border-neutral-800/80 pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className={`flex h-8 w-8 items-center justify-center rounded-xl border ${catMeta.bg} ${catMeta.border} ${catMeta.color}`}>
                        <CatIcon className="h-4 w-4" />
                      </div>
                      <span className="text-xs sm:text-sm font-bold text-white">
                        {catMeta.label}
                      </span>
                    </div>

                    <span className="text-[11px] font-mono text-neutral-400 bg-neutral-800 px-2.5 py-0.5 rounded-full">
                      {toPersianDigits(pages.length)} بخش مجاز
                    </span>
                  </div>

                  {/* Pages Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                    {pages.map((page) => {
                      const Icon = ICON_MAP[page.iconName] || Layers;

                      return (
                        <Link
                          key={page.id}
                          href={page.href}
                          className="group relative flex flex-col justify-between p-4 rounded-2xl border border-neutral-800 bg-neutral-900/80 hover:border-purple-500/50 hover:bg-neutral-900 transition-all shadow-sm hover:shadow-lg hover:shadow-purple-950/30 cursor-pointer"
                        >
                          <div className="flex flex-col gap-2.5 mb-4">
                            <div className="flex items-center justify-between">
                              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 group-hover:scale-110 transition-transform">
                                <Icon className="h-5 w-5" />
                              </div>

                              <span className="text-[10px] font-mono text-neutral-500" dir="ltr">
                                {page.href}
                              </span>
                            </div>

                            <span className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors">
                              {page.title}
                            </span>

                            <p className="text-[11px] text-neutral-400 leading-relaxed line-clamp-2">
                              {page.shortDescription}
                            </p>
                          </div>

                          <div className="flex items-center justify-between pt-3 border-t border-neutral-800/80 text-xs">
                            <span className="text-[10px] font-mono text-purple-400/80 bg-purple-500/10 px-2 py-0.5 rounded-md border border-purple-500/20" dir="ltr">
                              admin:{page.id}
                            </span>

                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-purple-400 group-hover:text-purple-300">
                              <span>ورود به بخش</span>
                              <ArrowRight className="h-3 w-3 rotate-180 transition-transform group-hover:-translate-x-1" />
                            </span>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. Transparency & Security Notice */}
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/30 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-neutral-400 leading-relaxed">
        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-neutral-800 text-neutral-400 border border-neutral-700">
            <Info className="h-4 w-4 text-purple-400" />
          </div>
          <div className="flex flex-col gap-1">
            <span className="font-bold text-white text-xs sm:text-sm">
              تفکیک وظایف و کنترل دسترسی نقشی (Principle of Least Privilege)
            </span>
            <span>
              در صورتی که برای انجام امور خود نیاز به دسترسی به بخش دیگری دارید، لطفاً با مدیر ارشد سیستم (SuperAdmin) تماس بگیرید تا مجوز صفحه مورد نظر را در جدول دسترسی‌های شما فعال نماید.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}