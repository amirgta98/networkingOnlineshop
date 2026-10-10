"use client";

import * as React from "react";
import {
  Lock,
  ShieldCheck,
  Smartphone,
  Laptop,
  Clock,
  AlertTriangle,
  History,
  KeyRound,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { toPersianDigits } from "@/shared/lib/utils";

export function PartnerSecurityView() {
  const [twoFactorActive, setTwoFactorActive] = React.useState(true);

  const activeSessions = [
    {
      id: "sess_1",
      device: "سیستم کامپیوتر مرکزی تدارکات — Windows 11 (Chrome)",
      ip: "5.218.140.22 (تهران — همراه اول)",
      time: "در حال حاضر آنلاین",
      isCurrent: true,
    },
    {
      id: "sess_2",
      device: "موبایل نماینده خرید — iPhone 15 Pro (Safari)",
      ip: "5.218.144.18 (تهران — ایرانسل)",
      time: "۲ ساعت پیش",
      isCurrent: false,
    },
    {
      id: "sess_3",
      device: "لپ‌تاپ ناظر کارگاه عسلویه — MacBook Pro (Firefox)",
      ip: "2.180.99.110 (عسلویه — شاتل)",
      time: "دیروز، ساعت ۱۶:۴۰",
      isCurrent: false,
    },
  ];

  const auditLogs = [
    {
      id: "log_1",
      agent: "مهندس کامران کاظمی",
      action: "ثبت چک صیادی شماره ۰۴/۸۸۱۴ با مبلغ ۱۲۸ میلیون تومان در سیستم",
      time: "امروز ساعت ۰۹:۱۵",
      status: "success",
    },
    {
      id: "log_2",
      agent: "مهندس پویا شمس",
      action: "ارسال استعلام قیمت BOM پروژه پتروشیمی زاگرس (RFQ)",
      time: "دیروز ساعت ۱۱:۴۵",
      status: "success",
    },
    {
      id: "log_3",
      agent: "خانم مریم صبوری",
      action: "دانلود نسخه PDF رسمی فاکتور مالیاتی INV-1403-0941",
      time: "۲ روز پیش ساعت ۱۴:۲۰",
      status: "success",
    },
    {
      id: "log_4",
      agent: "مهندس کامران کاظمی",
      action: "ورود به حساب کاربری با تایید دو مرحله‌ای پیامکی (SMS OTP)",
      time: "۳ روز پیش ساعت ۰۸:۵۰",
      status: "success",
    },
  ];

  return (
    <div className="flex flex-col gap-6 text-right" dir="rtl">
      {/* Top Header Card */}
      <div className="rounded-3xl border border-[var(--theme-border-color)] bg-[var(--theme-surface)] p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400">
              <Lock className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">امنیت سازمانی، نشست‌ها و لاگ دسترسی</h2>
              <p className="text-xs text-neutral-400 mt-0.5">
                تایید دو مرحله‌ای حساب حقوقی، پایش نشست‌های ورود نمایندگان و ثبت لاگ امنیتی تراکنش‌ها
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4" />
            <span>حساب سازمانی در بالاترین لایه امنیت</span>
          </span>
        </div>
      </div>

      {/* 2FA Status Card */}
      <div className="rounded-3xl border border-sky-500/30 bg-gradient-to-br from-sky-950/20 via-[var(--theme-surface)] to-[var(--theme-surface)] p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-sky-500/15 border border-sky-500/30 text-sky-400">
            <Smartphone className="h-6 w-6" />
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white">احراز هویت دو مرحله‌ای الزامی (۲FA)</h3>
              <span className="text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full font-bold">
                فعال ✓
              </span>
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed max-w-xl">
              برای کلیه خریدهای بالای ۵۰ میلیون تومان و ثبت چک صیادی، کد یکبار مصرف ۶ رقمی به شماره موبایل نماینده ارسال خواهد شد.
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          className="text-xs border-neutral-700 text-neutral-300 hover:text-white"
          onClick={() => alert("تنظیمات امنیتی پیامکی برای شماره نماینده بازنگری شد.")}
        >
          تنظیمات روش ارسال پیامک
        </Button>
      </div>

      {/* Active Sessions */}
      <div className="rounded-3xl border border-[var(--theme-border-color)] bg-[var(--theme-surface)] p-6 shadow-sm flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-white text-base">نشست‌های فعال نمایندگان شرکت</h3>
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-red-400 hover:text-red-300"
            onClick={() => alert("سایر نشست‌ها با موفقیت خاتمه یافتند.")}
          >
            خروج از همه نشست‌های دیگر
          </Button>
        </div>

        <div className="divide-y divide-neutral-800/60">
          {activeSessions.map((sess) => (
            <div key={sess.id} className="py-3.5 flex items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-300">
                  <Laptop className="h-4 w-4" />
                </div>
                <div className="flex flex-col gap-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">{sess.device}</span>
                    {sess.isCurrent && (
                      <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.2 rounded-full font-bold">
                        نشست فعلی شما
                      </span>
                    )}
                  </div>
                  <span className="text-neutral-400 font-mono text-[11px]" dir="ltr">{sess.ip}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-neutral-400">{sess.time}</span>
                {!sess.isCurrent && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-[11px] text-red-400 hover:text-red-300"
                    onClick={() => alert(`نشست ${sess.device} لغو شد.`)}
                  >
                    خروج
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Audit Log */}
      <div className="rounded-3xl border border-[var(--theme-border-color)] bg-[var(--theme-surface)] p-6 shadow-sm flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="h-5 w-5 text-sky-400" />
            <h3 className="font-bold text-white text-base">لاگ امنیتی تراکنش‌ها و فعالیت پرسنل خرید</h3>
          </div>
          <span className="text-xs text-neutral-400">ثبت دقیق آی‌پی و زمان هر اقدام مالی</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="border-b border-neutral-800 text-neutral-400">
                <th className="pb-3 pr-2 font-medium">کارشناس اقدام‌کننده</th>
                <th className="pb-3 font-medium">شرح رویداد مالی / امنیتی</th>
                <th className="pb-3 font-medium">زمان رویداد</th>
                <th className="pb-3 pl-2 text-left font-medium">وضعیت</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60">
              {auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-neutral-900/30 transition-colors">
                  <td className="py-3.5 pr-2 font-semibold text-white">
                    {log.agent}
                  </td>
                  <td className="py-3.5 text-neutral-300">
                    {log.action}
                  </td>
                  <td className="py-3.5 text-neutral-400">
                    {log.time}
                  </td>
                  <td className="py-3.5 pl-2 text-left">
                    <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      <CheckCircle2 className="h-3 w-3" />
                      <span>موفق</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
