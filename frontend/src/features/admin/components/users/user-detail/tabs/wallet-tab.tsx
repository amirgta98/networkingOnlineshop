"use client";

import * as React from "react";
import type { AdminUserWallet } from "@/features/admin/types/admin-users.types";
import { adminUsersApi } from "@/features/admin/api/admin-users-api";
import { formatPrice, toPersianDigits } from "@/shared/lib/utils";
import {
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  AlertCircle,
  RefreshCw,
  Lock,
  CheckCircle2,
  Calendar,
  Hash,
  CreditCard,
  Building,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";

interface WalletTabProps {
  userId: string;
}

export function WalletTab({ userId }: WalletTabProps) {
  const [wallet, setWallet] = React.useState<AdminUserWallet | null>(null);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);

  const fetchWallet = React.useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await adminUsersApi.getUserWallet(userId);
      setWallet(data);
    } catch (err: any) {
      console.error("Failed to load user wallet:", err);
      setError("خطا در بارگذاری اطلاعات کیف پول کاربر.");
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  React.useEffect(() => {
    fetchWallet();
  }, [fetchWallet]);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4" dir="rtl">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="p-5 rounded-2xl border border-neutral-800 bg-neutral-900/40 animate-pulse h-24"
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
          onClick={fetchWallet}
          className="gap-2 border-neutral-700 text-neutral-200"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>تلاش مجدد</span>
        </Button>
      </div>
    );
  }

  if (!wallet) {
    return (
      <div className="p-12 rounded-2xl border border-dashed border-neutral-800 bg-neutral-900/20 text-center flex flex-col items-center justify-center gap-3" dir="rtl">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral-800 text-neutral-400">
          <Wallet className="h-6 w-6" />
        </div>
        <h3 className="text-sm font-bold text-white">کیف پول یافت نشد</h3>
        <p className="text-xs text-neutral-400 max-w-sm">
          برای این کاربر هنوز کیف پول ریالی فعال ایجاد نشده است.
        </p>
      </div>
    );
  }

  const transactions = wallet.transactions || [];
  const withdrawals = wallet.withdrawals || [];

  return (
    <div className="flex flex-col gap-6" dir="rtl">
      {/* Wallet Balance Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Available Balance */}
        <div className="p-5 rounded-2xl border border-neutral-800 bg-neutral-900/60 flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-xs text-neutral-400">موجودی در دسترس</span>
            <span className="text-xl sm:text-2xl font-black font-mono text-emerald-400">
              {formatPrice(wallet.balance)}
            </span>
            <span className="text-[11px] text-neutral-500">آماده تسویه یا خرید مستقیم</span>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <Wallet className="h-6 w-6" />
          </div>
        </div>

        {/* Locked Balance */}
        <div className="p-5 rounded-2xl border border-neutral-800 bg-neutral-900/60 flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-xs text-neutral-400">موجودی مسدود / در تعهد</span>
            <span className="text-lg sm:text-xl font-black font-mono text-amber-400">
              {formatPrice(wallet.lockedBalance)}
            </span>
            <span className="text-[11px] text-neutral-500">برای سفارشات در جریان</span>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <Lock className="h-6 w-6" />
          </div>
        </div>

        {/* Status */}
        <div className="p-5 rounded-2xl border border-neutral-800 bg-neutral-900/60 flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-xs text-neutral-400">وضعیت کیف پول</span>
            <span className="text-base font-bold text-white flex items-center gap-1.5 mt-1">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span>{wallet.isActive ? "کیف پول فعال و معتبر" : "مسدود شده"}</span>
            </span>
            <span className="text-[11px] text-neutral-500">واحد پول: تومان (IRT)</span>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-500/10 border border-sky-500/20 text-sky-400">
            <CreditCard className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="flex flex-col gap-3">
        <h4 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
          <Wallet className="h-4 w-4 text-emerald-400" />
          <span>گردش حساب و تاریخچه تراکنش‌های کیف پول</span>
        </h4>

        {transactions.length === 0 ? (
          <div className="p-8 rounded-2xl border border-dashed border-neutral-800 bg-neutral-900/20 text-center text-xs text-neutral-400">
            هیچ تراکنشی در تاریخچه کیف پول این کاربر ثبت نشده است.
          </div>
        ) : (
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-neutral-900 border-b border-neutral-800 text-neutral-400">
                  <tr>
                    <th className="py-3 px-4">نوع تراکنش</th>
                    <th className="py-3 px-4">مبلغ</th>
                    <th className="py-3 px-4">موجودی قبلی</th>
                    <th className="py-3 px-4">موجودی پس از تراکنش</th>
                    <th className="py-3 px-4">کد رهگیری</th>
                    <th className="py-3 px-4">تاریخ و زمان</th>
                    <th className="py-3 px-4">شرح تراکنش</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/60">
                  {transactions.map((tx) => {
                    const isCredit = tx.amount > 0;
                    return (
                      <tr key={tx.id} className="hover:bg-neutral-800/20">
                        <td className="py-3.5 px-4 font-semibold text-white">
                          <div className="flex items-center gap-1.5">
                            {isCredit ? (
                              <ArrowDownLeft className="h-4 w-4 text-emerald-400 shrink-0" />
                            ) : (
                              <ArrowUpRight className="h-4 w-4 text-rose-400 shrink-0" />
                            )}
                            <span>{tx.typeLabel || (isCredit ? "شارژ حساب" : "کسر از حساب")}</span>
                          </div>
                        </td>

                        <td
                          className={`py-3.5 px-4 font-black font-mono ${
                            isCredit ? "text-emerald-400" : "text-rose-400"
                          }`}
                        >
                          {isCredit ? "+" : ""}{formatPrice(tx.amount)}
                        </td>

                        <td className="py-3.5 px-4 font-mono text-neutral-400">
                          {formatPrice(tx.balanceBefore)}
                        </td>

                        <td className="py-3.5 px-4 font-mono text-neutral-200 font-semibold">
                          {formatPrice(tx.balanceAfter)}
                        </td>

                        <td className="py-3.5 px-4 font-mono text-neutral-400 text-[11px]">
                          {tx.trackingCode}
                        </td>

                        <td className="py-3.5 px-4 font-mono text-neutral-400 text-[11px]">
                          {tx.createdAt}
                        </td>

                        <td className="py-3.5 px-4 text-neutral-300 max-w-xs">
                          {tx.description || "—"}
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

      {/* Withdrawals Section if any */}
      {withdrawals.length > 0 && (
        <div className="flex flex-col gap-3 pt-2">
          <h4 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
            <Building className="h-4 w-4 text-sky-400" />
            <span>درخواست‌های تسویه و برداشت وجه از کیف پول</span>
          </h4>

          <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-neutral-900 border-b border-neutral-800 text-neutral-400">
                  <tr>
                    <th className="py-3 px-4">مبلغ درخواستی</th>
                    <th className="py-3 px-4">شماره شبا مقصد</th>
                    <th className="py-3 px-4">صاحب حساب</th>
                    <th className="py-3 px-4 text-center">وضعیت تسویه</th>
                    <th className="py-3 px-4">تاریخ ثبت</th>
                    <th className="py-3 px-4">کد پیگیری پایا / ساتنا</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/60">
                  {withdrawals.map((w) => (
                    <tr key={w.id} className="hover:bg-neutral-800/20">
                      <td className="py-3.5 px-4 font-bold font-mono text-white">
                        {formatPrice(w.amount)}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-neutral-300" dir="ltr">
                        {w.shabaNumber || "—"}
                      </td>
                      <td className="py-3.5 px-4 text-neutral-200">
                        {w.bankAccountTitle || "—"}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-semibold">
                          {w.statusLabel || w.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-neutral-400 text-[11px]">
                        {w.requestedAt}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-neutral-300 text-[11px]">
                        {w.payoutReference || "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
