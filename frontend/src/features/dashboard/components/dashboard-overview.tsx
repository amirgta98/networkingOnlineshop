"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { AuthUser } from "@/features/auth";
import type { DashboardPageDefinition, DashboardPageKey } from "../types/dashboard.types";
import { DashboardTierPerks } from "./dashboard-tier-perks";
import {
  Package,
  Wallet,
  Award,
  Headphones,
  CheckCircle2,
  Clock,
  MapPin,
  ShieldCheck,
  KeyRound,
  ExternalLink,
  ChevronLeft,
  LayoutGrid,
  Building,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { formatPrice, toPersianDigits } from "@/shared/lib/utils";

interface DashboardOverviewProps {
  user: AuthUser | null;
  pages: DashboardPageDefinition[];
  onSelectPage?: (key: DashboardPageKey) => void;
  twoFactorActive: boolean;
  onToggle2FA: () => Promise<void>;
  isUpdating2FA: boolean;
  toastMsg: string | null;
}

export function DashboardOverview({
  user,
  pages,
  onSelectPage,
  twoFactorActive,
  onToggle2FA,
  isUpdating2FA,
  toastMsg,
}: DashboardOverviewProps) {
  const router = useRouter();
  const handleSelectPage = (key: DashboardPageKey) => {
    if (onSelectPage) {
      onSelectPage(key);
    } else {
      router.push(key === "overview" ? "/dashboard" : `/dashboard/${key}`);
    }
  };

  const isPartner = user?.role === "partner";

  // Filter out overview itself from the pages grid
  const subPages = pages.filter((p) => p.id !== "overview");

  return (
    <div className="flex flex-col gap-8 text-right" dir="rtl">
      {/* ─── Top 4 Metric Chips ────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Metric 1: Orders */}
        <button
          type="button"
          onClick={() => handleSelectPage("orders")}
          className="group flex flex-col justify-between p-3.5 sm:p-5 rounded-2xl border border-[var(--theme-border-color)] bg-[var(--theme-surface)] hover:border-orange-500/40 transition-all text-right cursor-pointer shadow-sm hover:shadow-md"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] sm:text-xs text-neutral-400 font-medium">سفارش‌های در جریان</span>
            <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20 group-hover:scale-110 transition-transform shrink-0">
              <Package className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </div>
          </div>
          <div className="text-base sm:text-lg lg:text-xl font-black font-mono text-[var(--theme-foreground)] break-words leading-tight">
            {toPersianDigits("2")} <span className="text-[11px] sm:text-xs font-normal text-neutral-400">سفارش</span>
          </div>
          <span className="text-[11px] text-orange-400 mt-2 font-medium flex items-center gap-1">
            <span>رهگیری مرسوله</span>
            <ChevronLeft className="h-3 w-3" />
          </span>
        </button>

        {/* Metric 2: Wallet / Credit */}
        <button
          type="button"
          onClick={() => handleSelectPage(isPartner ? "partner-credit" : "wallet")}
          className="group flex flex-col justify-between p-3.5 sm:p-5 rounded-2xl border border-[var(--theme-border-color)] bg-[var(--theme-surface)] hover:border-emerald-500/40 transition-all text-right cursor-pointer shadow-sm hover:shadow-md"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] sm:text-xs text-neutral-400 font-medium">
              {isPartner ? "اعتبار خرید سازمانی" : "موجودی کیف پول"}
            </span>
            <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 group-hover:scale-110 transition-transform shrink-0">
              <Wallet className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </div>
          </div>
          <div className="text-sm sm:text-lg lg:text-xl font-black font-mono text-[var(--theme-foreground)] break-words leading-tight">
            {isPartner ? formatPrice(320_000_000) : formatPrice(2_450_000)}{" "}
            <span className="text-[10px] sm:text-xs font-normal text-neutral-400">تومان</span>
          </div>
          <span className="text-[11px] text-emerald-400 mt-2 font-medium flex items-center gap-1">
            <span>{isPartner ? "سقف ۵۰۰ م.ت مصوب" : "شارژ سریع حساب"}</span>
            <ChevronLeft className="h-3 w-3" />
          </span>
        </button>

        {/* Metric 3: Loyalty Club / B2B Discount */}
        <button
          type="button"
          onClick={() => handleSelectPage(isPartner ? "partner-catalog" : "club")}
          className="group flex flex-col justify-between p-3.5 sm:p-5 rounded-2xl border border-[var(--theme-border-color)] bg-[var(--theme-surface)] hover:border-sky-500/40 transition-all text-right cursor-pointer shadow-sm hover:shadow-md"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] sm:text-xs text-neutral-400 font-medium">
              {isPartner ? "تخفیف ویژه همکاران" : "باشگاه مشتریان"}
            </span>
            <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20 group-hover:scale-110 transition-transform shrink-0">
              <Award className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </div>
          </div>
          <div className="text-base sm:text-lg lg:text-xl font-black font-mono text-[var(--theme-foreground)] break-words leading-tight">
            {isPartner ? "۱۸٪ تخفیف B2B" : `${toPersianDigits("480")} امتیاز`}
          </div>
          <span className="text-[11px] text-sky-400 mt-2 font-medium flex items-center gap-1">
            <span>{isPartner ? "مشاهده لیست قیمت" : "تبدیل به ووچر تخفیف"}</span>
            <ChevronLeft className="h-3 w-3" />
          </span>
        </button>

        {/* Metric 4: Support Tickets */}
        <button
          type="button"
          onClick={() => handleSelectPage("support")}
          className="group flex flex-col justify-between p-3.5 sm:p-5 rounded-2xl border border-[var(--theme-border-color)] bg-[var(--theme-surface)] hover:border-purple-500/40 transition-all text-right cursor-pointer shadow-sm hover:shadow-md"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] sm:text-xs text-neutral-400 font-medium">تیکت‌های مهندسی</span>
            <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 group-hover:scale-110 transition-transform shrink-0">
              <Headphones className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </div>
          </div>
          <div className="text-base sm:text-lg lg:text-xl font-black font-mono text-[var(--theme-foreground)] break-words leading-tight">
            {toPersianDigits("1")} <span className="text-[11px] sm:text-xs font-normal text-neutral-400">تیکت فعال</span>
          </div>
          <span className="text-[11px] text-purple-400 mt-2 font-medium flex items-center gap-1">
            <span>مشاوره تخصصی آنلاین</span>
            <ChevronLeft className="h-3 w-3" />
          </span>
        </button>
      </div>

      {/* ─── Current User Level & Active Perks Banner ───────────────── */}
      <DashboardTierPerks user={user} onNavigatePage={handleSelectPage} />

      {/* ─── Catalog of All Pages Available For This Role ────────────── */}
      <div className="rounded-3xl border border-[var(--theme-border-color)] bg-[var(--theme-surface)] p-4 sm:p-7 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 sm:mb-6 border-b border-[var(--theme-border-color)] pb-3 sm:pb-4">
          <div className="flex items-center gap-2.5">
            <LayoutGrid className="h-5 w-5 text-orange-400 shrink-0" />
            <h2 className="text-sm sm:text-base font-bold text-[var(--theme-foreground)]">
              تمامی گزینه‌ها و صفحات حساب شما (بر اساس سطح کاربری فعلی)
            </h2>
          </div>
          <span className="text-xs text-neutral-400">
            برای مشاهده جزییات و برنامه توسعه هر بخش، روی آن کلیک کنید
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {subPages.map((page) => (
            <button
              key={page.id}
              type="button"
              onClick={() => handleSelectPage(page.id)}
              className="group flex flex-col justify-between p-3.5 sm:p-4 rounded-2xl border border-neutral-800/80 bg-neutral-900/40 hover:border-neutral-700 hover:bg-neutral-900/80 transition-all text-right cursor-pointer"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-neutral-200 group-hover:text-orange-400 transition-colors">
                    {page.title}
                  </span>
                  {page.badge && (
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-300 border border-neutral-700 shrink-0">
                      {page.badge}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-neutral-400 leading-relaxed line-clamp-2">
                  {page.shortDescription}
                </p>
              </div>

              <div className="mt-3 flex items-center justify-between pt-2 border-t border-neutral-800/60 text-[10px] text-neutral-500">
                <span>دسته‌بندی: {page.categoryLabel}</span>
                <span className="text-orange-400 group-hover:translate-x-[-3px] transition-transform flex items-center gap-0.5 font-semibold">
                  مشاهده
                  <ChevronLeft className="h-3 w-3" />
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ─── Two-Column Grid: Orders, Addresses & Security ─────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Left 2 Cols: Orders & Addresses */}
        <div className="lg:col-span-2 flex flex-col gap-4 sm:gap-6">
          {/* Recent Orders Card */}
          <div className="rounded-3xl border border-[var(--theme-border-color)] bg-[var(--theme-surface)] p-4 sm:p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 sm:mb-5">
              <div className="flex items-center gap-2.5">
                <Package className="h-5 w-5 text-orange-400 shrink-0" />
                <h2 className="text-sm sm:text-base font-bold text-[var(--theme-foreground)]">
                  سفارش‌های اخیر شما
                </h2>
              </div>
              <button
                type="button"
                onClick={() => handleSelectPage("orders")}
                className="text-xs text-[var(--theme-primary)] hover:underline font-semibold cursor-pointer self-start sm:self-auto"
              >
                مشاهده همه سفارش‌ها ←
              </button>
            </div>

            <div className="flex flex-col gap-3">
              {/* Order 1 */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 sm:p-4 rounded-2xl border border-neutral-800/80 bg-neutral-900/40 hover:border-neutral-700 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5" />
                  </div>
                  <div className="flex flex-col text-right">
                    <span className="text-xs font-bold text-neutral-100 leading-snug">
                      سوئیچ سیسکو ۲۴ پورت مدل WS-C2960X-24TS-L
                    </span>
                    <span className="text-[11px] text-neutral-400 mt-1 leading-relaxed">
                      کد رهگیری: VLX-88219 • تاریخ: {toPersianDigits("1402/11/04")}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 border-t sm:border-t-0 pt-2 sm:pt-0 border-neutral-800">
                  <span className="text-xs font-mono font-bold text-neutral-200">
                    {formatPrice(48500000)} تومان
                  </span>
                  <span className="text-[11px] font-medium text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-lg border border-emerald-500/20">
                    تحویل شده
                  </span>
                </div>
              </div>

              {/* Order 2 */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 sm:p-4 rounded-2xl border border-neutral-800/80 bg-neutral-900/40 hover:border-neutral-700 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20">
                    <Clock className="h-4 w-4 sm:h-5 sm:w-5" />
                  </div>
                  <div className="flex flex-col text-right">
                    <span className="text-xs font-bold text-neutral-100 leading-snug">
                      پچ پنل ۲۴ پورت لگراند Cat6 UTP به همراه ماژول SFP+
                    </span>
                    <span className="text-[11px] text-neutral-400 mt-1 leading-relaxed">
                      کد رهگیری: VLX-91402 • تاریخ: {toPersianDigits("1402/11/12")}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 border-t sm:border-t-0 pt-2 sm:pt-0 border-neutral-800">
                  <span className="text-xs font-mono font-bold text-neutral-200">
                    {formatPrice(6200000)} تومان
                  </span>
                  <span className="text-[11px] font-medium text-orange-400 bg-orange-500/10 px-2.5 py-0.5 rounded-lg border border-orange-500/20">
                    در حال پردازش
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Delivery Addresses */}
          <div className="rounded-3xl border border-[var(--theme-border-color)] bg-[var(--theme-surface)] p-4 sm:p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <div className="flex items-center gap-2.5">
                <MapPin className="h-5 w-5 text-sky-400 shrink-0" />
                <h2 className="text-sm sm:text-base font-bold text-[var(--theme-foreground)]">
                  آدرس‌های تحویل سفارش
                </h2>
              </div>
              <button
                type="button"
                onClick={() => handleSelectPage("addresses")}
                className="text-xs text-[var(--theme-primary)] hover:underline font-semibold cursor-pointer self-start sm:self-auto"
              >
                + افزودن آدرس جدید
              </button>
            </div>

            <div className="p-3.5 sm:p-4 rounded-2xl border border-neutral-800/80 bg-neutral-900/40 text-right">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-neutral-200">
                  دفتر مرکزی و انبار پروژه (تهران)
                </span>
                <span className="text-[10px] text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20">
                  پیش‌فرض
                </span>
              </div>
              <p className="text-xs text-neutral-400 leading-relaxed">
                تهران، خیابان ولیعصر، بالاتر از میدان ونک، برج نگار، طبقه ۸، واحد ۳
              </p>
              <span className="text-[11px] text-neutral-500 font-mono mt-1 block">
                کد پستی: ۱۹۶۹۷۶۴۵۳۱
              </span>
            </div>
          </div>
        </div>

        {/* Right Col: 2FA Security & Portal Switcher */}
        <div className="flex flex-col gap-4 sm:gap-6">
          {/* 2FA Security Card */}
          <div className="rounded-3xl border border-amber-500/30 bg-gradient-to-b from-amber-500/10 via-[var(--theme-surface)] to-[var(--theme-surface)] p-4 sm:p-6 shadow-sm text-right">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 shrink-0">
                  <KeyRound className="h-4 w-4" />
                </span>
                <h3 className="text-sm font-bold text-[var(--theme-foreground)]">
                  امنیت و تایید دو مرحله‌ای (۲FA)
                </h3>
              </div>

              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  twoFactorActive
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    : "bg-neutral-800 text-neutral-400"
                }`}
              >
                {twoFactorActive ? "فعال" : "غیرفعال"}
              </span>
            </div>

            <p className="text-xs text-neutral-300 leading-relaxed mb-4">
              با فعال‌سازی تایید دو مرحله‌ای، علاوه بر کد پیامک ۵ رقمی، رمز امنیتی دوم نیز در لایه مخصوص درخواست می‌شود تا حساب تجهیزات شبکه شما کاملاً ایمن باشد.
            </p>

            {toastMsg && (
              <div className="mb-3 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 leading-relaxed">
                {toastMsg}
              </div>
            )}

            <div className="flex flex-col gap-2 pt-2 border-t border-neutral-800">
              <Button
                variant={twoFactorActive ? "outline" : "default"}
                onClick={onToggle2FA}
                isLoading={isUpdating2FA}
                className="w-full text-xs font-semibold gap-2 cursor-pointer justify-center"
              >
                <ShieldCheck className="h-4 w-4" />
                <span>
                  {twoFactorActive
                    ? "غیرفعال‌سازی تایید دو مرحله‌ای"
                    : "فعال‌سازی لایه تایید دو مرحله‌ای"}
                </span>
              </Button>
            </div>
          </div>

          {/* Quick Portal Switcher (For Partner or Admin) */}
          <div className="rounded-3xl border border-[var(--theme-border-color)] bg-[var(--theme-surface)] p-4 sm:p-6 shadow-sm text-right">
            <h3 className="text-xs font-bold text-neutral-300 mb-2">
              لایه‌های دسترسی تکمیلی سامانه:
            </h3>
            <p className="text-[11px] text-neutral-400 mb-3 leading-relaxed">
              سامانه دارای معماری تفکیک‌شده برای همکاران B2B و مدیران کل است:
            </p>

            <div className="flex flex-col gap-2">
              <Link
                href="/partner"
                className="flex items-center justify-between p-3 rounded-xl border border-neutral-800 bg-neutral-900/60 hover:border-sky-500/40 text-xs font-semibold text-neutral-200 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <Building className="h-4 w-4 text-sky-400" />
                  <span>پرتال سازمانی / همکار B2B</span>
                </span>
                <ExternalLink className="h-3 w-3 text-neutral-500" />
              </Link>

              <Link
                href="/admin"
                className="flex items-center justify-between p-3 rounded-xl border border-neutral-800 bg-neutral-900/60 hover:border-emerald-500/40 text-xs font-semibold text-neutral-200 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-400" />
                  <span>پنل ادمین و صاحب سایت</span>
                </span>
                <ExternalLink className="h-3 w-3 text-neutral-500" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
