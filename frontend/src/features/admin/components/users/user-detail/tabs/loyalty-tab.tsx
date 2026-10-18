"use client";

import * as React from "react";
import type { AdminUserLoyalty } from "@/features/admin/types/admin-users.types";
import { adminUsersApi } from "@/features/admin/api/admin-users-api";
import { toPersianDigits } from "@/shared/lib/utils";
import {
  Award,
  Crown,
  Sparkles,
  AlertCircle,
  RefreshCw,
  Gift,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  Zap,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";

interface LoyaltyTabProps {
  userId: string;
}

export function LoyaltyTab({ userId }: LoyaltyTabProps) {
  const [loyalty, setLoyalty] = React.useState<AdminUserLoyalty | null>(null);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);

  const fetchLoyalty = React.useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await adminUsersApi.getUserLoyalty(userId);
      setLoyalty(data);
    } catch (err: any) {
      console.error("Failed to load user loyalty club info:", err);
      setError("خطا در بارگذاری اطلاعات باشگاه مشتریان کاربر.");
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  React.useEffect(() => {
    fetchLoyalty();
  }, [fetchLoyalty]);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4" dir="rtl">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="p-5 rounded-2xl border border-neutral-800 bg-neutral-900/40 animate-pulse h-28"
            />
          ))}
        </div>
        <div className="h-64 rounded-2xl border border-neutral-800 bg-neutral-900/40 animate-pulse" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 rounded-2xl border border-red-500/20 bg-red-500/5 text-center flex flex-col items-center justify-center gap-3" dir="rtl">
        <AlertCircle className="h-8 w-8 text-red-400" />
        <p className="text-sm text-neutral-300 font-medium">{error}</p>
        <Button
          size="sm"
          variant="outline"
          onClick={fetchLoyalty}
          className="gap-2 border-neutral-700 text-neutral-200"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>تلاش مجدد</span>
        </Button>
      </div>
    );
  }

  if (!loyalty) {
    return (
      <div className="p-12 rounded-2xl border border-dashed border-neutral-800 bg-neutral-900/20 text-center flex flex-col items-center justify-center gap-3" dir="rtl">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral-800 text-neutral-400">
          <Award className="h-6 w-6" />
        </div>
        <h3 className="text-sm font-bold text-white">عضویتی در باشگاه مشتریان ثبت نشده است</h3>
        <p className="text-xs text-neutral-400 max-w-sm">
          این کاربر هنوز در طرح وفاداری یا باشگاه مشتریان ققنوس شرکت نکرده است.
        </p>
      </div>
    );
  }

  const transactions = loyalty.transactions || [];

  return (
    <div className="flex flex-col gap-6" dir="rtl">
      {/* Loyalty Club Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Tier Card */}
        <div className="p-5 rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-neutral-900 to-neutral-900 flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-xs text-amber-400/90 font-medium">سطح باشگاه مشتریان</span>
            <span className="text-xl sm:text-2xl font-black text-white">
              {loyalty.tierTitle}
            </span>
            <span className="text-[11px] text-neutral-400">
              درصد کش‌بک خرید: <strong className="text-amber-300 font-mono">{toPersianDigits(loyalty.cashbackPercent)}٪</strong>
            </span>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/20 border border-amber-500/30 text-amber-300">
            <Crown className="h-6 w-6" />
          </div>
        </div>

        {/* Current Points */}
        <div className="p-5 rounded-2xl border border-neutral-800 bg-neutral-900/60 flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-xs text-neutral-400">امتیاز قابل استفاده</span>
            <span className="text-xl sm:text-2xl font-black font-mono text-emerald-400">
              {toPersianDigits(loyalty.pointsBalance)}
            </span>
            <span className="text-[11px] text-neutral-500">قابل تبدیل به کد تخفیف</span>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <Sparkles className="h-6 w-6" />
          </div>
        </div>

        {/* Lifetime Points */}
        <div className="p-5 rounded-2xl border border-neutral-800 bg-neutral-900/60 flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-xs text-neutral-400">مجموع امتیازهای کسب‌شده</span>
            <span className="text-xl sm:text-2xl font-black font-mono text-sky-400">
              {toPersianDigits(loyalty.lifetimePoints)}
            </span>
            {loyalty.minPointsForNextTier ? (
              <span className="text-[11px] text-neutral-400">
                تا سطح بعدی: <strong className="text-white font-mono">{toPersianDigits(loyalty.minPointsForNextTier)}</strong> امتیاز
              </span>
            ) : (
              <span className="text-[11px] text-neutral-500">بالاترین سطح باشگاه</span>
            )}
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-500/10 border border-sky-500/20 text-sky-400">
            <Award className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Points Transactions History */}
      <div className="flex flex-col gap-3">
        <h4 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
          <Gift className="h-4 w-4 text-emerald-400" />
          <span>تاریخچه تراکنش‌های امتیاز باشگاه مشتریان</span>
        </h4>

        {transactions.length === 0 ? (
          <div className="p-8 rounded-2xl border border-dashed border-neutral-800 bg-neutral-900/20 text-center text-xs text-neutral-400">
            هیچ تراکنش امتیازی در تاریخچه ثبت نشده است.
          </div>
        ) : (
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-neutral-900 border-b border-neutral-800 text-neutral-400">
                  <tr>
                    <th className="py-3 px-4">نوع عملیات</th>
                    <th className="py-3 px-4">امتیاز</th>
                    <th className="py-3 px-4">امتیاز قبلی</th>
                    <th className="py-3 px-4">امتیاز پس از عملیات</th>
                    <th className="py-3 px-4">تاریخ ثبت</th>
                    <th className="py-3 px-4">توضیحات و مناسبت</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/60">
                  {transactions.map((t) => {
                    const isPositive = t.points > 0;
                    return (
                      <tr key={t.id} className="hover:bg-neutral-800/20">
                        <td className="py-3.5 px-4 font-semibold text-white">
                          <div className="flex items-center gap-1.5">
                            {isPositive ? (
                              <ArrowDownLeft className="h-4 w-4 text-emerald-400 shrink-0" />
                            ) : (
                              <ArrowUpRight className="h-4 w-4 text-amber-400 shrink-0" />
                            )}
                            <span>{t.typeLabel || (isPositive ? "کسب امتیاز" : "کسر امتیاز")}</span>
                          </div>
                        </td>

                        <td
                          className={`py-3.5 px-4 font-black font-mono ${
                            isPositive ? "text-emerald-400" : "text-amber-400"
                          }`}
                        >
                          {isPositive ? "+" : ""}{toPersianDigits(t.points)} امتیاز
                        </td>

                        <td className="py-3.5 px-4 font-mono text-neutral-400">
                          {toPersianDigits(t.pointsBefore)}
                        </td>

                        <td className="py-3.5 px-4 font-mono text-neutral-200 font-semibold">
                          {toPersianDigits(t.pointsAfter)}
                        </td>

                        <td className="py-3.5 px-4 font-mono text-neutral-400 text-[11px]">
                          {t.createdAt}
                        </td>

                        <td className="py-3.5 px-4 text-neutral-300 max-w-sm">
                          {t.description || "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
