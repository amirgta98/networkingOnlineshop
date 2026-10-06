"use client";

import * as React from "react";
import {
  Globe2,
  Check,
  Zap,
  Wifi,
  Sparkles,
  ArrowDownLeft,
  ShieldCheck,
  HardDrive,
  Moon,
} from "lucide-react";
import { INTERNET_PLANS } from "../mock-data/internet-data";
import { InternetPlan, BillingCycle } from "../types";
import { formatPrice, toPersianDigits } from "@/shared/lib/utils";

interface InternetPlansGridProps {
  selectedPlanId: string;
  billingCycle: BillingCycle;
  onSelectPlan: (planId: string) => void;
  onSelectBillingCycle: (cycle: BillingCycle) => void;
  onApplyPlanToForm: (planId: string) => void;
}

export function InternetPlansGrid({
  selectedPlanId,
  billingCycle,
  onSelectPlan,
  onSelectBillingCycle,
  onApplyPlanToForm,
}: InternetPlansGridProps) {
  // Cycle multipliers & discounts
  const cycleInfo = React.useMemo(() => {
    switch (billingCycle) {
      case "1_month":
        return { months: 1, discountPercent: 0, label: "۱ ماهه" };
      case "3_months":
        return { months: 3, discountPercent: 5, label: "۳ ماهه (۵٪ تخفیف)" };
      case "6_months":
        return { months: 6, discountPercent: 12, label: "۶ ماهه (۱۲٪ تخفیف)" };
      case "12_months":
        return { months: 12, discountPercent: 20, label: "۱ ساله (۲۰٪ تخفیف + مودم رایگان)" };
    }
  }, [billingCycle]);

  return (
    <section id="internet-plans-section" className="scroll-mt-24 space-y-6" dir="rtl">
      {/* Header & Billing Cycle Switcher */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 text-right">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-400">
            <Globe2 className="h-4 w-4" />
            <span>پلن‌های اتصال پایدار</span>
          </div>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-white">
            تعرفه‌های اینترنت پرسرعت سازمانی و شرکتی
          </h2>
          <p className="text-xs sm:text-sm text-neutral-400 max-w-2xl leading-relaxed">
            سرعت‌های تضمینی بدون افت در ساعات پیک، با پهنای باند اختصاصی و ضریب اطمینان بالای ۹۹.۹ درصد.
          </p>
        </div>

        {/* Billing cycle pill bar */}
        <div className="flex items-center gap-1 bg-neutral-900 border border-neutral-800 p-1.5 rounded-2xl self-start md:self-auto overflow-x-auto max-w-full">
          {(
            [
              { id: "1_month", label: "۱ ماهه" },
              { id: "3_months", label: "۳ ماهه" },
              { id: "6_months", label: "۶ ماهه" },
              { id: "12_months", label: "۱ ساله (به‌صرفه)" },
            ] as const
          ).map((c) => {
            const isSelected = billingCycle === c.id;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => onSelectBillingCycle(c.id)}
                className={`py-1.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  isSelected
                    ? "bg-[var(--theme-primary)] text-white shadow-md shadow-[var(--theme-primary)]/20"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                {c.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid of Plans */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {INTERNET_PLANS.map((plan) => {
          const isSelected = selectedPlanId === plan.id;
          const discountedMonthlyPrice = Math.round(
            (plan.basePricePerMonth * (100 - cycleInfo.discountPercent)) / 100
          );
          const totalCycleCost = discountedMonthlyPrice * cycleInfo.months;

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
              {/* Badge for Popular */}
              {plan.popular && (
                <div className="absolute -top-3 left-6">
                  <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 px-3 py-0.5 text-[11px] font-black text-white shadow-md">
                    <Sparkles className="h-3 w-3" />
                    محبوب‌ترین شرکت‌ها
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
                    <span className="text-xs font-bold text-neutral-300">{plan.speed}</span>
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
                <h3 className="text-base sm:text-lg font-black text-white mt-4">{plan.name}</h3>
                <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                  {plan.recommendedFor}
                </p>

                {/* Speed & Traffic metrics */}
                <div className="grid grid-cols-2 gap-2 my-4 p-3 rounded-2xl bg-neutral-900/70 border border-neutral-800/70 text-right">
                  <div>
                    <span className="text-[10px] text-neutral-400 block">حجم بین‌الملل دوره:</span>
                    <span className="text-xs sm:text-sm font-bold text-sky-400 font-mono">
                      {toPersianDigits(plan.trafficInternationalGb * cycleInfo.months)} گیگابایت
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-neutral-400 block">حجم ترافیک داخلی:</span>
                    <span className="text-xs sm:text-sm font-bold text-emerald-400 font-mono">
                      {toPersianDigits(plan.trafficDomesticGb * cycleInfo.months)} گیگابایت
                    </span>
                  </div>
                </div>

                {/* Features list */}
                <ul className="space-y-2 text-xs text-neutral-300 my-4">
                  {plan.features.map((feat, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span className="leading-snug">{feat}</span>
                    </li>
                  ))}
                  {plan.nightTrafficFree && (
                    <li className="flex items-start gap-2 text-amber-300 font-medium">
                      <Moon className="h-3.5 w-3.5 text-amber-400 shrink-0 mt-0.5" />
                      <span>ترافیک شبانه نیم‌بها / رایگان سازمانی</span>
                    </li>
                  )}
                </ul>
              </div>

              {/* Bottom Price & Button */}
              <div className="pt-4 border-t border-neutral-800/80 mt-2">
                <div className="flex items-baseline justify-between mb-3">
                  <div>
                    <div className="text-xs text-neutral-400">هزینه ماهانه:</div>
                    {cycleInfo.discountPercent > 0 && (
                      <span className="text-[10px] text-neutral-500 line-through font-mono">
                        {formatPrice(plan.basePricePerMonth)}
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

                {cycleInfo.months > 1 && (
                  <div className="text-right text-[11px] text-sky-300 font-mono mb-3" dir="rtl">
                    مجموع کل {cycleInfo.label}: {formatPrice(totalCycleCost)}
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
