"use client";

import * as React from "react";
import {
  Globe2,
  Check,
  Zap,
  Wifi,
  Sparkles,
  ArrowDownLeft,
  Moon,
  Wallet,
  Loader2,
} from "lucide-react";
import { InternetPlan, BillingCycle } from "../types";
import { formatPrice, toPersianDigits } from "@/shared/lib/utils";

interface InternetPlansGridProps {
  plans?: InternetPlan[];
  isLoading?: boolean;
  selectedPlanId: string;
  billingCycle: BillingCycle;
  onSelectPlan: (planId: string) => void;
  onSelectBillingCycle: (cycle: BillingCycle) => void;
  onApplyPlanToForm: (planId: string) => void;
  isPartner?: boolean;
  commissionAmount?: number;
}

export function InternetPlansGrid({
  plans: propPlans = [],
  isLoading = false,
  selectedPlanId,
  billingCycle,
  onSelectPlan,
  onSelectBillingCycle,
  onApplyPlanToForm,
  isPartner,
  commissionAmount = 400000,
}: InternetPlansGridProps) {
  const displayPlans = propPlans;

  const cycleMonths =
    billingCycle === "12_months"
      ? 12
      : billingCycle === "6_months"
      ? 6
      : billingCycle === "3_months"
      ? 3
      : 1;

  const cycleLabel =
    billingCycle === "12_months"
      ? "۱ ساله (۲۰٪ تخفیف)"
      : billingCycle === "6_months"
      ? "۶ ماهه"
      : billingCycle === "3_months"
      ? "۳ ماهه"
      : "۱ ماهه";

  return (
    <section id="internet-plans-section" className="scroll-mt-24 space-y-6" dir="rtl">
      {/* Header & Billing Cycle Switcher */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 text-right">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-400">
              <Globe2 className="h-4 w-4" />
              <span>پلن‌های اتصال پایدار</span>
            </div>
            {isPartner && (
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-300 bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
                <Sparkles className="h-3 w-3 text-emerald-400" />
                <span>تعرفه اختصاصی و پورسانت همکاران B2B</span>
              </span>
            )}
          </div>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-white">
            تعرفه پلن‌های اینترنت سازمانی و پهنای باند اختصاصی
          </h2>
          <p className="text-xs sm:text-sm text-neutral-400 max-w-2xl leading-relaxed">
            پوشش سراسری فیبر نوری (FTTH)، دکل‌های رادیویی متقارن، VDSL اداری و بسته‌های TD-LTE با SLA طلایی ۹۹.۹٪.
          </p>
        </div>

        {/* Duration cycle selector pills */}
        <div className="inline-flex items-center p-1 rounded-2xl border border-neutral-800 bg-neutral-900/80 self-start md:self-auto shrink-0 shadow-lg">
          {(
            [
              { id: "1_month", label: "۱ ماهه", discount: null },
              { id: "3_months", label: "۳ ماهه", discount: "۵٪ تخفیف" },
              { id: "6_months", label: "۶ ماهه", discount: "۱۰٪ تخفیف" },
              { id: "12_months", label: "یک‌ساله", discount: "۲۰٪ تخفیف" },
            ] as const
          ).map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => onSelectBillingCycle(c.id as BillingCycle)}
              className={`relative px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                billingCycle === c.id
                  ? "bg-[var(--theme-primary)] text-white shadow-md shadow-[var(--theme-primary)]/20"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              <span>{c.label}</span>
              {c.discount && (
                <span className="mr-1 text-[9px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-1 py-0.2 rounded-md font-normal hidden sm:inline-block">
                  {c.discount}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Loading Skeletons */}
      {isLoading && displayPlans.length === 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="rounded-3xl border border-neutral-800 bg-[#121216]/60 p-6 space-y-4 animate-pulse"
            >
              <div className="h-5 w-24 bg-neutral-800 rounded-lg" />
              <div className="h-7 w-3/4 bg-neutral-700/60 rounded-xl" />
              <div className="h-4 w-full bg-neutral-800/80 rounded" />
              <div className="h-16 w-full bg-neutral-800/50 rounded-2xl my-3" />
              <div className="space-y-2 pt-2">
                <div className="h-3 w-5/6 bg-neutral-800 rounded" />
                <div className="h-3 w-4/6 bg-neutral-800 rounded" />
                <div className="h-3 w-3/6 bg-neutral-800 rounded" />
              </div>
              <div className="h-10 w-full bg-neutral-800 rounded-xl mt-6" />
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && displayPlans.length === 0 && (
        <div className="rounded-3xl border border-neutral-800 bg-[#121216] p-10 text-center space-y-3">
          <Globe2 className="h-10 w-10 text-neutral-500 mx-auto" />
          <p className="text-sm font-bold text-white">در حال حاضر پلن فعالی در سیستم بارگذاری نشده است.</p>
          <p className="text-xs text-neutral-400">لطفاً از پنل مدیریت پلن‌های اینترنت را تعریف فرمایید.</p>
        </div>
      )}

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-4">
        {displayPlans.map((plan) => {
          const isSelected = selectedPlanId === plan.id;
          const baseMonthly = plan.monthlyPrice ?? plan.basePricePerMonth ?? 2000000;

          // Discount calculations
          const discountPercent =
            billingCycle === "12_months"
              ? plan.discountYearly ?? 20
              : billingCycle === "6_months"
              ? plan.discountSixMonths ?? 10
              : billingCycle === "3_months"
              ? plan.discountThreeMonths ?? 5
              : 0;

          const discountedMonthlyPrice = Math.round((baseMonthly * (100 - discountPercent)) / 100);
          const totalCycleCost = discountedMonthlyPrice * cycleMonths;
          const isPopular = Boolean(plan.isFeatured || plan.popular);
          const badgeText = plan.badge || (isPopular ? "پیشنهاد ویژه سازمانی" : null);

          // International & Domestic traffic labels
          const isIntUnlimited = plan.internationalTraffic === null || plan.trafficInternationalGb === null;
          const intVolume = plan.internationalTraffic ?? plan.trafficInternationalGb ?? 500;
          const isDomUnlimited = plan.domesticTraffic === null || plan.trafficDomesticGb === null;
          const domVolume = plan.domesticTraffic ?? plan.trafficDomesticGb ?? 1500;

          const isNightFree =
            plan.nightTraffic === "FREE_BUSINESS" || Boolean(plan.nightTrafficFree);
          const isNightHalf = plan.nightTraffic === "HALF_PRICE";

          return (
            <div
              key={plan.id}
              onClick={() => onSelectPlan(plan.id)}
              className={`relative flex flex-col justify-between rounded-3xl border p-5 sm:p-6 transition-all cursor-pointer ${
                isSelected
                  ? "border-sky-500/80 bg-gradient-to-b from-sky-950/20 via-neutral-900 to-neutral-950 ring-2 ring-sky-500/30 shadow-xl shadow-sky-500/10"
                  : "border-neutral-800/80 bg-[#121216]/90 hover:border-neutral-700 hover:bg-neutral-900/60"
              }`}
            >
              {/* Badge for Popular / Featured */}
              {badgeText && (
                <div className="absolute -top-3 left-6">
                  <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 px-3 py-0.5 text-[11px] font-black text-white shadow-md">
                    <Sparkles className="h-3 w-3" />
                    {badgeText}
                  </span>
                </div>
              )}

              <div>
                {/* Top info */}
                <div className="flex items-center justify-between pb-3 border-b border-neutral-800/80">
                  <div className="flex items-center gap-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-neutral-800/80 text-sky-400">
                      <Wifi className="h-4 w-4" />
                    </span>
                    <span className="text-xs font-bold text-neutral-300">
                      {plan.speed || "پهنای باند سازمانی اختصاصی"}
                    </span>
                  </div>
                  <div
                    className={`h-5 w-5 rounded-full border flex items-center justify-center transition-colors ${
                      isSelected
                        ? "border-sky-500 bg-sky-500 text-black"
                        : "border-neutral-600 bg-neutral-800/60"
                    }`}
                  >
                    {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                  </div>
                </div>

                {/* Plan Title */}
                <h3 className="text-base sm:text-lg font-black text-white mt-4">
                  {plan.title || plan.name}
                </h3>
                <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                  {plan.description || plan.recommendedFor || "مناسب شرکت‌ها، سازمان‌ها و کارگاه‌های اجرایی"}
                </p>

                {/* Speed & Traffic metrics */}
                <div className="grid grid-cols-2 gap-2 my-4 p-3 rounded-2xl bg-neutral-900/70 border border-neutral-800/70 text-right">
                  <div>
                    <span className="text-[10px] text-neutral-400 block">حجم بین‌الملل دوره:</span>
                    <span className="text-xs sm:text-sm font-bold text-sky-400 font-mono">
                      {isIntUnlimited
                        ? "نامحدود"
                        : `${toPersianDigits(intVolume * cycleMonths)} گیگابایت`}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-neutral-400 block">حجم ترافیک داخلی:</span>
                    <span className="text-xs sm:text-sm font-bold text-emerald-400 font-mono">
                      {isDomUnlimited
                        ? "نامحدود"
                        : `${toPersianDigits(domVolume * cycleMonths)} گیگابایت`}
                    </span>
                  </div>
                </div>

                {/* Features list */}
                <ul className="space-y-2 text-xs text-neutral-300 my-4">
                  {(plan.features || []).map((feat, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span className="leading-snug">{feat}</span>
                    </li>
                  ))}
                  {isNightFree ? (
                    <li className="flex items-start gap-2 text-emerald-300 font-medium">
                      <Moon className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>ترافیک شبانه کاملاً رایگان سازمانی</span>
                    </li>
                  ) : isNightHalf ? (
                    <li className="flex items-start gap-2 text-amber-300 font-medium">
                      <Moon className="h-3.5 w-3.5 text-amber-400 shrink-0 mt-0.5" />
                      <span>ترافیک شبانه نیم‌بها</span>
                    </li>
                  ) : null}
                </ul>
              </div>

              {/* Bottom Price & Button */}
              <div className="pt-4 border-t border-neutral-800/80 mt-2">
                <div className="flex items-baseline justify-between mb-3">
                  <div>
                    <div className="text-xs text-neutral-400">هزینه ماهانه:</div>
                    {discountPercent > 0 && (
                      <span className="text-[10px] text-neutral-500 line-through font-mono">
                        {formatPrice(baseMonthly)}
                      </span>
                    )}
                  </div>
                  <div className="flex items-baseline gap-1" dir="rtl">
                    <span className="text-lg sm:text-xl font-black text-white font-mono">
                      {discountedMonthlyPrice.toLocaleString("fa-IR")}
                    </span>
                    <span className="text-[11px] text-neutral-400">تومان / ماه</span>
                  </div>
                </div>

                {cycleMonths > 1 && (
                  <div className="text-right text-[11px] text-sky-300 font-mono mb-3" dir="rtl">
                    مجموع کل {cycleLabel}: {formatPrice(totalCycleCost)}
                  </div>
                )}

                {isPartner && (
                  <div className="mb-3 p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-between text-xs">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-emerald-300 font-semibold flex items-center gap-1.5">
                        <Wallet className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                        <span>پورسانت فروش همکار:</span>
                      </span>
                      <span className="text-[10px] text-emerald-400 font-medium font-sans">
                        (معادل {toPersianDigits(discountedMonthlyPrice > 0 ? Math.round((commissionAmount / discountedMonthlyPrice) * 100) : 0)}٪ ارزش ماهیانه)
                      </span>
                    </div>
                    <div className="text-left font-mono">
                      <span className="font-black text-emerald-400 block">
                        +{formatPrice(commissionAmount)}
                      </span>
                      <span className="text-[10px] text-emerald-300/80 font-sans block">
                        شارژ در کیف پول
                      </span>
                    </div>
                  </div>
                )}

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectPlan(plan.id);
                    onApplyPlanToForm(plan.id);
                  }}
                  className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    isSelected
                      ? "bg-sky-500 hover:bg-sky-400 text-black shadow-md shadow-sky-500/20"
                      : "bg-neutral-800 hover:bg-neutral-700 text-neutral-200"
                  }`}
                >
                  <ArrowDownLeft className="h-3.5 w-3.5" />
                  <span>انتخاب این پلن و ثبت سفارش</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
