"use client";

import * as React from "react";
import Link from "next/link";
import {
  Building2,
  CreditCard,
  FileCheck2,
  TrendingDown,
  FileText,
  BadgePercent,
  CheckCircle2,
  Layers,
  ArrowLeft,
  Download,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "@/features/auth";
import { Button } from "@/shared/components/ui/button";
import { formatPrice, toPersianDigits } from "@/shared/lib/utils";

export default function PartnerDashboardPage() {
  const { user } = useAuth();

  const creditLimit = user?.creditLimit || 500_000_000;
  const creditBalance = user?.creditBalance || 320_000_000;
  const creditUsed = creditLimit - creditBalance;
  const creditPercent = Math.round((creditUsed / creditLimit) * 100);

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 flex flex-col gap-8" dir="rtl">
      {/* Top Banner: Corporate Identity */}
      <div className="relative overflow-hidden rounded-3xl border border-sky-500/30 bg-gradient-to-br from-sky-950/40 via-[var(--theme-surface)] to-[var(--theme-surface)] p-6 sm:p-8 backdrop-blur-xl shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-sky-500/20 text-sky-400 text-xl font-black ring-2 ring-sky-500/30 shadow-lg shadow-sky-500/20">
              <Building2 className="h-8 w-8" />
            </div>

            <div className="flex flex-col gap-1.5 text-right">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-xl sm:text-2xl font-black text-white">
                  {user?.companyName || "شرکت پیشگامان داده‌پردازی کهکشان"}
                </h1>
                <span className="text-xs text-sky-300 bg-sky-500/20 px-2.5 py-0.5 rounded-full border border-sky-500/30 font-semibold">
                  همکار رسمی طلایی (Tier A)
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs text-neutral-400 font-mono">
                <span>نماینده: {user?.name}</span>
                <span>شناسه ملی: {toPersianDigits(user?.nationalId || "14009876543")}</span>
                <span>کد اقتصادی: {toPersianDigits(user?.economicCode || "411589763214")}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/products">
              <Button className="bg-sky-600 hover:bg-sky-500 text-white gap-2 shadow-lg shadow-sky-600/25">
                <span>سفارش با تخفیف عمده</span>
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Financial Credit & Quick Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Credit Limit Widget */}
        <div className="md:col-span-2 rounded-3xl border border-[var(--theme-border-color)] bg-[var(--theme-surface)] p-6 shadow-sm flex flex-col justify-between gap-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-sky-400" />
                <h2 className="text-base font-bold text-white">
                  وضعیت اعتبار خرید سازمانی (چک صیادی و تضامین)
                </h2>
              </div>
              <span className="text-xs text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20 font-medium">
                اعتبار تایید شده
              </span>
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed">
              سقف اعتبار مصوب برای خرید تجهیزات پسیو و اکتیو به صورت تسویه ۴۵ روزه با چک صیادی.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800">
            <div>
              <span className="text-[11px] text-neutral-400 block mb-1">کل سقف اعتبار:</span>
              <span className="text-base font-black font-mono text-white">
                {formatPrice(creditLimit)}
              </span>
            </div>

            <div>
              <span className="text-[11px] text-neutral-400 block mb-1">اعتبار در دسترس فعلی:</span>
              <span className="text-base font-black font-mono text-emerald-400">
                {formatPrice(creditBalance)}
              </span>
            </div>

            <div>
              <span className="text-[11px] text-neutral-400 block mb-1">میزان استفاده شده:</span>
              <span className="text-base font-black font-mono text-neutral-300">
                {formatPrice(creditUsed)}
              </span>
            </div>
          </div>

          {/* Credit Bar */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between text-xs text-neutral-400">
              <span>میزان مصرف اعتبار: {toPersianDigits(creditPercent)}٪</span>
              <span>باقیمانده: {toPersianDigits(100 - creditPercent)}٪</span>
            </div>
            <div className="h-2.5 w-full rounded-full bg-neutral-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-l from-sky-500 to-cyan-400 rounded-full"
                style={{ width: `${creditPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Wholesale Tier Discount Badge */}
        <div className="rounded-3xl border border-[var(--theme-border-color)] bg-[var(--theme-surface)] p-6 shadow-sm flex flex-col justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <BadgePercent className="h-5 w-5 text-amber-400" />
              <h3 className="text-base font-bold text-white">نرخ تخفیف سازمانی</h3>
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed">
              تخفیفات همکاری به صورت خودکار روی تمامی پیش‌فاکتورها و سبد خرید اعمال می‌شود:
            </p>
          </div>

          <div className="flex flex-col gap-2.5">
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-900/60 border border-neutral-800 text-xs">
              <span className="text-neutral-300 font-medium">تجهیزات پسیو (کابل و رک)</span>
              <span className="font-bold font-mono text-emerald-400">۲۲٪ تخفیف</span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-900/60 border border-neutral-800 text-xs">
              <span className="text-neutral-300 font-medium">سوئیچ و روتر سیسکو</span>
              <span className="font-bold font-mono text-emerald-400">۱۴٪ تخفیف</span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-900/60 border border-neutral-800 text-xs">
              <span className="text-neutral-300 font-medium">ماژول‌های نوری SFP / SFP+</span>
              <span className="font-bold font-mono text-emerald-400">۱۸٪ تخفیف</span>
            </div>
          </div>

          <div className="pt-2 border-t border-neutral-800 flex items-center justify-between text-xs text-neutral-400">
            <span>محاسبه مالیات بر ارزش افزوده:</span>
            <span className="text-neutral-200 font-bold">۱۰٪ ارزش افزوده رسمی</span>
          </div>
        </div>
      </div>

      {/* Official Tax Invoices & Project Quotes */}
      <div className="rounded-3xl border border-[var(--theme-border-color)] bg-[var(--theme-surface)] p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <FileCheck2 className="h-5 w-5 text-sky-400" />
              <h2 className="text-lg font-bold text-white">
                فاکتورهای رسمی و پیش‌فاکتورهای سامانه مودیان
              </h2>
            </div>
            <p className="text-xs text-neutral-400 mt-1">
              تمامی فاکتورها منطبق بر سامانه مودیان مالیاتی و همراه با شناسه یکتا صادر می‌گردند.
            </p>
          </div>

          <button
            type="button"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 border border-sky-500/30 text-xs font-semibold transition-colors cursor-pointer"
          >
            <FileText className="h-4 w-4" />
            <span>صدور استعلام قیمت پروژه (RFQ)</span>
          </button>
        </div>

        {/* Invoice Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="border-b border-neutral-800 text-neutral-400">
                <th className="pb-3 pr-2 font-medium">شماره فاکتور</th>
                <th className="pb-3 font-medium">پروژه / شرح خرید</th>
                <th className="pb-3 font-medium">شناسه مالیاتی سامانه مودیان</th>
                <th className="pb-3 font-medium">مبلغ کل (با ارزش افزوده)</th>
                <th className="pb-3 font-medium">وضعیت تسویه</th>
                <th className="pb-3 pl-2 text-left font-medium">دانلود نسخه رسمی</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60">
              <tr className="hover:bg-neutral-900/30 transition-colors">
                <td className="py-4 pr-2 font-mono font-bold text-white">INV-1402-0941</td>
                <td className="py-4 text-neutral-200">
                  تجهیز دیتاسنتر فاز ۲ — ۴ عدد سوئیچ 3850 و کابل Cat7
                </td>
                <td className="py-4 font-mono text-[11px] text-neutral-400">
                  A239-8812-4019-B2
                </td>
                <td className="py-4 font-mono font-bold text-white">
                  {formatPrice(342000000)}
                </td>
                <td className="py-4">
                  <span className="text-[11px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    تسویه شده (چک صیادی)
                  </span>
                </td>
                <td className="py-4 pl-2 text-left">
                  <button
                    type="button"
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 transition-colors cursor-pointer text-[11px]"
                  >
                    <Download className="h-3 w-3" />
                    <span>PDF رسمی</span>
                  </button>
                </td>
              </tr>

              <tr className="hover:bg-neutral-900/30 transition-colors">
                <td className="py-4 pr-2 font-mono font-bold text-white">INV-1402-1088</td>
                <td className="py-4 text-neutral-200">
                  پسیو ساختمان مرکزی — ۲۰ رول کابل Cat6 SFTP نگزنس
                </td>
                <td className="py-4 font-mono text-[11px] text-neutral-400">
                  A239-9941-5501-C9
                </td>
                <td className="py-4 font-mono font-bold text-white">
                  {formatPrice(128000000)}
                </td>
                <td className="py-4">
                  <span className="text-[11px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                    سررسید چک: ۱۰ روز دیگر
                  </span>
                </td>
                <td className="py-4 pl-2 text-left">
                  <button
                    type="button"
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 transition-colors cursor-pointer text-[11px]"
                  >
                    <Download className="h-3 w-3" />
                    <span>PDF رسمی</span>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
