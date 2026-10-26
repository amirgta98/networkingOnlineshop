"use client";

import * as React from "react";
import {
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Layers,
  MapPin,
  DollarSign,
  PieChart,
  BarChart2,
  Activity,
  Loader2,
} from "lucide-react";
import type { InstallationStats } from "@/features/installation/types";
import { installationApi } from "@/features/installation/api/installation-api";
import { formatPrice, toPersianDigits } from "@/shared/lib/utils";

const SERVICE_NAMES: Record<string, string> = {
  cabling: "کابل‌کشی ساختاریافته",
  datacenter: "آرایش رک و دیتاسنتر",
  cctv: "دوربین‌های مداربسته",
  wireless: "شبکه بی‌سیم و AP",
  switching: "سوئیچینگ و روتینگ",
  fiber: "فیوژن فیبر نوری",
  "ups-power": "سیستم برق اضطراری و UPS",
  other: "مشاوره و نظارت",
};

export function AdminInstallationAnalyticsView() {
  const [stats, setStats] = React.useState<InstallationStats | null>(null);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);

  React.useEffect(() => {
    let isMounted = true;
    installationApi
      .getAdminStats()
      .then((res) => {
        if (isMounted) setStats(res);
      })
      .catch((err) => console.error("Failed to load stats:", err))
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  if (isLoading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center gap-3 text-neutral-400" dir="rtl">
        <Loader2 className="h-8 w-8 animate-spin text-orange-400" />
        <p className="text-xs">در حال پردازش شاخص‌های آماری...</p>
      </div>
    );
  }

  const total = stats?.total || 1;
  const serviceEntries = Object.entries(stats?.serviceDistribution || {});
  const provinceEntries = Object.entries(stats?.provinceDistribution || {});

  return (
    <div className="space-y-6" dir="rtl">
      {/* Top 3 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="p-5 rounded-2xl border border-[var(--theme-border-color)] bg-[var(--theme-surface)] space-y-2">
          <div className="flex items-center justify-between text-neutral-400 text-xs">
            <span>ارزش تجمیعی پروژه‌های شبکه</span>
            <DollarSign className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-xl font-black text-emerald-400">
            {formatPrice(stats?.totalEstimatedValue || 0)} تومان
          </div>
          <p className="text-[11px] text-neutral-400">مجموع برآورد ریالی پروژه‌های در دست اقدام</p>
        </div>

        <div className="p-5 rounded-2xl border border-[var(--theme-border-color)] bg-[var(--theme-surface)] space-y-2">
          <div className="flex items-center justify-between text-neutral-400 text-xs">
            <span>نرخ درخواست تست فلوک</span>
            <ShieldCheck className="h-4 w-4 text-orange-400" />
          </div>
          <div className="text-xl font-black text-orange-400">
            {toPersianDigits(stats?.flukeAdoptionRate || 0)}٪
          </div>
          <p className="text-[11px] text-neutral-400">پروژه‌های متقاضی سرتیفیکیت رسمی Fluke DSX-8000</p>
        </div>

        <div className="p-5 rounded-2xl border border-[var(--theme-border-color)] bg-[var(--theme-surface)] space-y-2">
          <div className="flex items-center justify-between text-neutral-400 text-xs">
            <span>نرخ اتمام موفق پروژه‌ها</span>
            <CheckCircle2 className="h-4 w-4 text-sky-400" />
          </div>
          <div className="text-xl font-black text-sky-400">
            {toPersianDigits(
              Math.round(((stats?.completed || 0) / Math.max(1, (stats?.total || 1) - (stats?.cancelled || 0))) * 100)
            )}
            ٪
          </div>
          <p className="text-[11px] text-neutral-400">تحویل به‌موقع پروژه‌ها با ضمانت‌نامه کتبی ۱۸ ماهه</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Service Type Breakdown */}
        <div className="p-5 rounded-2xl border border-[var(--theme-border-color)] bg-[var(--theme-surface)] space-y-4">
          <h3 className="text-sm font-bold text-[var(--theme-foreground)] flex items-center gap-2">
            <BarChart2 className="h-4 w-4 text-orange-400" />
            <span>توزیع درخواست‌ها بر اساس نوع خدمت</span>
          </h3>

          <div className="space-y-3 pt-2">
            {serviceEntries.length === 0 ? (
              <p className="text-xs text-neutral-400 py-6 text-center">داده‌ای ثبت نشده است.</p>
            ) : (
              serviceEntries.map(([svcKey, count]) => {
                const percent = Math.round((count / total) * 100);
                return (
                  <div key={svcKey} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-neutral-200">
                        {SERVICE_NAMES[svcKey] || svcKey}
                      </span>
                      <span className="text-neutral-400 font-mono">
                        {toPersianDigits(count)} پروژه ({toPersianDigits(percent)}٪)
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-neutral-800 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-orange-500 to-amber-400 rounded-full transition-all duration-500"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Geographic Distribution */}
        <div className="p-5 rounded-2xl border border-[var(--theme-border-color)] bg-[var(--theme-surface)] space-y-4">
          <h3 className="text-sm font-bold text-[var(--theme-foreground)] flex items-center gap-2">
            <MapPin className="h-4 w-4 text-orange-400" />
            <span>پراکندگی جغرافیایی سایت‌ها و پروژه‌ها</span>
          </h3>

          <div className="space-y-3 pt-2">
            {provinceEntries.length === 0 ? (
              <p className="text-xs text-neutral-400 py-6 text-center">داده‌ای ثبت نشده است.</p>
            ) : (
              provinceEntries.map(([provinceName, count]) => {
                const percent = Math.round((count / total) * 100);
                return (
                  <div key={provinceName} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-neutral-200">استان {provinceName}</span>
                      <span className="text-neutral-400 font-mono">
                        {toPersianDigits(count)} سایت ({toPersianDigits(percent)}٪)
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-neutral-800 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-sky-500 to-blue-500 rounded-full transition-all duration-500"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
