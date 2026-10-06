"use client";

import * as React from "react";
import type { AdminUser, AdminUserRole, AdminUserStatus } from "../../types/admin-users.types";
import { formatPrice, toPersianDigits } from "@/shared/lib/utils";
import {
  Users2,
  ShieldCheck,
  ShieldAlert,
  Phone,
  Mail,
  Calendar,
  Wallet,
  ShoppingBag,
  Activity,
  Lock,
  UserCheck,
  Ban,
  CheckCircle2,
  Clock,
  Sparkles,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";

interface UserDetailDrawerContentProps {
  user: AdminUser;
  onChangeRole: (user: AdminUser) => void;
  onToggleStatus: (user: AdminUser) => void;
}

export function UserDetailDrawerContent({
  user,
  onChangeRole,
  onToggleStatus,
}: UserDetailDrawerContentProps) {
  const getRoleLabel = (role: AdminUserRole) => {
    switch (role) {
      case "admin":
        return "مدیر کل و صاحب وبسایت (Root)";
      case "sales_manager":
        return "مدیر فروش سازمانی";
      case "partner_b2b":
        return "همکار تجاری حقوقی (B2B)";
      case "customer":
      default:
        return "خریدار عادی فروشگاه";
    }
  };

  return (
    <div className="flex flex-col gap-6 text-right" dir="rtl">
      {/* 1. User Profile Header */}
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-4 sm:p-5 flex flex-col gap-3.5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500/25 to-emerald-700/10 border border-emerald-500/40 text-emerald-400 text-lg font-black shadow-inner">
              {user.fullName.slice(0, 1)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-black text-white">
                  {user.fullName}
                </h2>
                {user.userTier && (
                  <span
                    className={`text-[9px] px-2 py-0.2 rounded-full border font-bold ${
                      user.userTier === "gold"
                        ? "bg-amber-500/15 text-amber-300 border-amber-500/30"
                        : user.userTier === "silver"
                        ? "bg-neutral-700/50 text-neutral-300 border-neutral-600"
                        : "bg-orange-500/15 text-orange-400 border-orange-500/30"
                    }`}
                  >
                    سطح {user.userTier === "gold" ? "طلایی" : user.userTier === "silver" ? "نقره‌ای" : "برنزی"}
                  </span>
                )}
              </div>
              <span className="text-xs text-neutral-400 font-mono mt-0.5 block" dir="ltr">
                {user.phone}
              </span>
            </div>
          </div>

          <span
            className={`text-[10px] px-2.5 py-1 rounded-xl border font-semibold shrink-0 ${
              user.status === "active"
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                : user.status === "pending_verification"
                ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                : "bg-red-500/10 text-red-400 border-red-500/30"
            }`}
          >
            {user.status === "active"
              ? "حساب فعال"
              : user.status === "pending_verification"
              ? "در انتظار احراز هویت"
              : "مسدود شده"}
          </span>
        </div>

        {/* User Role Banner */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-900 border border-neutral-800 text-xs">
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-emerald-400" />
            <span className="text-neutral-400">سطح دسترسی فعلی:</span>
            <span className="font-bold text-white">{getRoleLabel(user.role)}</span>
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={() => onChangeRole(user)}
            className="h-7 text-[11px] border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/10"
          >
            تغییر نقش کاربری
          </Button>
        </div>

        {/* Verification & Security Badges */}
        <div className="grid grid-cols-2 gap-2.5 pt-2 border-t border-neutral-800 text-xs">
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-neutral-900/60 border border-neutral-800">
            <ShieldCheck
              className={`h-4 w-4 ${
                user.nationalCodeVerified ? "text-emerald-400" : "text-neutral-500"
              }`}
            />
            <div className="flex flex-col">
              <span className="text-[10px] text-neutral-400">احراز هویت کد ملی (شاهکار):</span>
              <span
                className={`font-semibold ${
                  user.nationalCodeVerified ? "text-emerald-400" : "text-amber-400"
                }`}
              >
                {user.nationalCodeVerified ? "تایید شده" : "تایید نشده"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-neutral-900/60 border border-neutral-800">
            <Lock
              className={`h-4 w-4 ${
                user.twoFactorActive ? "text-emerald-400" : "text-neutral-500"
              }`}
            />
            <div className="flex flex-col">
              <span className="text-[10px] text-neutral-400">ورود دو مرحله‌ای (۲FA):</span>
              <span
                className={`font-semibold ${
                  user.twoFactorActive ? "text-emerald-400" : "text-neutral-400"
                }`}
              >
                {user.twoFactorActive ? "فعال و ایمن" : "غیرفعال"}
              </span>
            </div>
          </div>
        </div>

        {/* Contact & Company Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-neutral-300 pt-2 border-t border-neutral-800">
          <div>
            <span className="text-neutral-400 block text-[11px]">کد ملی ثبت‌شده:</span>
            <span className="font-mono text-white">{toPersianDigits(user.nationalCode)}</span>
          </div>

          {user.companyName && (
            <div>
              <span className="text-neutral-400 block text-[11px]">شرکت / سازمان وابسته:</span>
              <span className="font-bold text-sky-400">{user.companyName}</span>
            </div>
          )}

          <div>
            <span className="text-neutral-400 block text-[11px]">تاریخ عضویت:</span>
            <span className="font-mono text-neutral-300">{user.registeredAt}</span>
          </div>

          <div>
            <span className="text-neutral-400 block text-[11px]">آخرین زمان ورود:</span>
            <span className="font-mono text-neutral-300">{user.lastLogin}</span>
          </div>
        </div>
      </div>

      {/* 2. Commerce & Financial Metrics */}
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-4 sm:p-5">
        <h3 className="text-xs sm:text-sm font-bold text-white mb-3.5 flex items-center gap-2">
          <ShoppingBag className="h-4 w-4 text-emerald-400" />
          <span>سوابق خرید و تعاملات مالی کاربر</span>
        </h3>

        <div className="grid grid-cols-3 gap-2.5 text-center">
          <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 flex flex-col gap-1">
            <span className="text-[10px] text-neutral-400">تعداد سفارش‌ها</span>
            <span className="text-sm sm:text-base font-black font-mono text-white">
              {toPersianDigits(user.ordersCount)} سفارش
            </span>
          </div>

          <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 flex flex-col gap-1">
            <span className="text-[10px] text-neutral-400">مجموع خرید تجمعی</span>
            <span className="text-xs sm:text-sm font-black font-mono text-emerald-400">
              {formatPrice(user.totalSpent)}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 flex flex-col gap-1">
            <span className="text-[10px] text-neutral-400">موجودی کیف پول</span>
            <span className="text-xs sm:text-sm font-black font-mono text-sky-400">
              {formatPrice(user.walletBalance)}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Recent Security Activity Feed */}
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-4 sm:p-5">
        <h3 className="text-xs sm:text-sm font-bold text-white mb-3 flex items-center gap-2">
          <Activity className="h-4 w-4 text-sky-400" />
          <span>آخرین لاگ‌های امنیتی و رویدادهای حساب</span>
        </h3>

        <div className="flex flex-col gap-2 font-mono text-xs">
          {user.activities.map((act) => (
            <div
              key={act.id}
              className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-neutral-300"
            >
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400 shrink-0" />
                <span className="truncate">{act.action}</span>
              </div>

              <div className="flex items-center gap-3 shrink-0 text-[11px] text-neutral-500">
                <span>IP: {act.ip}</span>
                <span>{act.timestamp}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Action Buttons */}
      <div className="flex items-center gap-3 pt-2">
        <Button
          onClick={() => onToggleStatus(user)}
          variant="outline"
          className={`flex-1 text-xs font-bold gap-2 ${
            user.status === "active"
              ? "border-red-500/30 text-red-400 hover:bg-red-500/10"
              : "border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
          }`}
        >
          {user.status === "active" ? (
            <>
              <Ban className="h-4 w-4" />
              <span>مسدودسازی موقت حساب کاربری</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="h-4 w-4" />
              <span>رفع مسدودی و فعال‌سازی حساب</span>
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
