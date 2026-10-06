"use client";

import * as React from "react";
import Link from "next/link";
import {
  Wrench,
  ShieldCheck,
  Zap,
  Clock,
  CheckCircle2,
  Calculator,
  Search,
  ArrowDown,
  Building2,
  Cpu,
  Layers,
  PhoneCall,
} from "lucide-react";
import { Container } from "@/shared/components/ui/container";

interface InstallationHeroProps {
  onScrollToForm: () => void;
  onScrollToCalculator: () => void;
  onScrollToTracker: () => void;
}

export function InstallationHero({
  onScrollToForm,
  onScrollToCalculator,
  onScrollToTracker,
}: InstallationHeroProps) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-neutral-800/90 bg-[#111114]/95 p-6 sm:p-10 lg:p-12 shadow-2xl backdrop-blur-xl mb-12">
      {/* Background ambient lighting */}
      <div
        className="pointer-events-none absolute -top-24 -right-24 h-96 w-96 rounded-full blur-3xl opacity-30"
        style={{
          background: "radial-gradient(circle, #ea580c 0%, rgba(234,88,12,0) 70%)",
        }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-24 -left-24 h-96 w-96 rounded-full blur-3xl opacity-20"
        style={{
          background: "radial-gradient(circle, #10b981 0%, rgba(16,185,129,0) 70%)",
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Right column: Heading & Actions */}
        <div className="lg:col-span-7 flex flex-col gap-5 text-right">
          {/* Eyebrow badge */}
          <div className="inline-flex items-center gap-2 self-start rounded-full border border-orange-500/30 bg-orange-500/10 px-3 py-1 text-xs font-semibold text-orange-400 max-w-full">
            <span className="flex h-2 w-2 shrink-0 rounded-full bg-orange-500 animate-pulse" />
            <span className="truncate whitespace-nowrap">خدمات تخصصی پسیو و اکتیو شبکه سازمانی</span>
          </div>

          <h1 className="text-xl sm:text-3xl lg:text-5xl font-black text-white leading-[1.35] tracking-tight">
            درخواست نصب، کابل‌کشی و راه‌اندازی مهندسی شبکه
          </h1>

          <p className="text-xs sm:text-base text-neutral-300 leading-relaxed max-w-2xl">
            پیاده‌سازی صفر تا صد زیرساخت شبکه، دیتاسنتر، فیبر نوری، دوربین مداربسته و امنیت شبکه با
            تیم مهندسان دارای گواهینامه معتبر، <strong className="text-orange-400 font-bold">تست ۱۰۰٪ با دستگاه فلوک (Fluke)</strong> و ارائه ۱۸ ماه ضمانت‌نامه مکتوب کارکرد بدون نقص.
          </p>

          {/* Quick metric chips */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5 pt-2">
            {[
              { label: "پروژه موفق سازمانی", val: "+۸۵۰", icon: Building2, color: "text-orange-400" },
              { label: "تست تضمینی با فلوک", val: "۱۰۰٪", icon: ShieldCheck, color: "text-emerald-400" },
              { label: "گارانتی کتبی اتصالات", val: "۱۸ ماه", icon: Zap, color: "text-amber-400" },
              { label: "اعزام کارشناس ارشد", val: "< ۲۴ ساعت", icon: Clock, color: "text-sky-400" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="flex flex-col gap-1 rounded-2xl border border-neutral-800/80 bg-neutral-900/60 p-2.5 sm:p-3 shadow-inner min-w-0"
              >
                <div className="flex items-center gap-1.5">
                  <stat.icon className={`h-4 w-4 shrink-0 ${stat.color}`} />
                  <span className={`text-sm sm:text-lg font-black font-mono whitespace-nowrap ${stat.color}`}>
                    {stat.val}
                  </span>
                </div>
                <span className="text-[10px] sm:text-[11px] text-neutral-400 font-medium truncate whitespace-nowrap">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-3">
            <button
              type="button"
              onClick={onScrollToForm}
              className="flex items-center gap-2 rounded-xl bg-[var(--theme-primary)] hover:opacity-90 active:scale-95 text-white px-5 py-3 text-xs sm:text-sm font-bold shadow-lg shadow-[var(--theme-primary)]/25 transition-all cursor-pointer"
            >
              <Wrench className="h-4 w-4" />
              <span>ثبت آنلاین درخواست نصب</span>
              <ArrowDown className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={onScrollToCalculator}
              className="flex items-center gap-2 rounded-xl border border-neutral-700 bg-neutral-800/80 hover:bg-neutral-800 active:scale-95 text-neutral-200 hover:text-white px-4 py-3 text-xs sm:text-sm font-semibold transition-all cursor-pointer"
            >
              <Calculator className="h-4 w-4 text-orange-400" />
              <span>محاسبه‌گر آنلاین هزینه و زمان</span>
            </button>

            <button
              type="button"
              onClick={onScrollToTracker}
              className="flex items-center gap-2 rounded-xl border border-neutral-800 bg-neutral-900/40 hover:bg-neutral-800/70 text-neutral-300 px-3.5 py-3 text-xs sm:text-sm font-medium transition-colors cursor-pointer"
            >
              <Search className="h-3.5 w-3.5 text-sky-400" />
              <span>پیگیری وضعیت درخواست</span>
            </button>
          </div>
        </div>

        {/* Left column: Live SLA & Guarantee Card */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="relative rounded-2xl border border-neutral-800/90 bg-gradient-to-b from-neutral-900/90 to-neutral-950 p-5 sm:p-6 shadow-xl overflow-hidden">
            {/* Corner highlight */}
            <div className="absolute top-0 left-0 w-24 h-24 bg-orange-500/10 rounded-br-full blur-xl pointer-events-none" />

            <div className="flex items-center justify-between border-b border-neutral-800/80 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-ping" />
                <span className="text-xs font-bold text-white">تعهدات و استانداردهای اجرایی</span>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md">
                SLA VERIFIED
              </span>
            </div>

            <ul className="space-y-3 text-xs text-neutral-300">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong>تست فلوک ۱۰۰٪ کلیه خطوط:</strong> ارائه فایل خروجی گرافیکی PDF با تستر Fluke DSX-8000
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong>بازدید و متره‌کشی رایگان:</strong> اعزام کارشناس ارشد پروژه به محل در شهر تهران
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong>عدم توقف در ساعات اداری:</strong> قابلیت اجرای پروژه‌ها در روزهای تعطیل و شیفت شب
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong>ارائه نقشه As-Built و لیبل‌گذاری:</strong> تحویل نقشه نهایی اتوکد و کدهای استاندارد TIA-606
                </span>
              </li>
            </ul>

            <div className="mt-5 pt-4 border-t border-neutral-800/80 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-neutral-400">
                <PhoneCall className="h-3.5 w-3.5 text-orange-400" />
                <span>مشاوره تلفنی مستقیم:</span>
              </div>
              <a
                href="tel:09134761097"
                className="font-mono text-orange-400 hover:text-orange-300 font-bold transition-colors"
                dir="ltr"
              >
                ۰۲۱ - ۸۸۸۸ ۸۸۸۸ (داخلی ۱۰۴)
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
