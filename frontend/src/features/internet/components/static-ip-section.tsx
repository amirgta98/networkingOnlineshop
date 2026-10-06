"use client";

import * as React from "react";
import {
  Server,
  ShieldCheck,
  Check,
  Zap,
  Lock,
  Globe,
  Video,
  Network,
  Cpu,
  ArrowDownLeft,
  Info,
} from "lucide-react";
import { STATIC_IP_PACKAGES } from "../mock-data/internet-data";
import { StaticIpPackage, BillingCycle } from "../types";
import { formatPrice, toPersianDigits } from "@/shared/lib/utils";

interface StaticIpSectionProps {
  selectedStaticIpId: string;
  billingCycle: BillingCycle;
  onSelectStaticIp: (ipPackageId: string) => void;
  onApplyIpToForm: (ipPackageId: string) => void;
}

export function StaticIpSection({
  selectedStaticIpId,
  billingCycle,
  onSelectStaticIp,
  onApplyIpToForm,
}: StaticIpSectionProps) {
  const isYearly = billingCycle === "12_months";

  return (
    <section
      id="static-ip-section"
      className="scroll-mt-24 space-y-8 rounded-3xl border border-sky-500/20 bg-gradient-to-b from-sky-950/20 via-neutral-900/60 to-neutral-900/80 p-6 sm:p-10 shadow-2xl"
      dir="rtl"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 text-right">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-sky-500/40 bg-sky-500/10 px-3 py-1 text-xs font-semibold text-sky-400">
            <Server className="h-3.5 w-3.5" />
            <span>بخش ویژه تخصیص آدرس ثابت اینترنتی</span>
          </div>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-white">
            خرید و رزرو آنلاین IP استاتیک اختصاصی (Static IP)
          </h2>
          <p className="text-xs sm:text-sm text-neutral-300 max-w-2xl leading-relaxed">
            تخصیص آنی IPهای معتبر، تمیز و ثبت‌شده در RIPE به صورت تکی (/32) یا در بلاک‌های ساب‌نت (/30، /29 و /28)
            همراه با قابلیت Reverse DNS و پشتیبانی از تونل‌های رمزنگاری‌شده سازمانی.
          </p>
        </div>

        {/* Informative pill */}
        <div className="flex items-center gap-2 text-xs text-sky-300 bg-sky-900/30 border border-sky-700/40 p-3 rounded-2xl self-start md:self-auto max-w-sm">
          <Info className="h-4 w-4 text-sky-400 shrink-0" />
          <span>
            آی‌پی استاتیک را می‌توانید به همراه بسته اینترنت یا به عنوان سرویس مستقل بر روی خطوط قبلی خود فعال نمایید.
          </span>
        </div>
      </div>

      {/* Why Static IP is necessary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-right">
        {[
          {
            icon: Video,
            title: "انتقال تصویر دوربین‌ها (CCTV)",
            desc: "مشاهده تصاویر دستگاه‌های NVR و DVR بدون تاخیر و بدون نیاز به سرورهای ابری خارجی واسطه.",
          },
          {
            icon: Lock,
            title: "دسترسی ایمن به نرم‌افزارها",
            desc: "اتصال به سیستم‌های مالی، حسابداری سپیدار/همکاران و اتوماسیون اداری از شعب و منازل.",
          },
          {
            icon: Network,
            title: "ایجاد تونل VPN بین شعب",
            desc: "برقراری ارتباط شبکه پایدار و رمزگذاری شده Site-to-Site بین دفتر مرکزی و کارخانجات.",
          },
          {
            icon: Globe,
            title: "میزبانی وب‌سرور و میل‌سرور",
            desc: "راه‌اندازی سرویس‌های اختصاصی درون‌سازمانی با تنظیم رکوردهای معتبر PTR و RDNS.",
          },
        ].map((item) => (
          <div
            key={item.title}
            className="flex flex-col gap-2 rounded-2xl border border-neutral-800 bg-[#121216]/80 p-4 shadow-sm"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <item.icon className="h-4 w-4" />
            </div>
            <h4 className="text-xs sm:text-sm font-bold text-white">{item.title}</h4>
            <p className="text-[11px] text-neutral-400 leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </div>

      {/* Packages Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs font-bold text-neutral-300">
          <span>بسته‌های ساب‌نت و تعداد آی‌پی مورد نیاز خود را مشخص کنید:</span>
          {isYearly && (
            <span className="text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
              تخفیف سالانه ۲۰٪ الی ۳۵٪ اعمال گردید
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {STATIC_IP_PACKAGES.map((pkg) => {
            const isSelected = selectedStaticIpId === pkg.id;
            const effectiveMonthly = isYearly
              ? Math.round((pkg.pricePerMonth * (100 - pkg.discountPercentForYearly)) / 100)
              : pkg.pricePerMonth;

            return (
              <div
                key={pkg.id}
                onClick={() => onSelectStaticIp(pkg.id)}
                className={`relative flex flex-col justify-between rounded-2xl border p-5 transition-all cursor-pointer ${
                  isSelected
                    ? "border-sky-400 bg-sky-950/40 ring-2 ring-sky-500/40 shadow-lg shadow-sky-500/10"
                    : "border-neutral-800 bg-[#121216]/90 hover:border-neutral-700 hover:bg-neutral-900"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
                    <span className="text-xs font-black text-sky-400 font-mono">
                      {pkg.subnetMask}
                    </span>
                    <div
                      className={`h-4 w-4 rounded-full border flex items-center justify-center transition-colors ${
                        isSelected
                          ? "border-sky-400 bg-sky-400 text-black"
                          : "border-neutral-600 bg-neutral-800"
                      }`}
                    >
                      {isSelected && <Check className="h-2.5 w-2.5 stroke-[3]" />}
                    </div>
                  </div>

                  <h3 className="text-sm font-black text-white mt-3">{pkg.label}</h3>
                  <div className="text-[11px] text-neutral-400 mt-1 mb-3">
                    {pkg.usableIps} آدرس IP عمومی قابل تخصیص مستقیم
                  </div>

                  <ul className="space-y-1.5 text-[11px] text-neutral-300 my-3">
                    {pkg.features.map((f, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <Check className="h-3 w-3 text-emerald-400 shrink-0 mt-0.5" />
                        <span className="leading-snug">{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-3 border-t border-neutral-800 mt-2">
                  <div className="flex items-baseline justify-between mb-2">
                    <span className="text-[11px] text-neutral-400">هزینه ماهانه:</span>
                    <div className="flex items-baseline gap-1" dir="rtl">
                      <span className="text-base font-black text-white font-mono">
                        {effectiveMonthly.toLocaleString("fa-IR")}
                      </span>
                      <span className="text-[10px] text-neutral-400">تومان / ماه</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectStaticIp(pkg.id);
                      onApplyIpToForm(pkg.id);
                    }}
                    className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1 ${
                      isSelected
                        ? "bg-sky-400 hover:bg-sky-300 text-black"
                        : "bg-neutral-800 hover:bg-neutral-700 text-neutral-200"
                    }`}
                  >
                    <ArrowDownLeft className="h-3 w-3" />
                    <span>{isSelected ? "انتخاب شده" : "انتخاب این پکیج IP"}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Option to proceed without static IP */}
        <div className="flex items-center justify-between p-3.5 rounded-2xl border border-neutral-800 bg-neutral-900/40">
          <div className="flex items-center gap-2">
            <span className="text-xs text-neutral-400">
              نیازی به IP ثابت اختصاصی ندارید و آی‌پی داینامیک معمولی برایتان کافیست؟
            </span>
          </div>
          <button
            type="button"
            onClick={() => onSelectStaticIp("none")}
            className={`py-1.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedStaticIpId === "none"
                ? "bg-neutral-700 text-white"
                : "border border-neutral-700 text-neutral-400 hover:text-white"
            }`}
          >
            {selectedStaticIpId === "none" ? "بدون IP استاتیک (انتخاب شده)" : "بدون نیاز به IP استاتیک"}
          </button>
        </div>
      </div>
    </section>
  );
}
