"use client";

import * as React from "react";
import {
  Globe2,
  CheckCircle2,
  Server,
  Zap,
  Building2,
  Clock,
  ArrowDown,
  Sparkles,
  PhoneCall,
  Lock,
} from "lucide-react";
import { toPersianDigits } from "@/shared/lib/utils";

interface InternetHeroProps {
  onScrollToPlans: () => void;
  onScrollToStaticIp: () => void;
  onScrollToOrderForm: () => void;
}

export function InternetHero({
  onScrollToPlans,
  onScrollToStaticIp,
  onScrollToOrderForm,
}: InternetHeroProps) {
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
          background: "radial-gradient(circle, #0284c7 0%, rgba(2,132,199,0) 70%)",
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Right column: Heading & Actions */}
        <div className="lg:col-span-7 flex flex-col gap-5 text-right">
          {/* Eyebrow badge */}
          <div className="inline-flex items-center gap-2 self-start rounded-full border border-sky-500/30 bg-sky-500/10 px-3 py-1 text-xs font-semibold text-sky-400 max-w-full">
            <span className="flex h-2 w-2 shrink-0 rounded-full bg-sky-500 animate-pulse" />
            <span className="truncate whitespace-nowrap">اینترنت پرسرعت سازمانی و IP استاتیک اختصاصی</span>
          </div>

          <h1 className="text-xl sm:text-3xl lg:text-5xl font-black text-white leading-[1.35] tracking-tight">
            خرید آنلاین اینترنت پرسرعت و تخصیص IP استاتیک سازمانی
          </h1>

          <p className="text-xs sm:text-base text-neutral-300 leading-relaxed max-w-2xl">
            سرویس‌های فیبر نوری اختصاصی (FTTH)، پهنای باند وایرلس متقارن، VDSL و TD-LTE با بالاترین پایداری،
            پینگ تک‌رقمی و <strong className="text-sky-400 font-bold">بسته‌های رسمی IP استاتیک (Static IP)</strong> برای
            انتقال تصویر دوربین‌ها، برقراری امنیت شبکه، تونل‌های VPN و صدور فاکتور مودیان.
          </p>

          {/* Quick metric chips */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5 pt-2">
            {[
              { label: "پایداری اتصال (SLA)", val: "۹۹.۹٪", icon: Zap, color: "text-emerald-400" },
              { label: "تخصیص آی‌پی استاتیک", val: "رسمی /۳۰", icon: Server, color: "text-sky-400" },
              { label: "حداکثر سرعت فیبر", val: "۱ گیگابیت", icon: Globe2, color: "text-orange-400" },
              { label: "پشتیبانی فنی NOC", val: "۲۴ ساعته", icon: Clock, color: "text-purple-400" },
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
              onClick={onScrollToPlans}
              className="flex items-center gap-2 rounded-xl bg-[var(--theme-primary)] hover:opacity-90 active:scale-95 text-white px-5 py-3 text-xs sm:text-sm font-bold shadow-lg shadow-[var(--theme-primary)]/25 transition-all cursor-pointer"
            >
              <Globe2 className="h-4 w-4" />
              <span>مشاهده و انتخاب پلن‌های اینترنت</span>
            </button>

            <button
              type="button"
              onClick={onScrollToStaticIp}
              className="flex items-center gap-2 rounded-xl border border-sky-500/40 bg-sky-950/30 hover:bg-sky-900/40 text-sky-300 px-5 py-3 text-xs sm:text-sm font-bold transition-all cursor-pointer"
            >
              <Server className="h-4 w-4 text-sky-400" />
              <span>بسته‌های IP استاتیک اختصاصی</span>
            </button>

            <button
              type="button"
              onClick={onScrollToOrderForm}
              className="flex items-center gap-2 rounded-xl border border-neutral-700 bg-neutral-800/80 hover:bg-neutral-800 text-neutral-200 px-4 py-3 text-xs sm:text-sm font-medium transition-colors cursor-pointer"
            >
              <ArrowDown className="h-4 w-4 text-neutral-400" />
              <span>ثبت سفارش و فعال‌سازی</span>
            </button>
          </div>
        </div>

        {/* Left column: Visual summary card */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center">
          <div className="w-full max-w-sm rounded-2xl border border-neutral-800 bg-gradient-to-b from-neutral-900/90 to-neutral-950 p-5 sm:p-6 shadow-xl relative overflow-hidden text-right">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
              <div className="flex items-center gap-2.5">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/30">
                  <Globe2 className="h-5 w-5" />
                </span>
                <div>
                  <h2 className="text-sm font-bold text-white">پکیج ویژه اتصال سازمانی</h2>
                  <p className="text-[11px] text-neutral-400">اینترنت گیگابیتی + IP ثابت</p>
                </div>
              </div>
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full border border-emerald-500/20">
                پیشنهاد برتر
              </span>
            </div>

            <div className="py-4 space-y-2.5 text-xs text-neutral-300">
              <div className="flex items-center justify-between py-1 border-b border-neutral-800/50">
                <span className="text-neutral-400">تکنولوژی اتصال:</span>
                <span className="font-semibold text-white">فیبر نوری FTTH / رادیو وایرلس</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-neutral-800/50">
                <span className="text-neutral-400">آی‌پی استاتیک:</span>
                <span className="font-semibold text-sky-400">۱ الی ۱۶ آی‌پی رسمی RIPE</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-neutral-800/50">
                <span className="text-neutral-400">میانگین پینگ:</span>
                <span className="font-semibold text-emerald-400 font-mono">۴ الی ۱۲ میلی‌ثانیه</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-neutral-800/50">
                <span className="text-neutral-400">فاکتور رسمی:</span>
                <span className="font-semibold text-white">دارای ارزش افزوده و کد مودیان</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-neutral-400">پشتیبانی:</span>
                <span className="font-semibold text-orange-400">تیم کشیک NOC بیست و چهار ساعته</span>
              </div>
            </div>

            <div className="pt-3 border-t border-neutral-800 flex items-center justify-between">
              <span className="text-[11px] text-neutral-400">مشاوره سازمانی فوری:</span>
              <a
                href="tel:09134761097"
                className="flex items-center gap-1.5 text-xs font-bold text-orange-400 hover:text-orange-300 font-mono"
                dir="ltr"
              >
                <PhoneCall className="h-3.5 w-3.5" />
                <span>۰۹۱۳۴۷۶۱۰۹۷</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
