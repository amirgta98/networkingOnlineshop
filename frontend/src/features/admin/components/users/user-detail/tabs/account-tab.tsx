"use client";

import * as React from "react";
import type { AdminUser, AdminUserRole } from "@/features/admin/types/admin-users.types";
import { formatPrice, toPersianDigits } from "@/shared/lib/utils";
import {
  ShieldCheck,
  ShieldAlert,
  Phone,
  Mail,
  Calendar,
  Wallet,
  ShoppingBag,
  Lock,
  Building2,
  CheckCircle2,
  Clock,
  Sparkles,
  Pencil,
  FileText,
  KeyRound,
  Ban,
  User,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";

interface AccountTabProps {
  user: AdminUser;
  onEditUser: () => void;
  onChangeRole: () => void;
  onToggleStatus: () => void;
}

export function AccountTab({
  user,
  onEditUser,
  onChangeRole,
  onToggleStatus,
}: AccountTabProps) {
  const getRoleLabel = (role: AdminUserRole) => {
    switch (role) {
      case "admin":
        return "مدیر کل سامانه (Super Admin)";
      case "partner_b2b":
        return "همکار تجاری و شریک حقوقی (B2B Partner)";
      case "customer":
      default:
        return "خریدار عادی و خرده‌فروشی (Customer)";
    }
  };

  return (
    <div className="flex flex-col gap-6" dir="rtl">
      {/* Top Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Orders */}
        <div className="p-4 sm:p-5 rounded-2xl border border-neutral-800 bg-neutral-900/60 flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-xs text-neutral-400">تعداد کل سفارش‌ها</span>
            <span className="text-xl sm:text-2xl font-black font-mono text-white">
              {toPersianDigits(user.ordersCount)}
            </span>
            <span className="text-[11px] text-neutral-500">سفارش ثبت‌شده در سامانه</span>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <ShoppingBag className="h-6 w-6" />
          </div>
        </div>

        {/* Total Spent */}
        <div className="p-4 sm:p-5 rounded-2xl border border-neutral-800 bg-neutral-900/60 flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-xs text-neutral-400">مجموع خریدهای تجمعی</span>
            <span className="text-lg sm:text-xl font-black font-mono text-emerald-400">
              {formatPrice(user.totalSpent)}
            </span>
            <span className="text-[11px] text-neutral-500">تراکنش‌های تایید شده</span>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-500/10 border border-sky-500/20 text-sky-400">
            <Sparkles className="h-6 w-6" />
          </div>
        </div>

        {/* Wallet Balance */}
        <div className="p-4 sm:p-5 rounded-2xl border border-neutral-800 bg-neutral-900/60 flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-xs text-neutral-400">موجودی کیف پول</span>
            <span className="text-lg sm:text-xl font-black font-mono text-sky-400">
              {formatPrice(user.walletBalance)}
            </span>
            <span className="text-[11px] text-neutral-500">قابل استفاده برای خرید</span>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
            <Wallet className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Main Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal & Account Information */}
        <div className="p-5 sm:p-6 rounded-2xl border border-neutral-800 bg-neutral-900/40 flex flex-col gap-5">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
            <div className="flex items-center gap-2.5">
              <User className="h-5 w-5 text-emerald-400" />
              <h3 className="text-sm sm:text-base font-bold text-white">اطلاعات هویتی و پرسنلی</h3>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={onEditUser}
              className="h-8 text-xs gap-1.5 border-neutral-700 text-neutral-200 hover:bg-neutral-800"
            >
              <Pencil className="h-3.5 w-3.5 text-sky-400" />
              <span>ویرایش مشخصات</span>
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3 rounded-xl bg-neutral-900/70 border border-neutral-800/80">
              <span className="text-neutral-400 block text-[11px] mb-1">نام و نام خانوادگی:</span>
              <span className="font-bold text-white text-sm">{user.fullName}</span>
            </div>

            <div className="p-3 rounded-xl bg-neutral-900/70 border border-neutral-800/80">
              <span className="text-neutral-400 block text-[11px] mb-1">شماره تلفن همراه:</span>
              <span className="font-mono text-white text-sm" dir="ltr">{user.phone}</span>
            </div>

            <div className="p-3 rounded-xl bg-neutral-900/70 border border-neutral-800/80">
              <span className="text-neutral-400 block text-[11px] mb-1">پست الکترونیکی:</span>
              <span className="font-mono text-neutral-200 text-xs" dir="ltr">
                {user.email || "ثبت نشده"}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-neutral-900/70 border border-neutral-800/80">
              <span className="text-neutral-400 block text-[11px] mb-1">کد ملی کاربر:</span>
              <span className="font-mono text-white text-sm">
                {user.nationalCode ? toPersianDigits(user.nationalCode) : "ثبت نشده"}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-neutral-900/70 border border-neutral-800/80 sm:col-span-2">
              <span className="text-neutral-400 block text-[11px] mb-1">سازمان / شرکت همکار:</span>
              <span className="font-semibold text-neutral-200">
                {user.companyName || "شخص حقیقی (غیرسازمانی)"}
              </span>
            </div>
          </div>
        </div>

        {/* Security & Access Level */}
        <div className="p-5 sm:p-6 rounded-2xl border border-neutral-800 bg-neutral-900/40 flex flex-col gap-5">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
            <div className="flex items-center gap-2.5">
              <Lock className="h-5 w-5 text-emerald-400" />
              <h3 className="text-sm sm:text-base font-bold text-white">امنیت و سطوح دسترسی</h3>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={onChangeRole}
              className="h-8 text-xs gap-1.5 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/10"
            >
              <KeyRound className="h-3.5 w-3.5" />
              <span>تغییر نقش</span>
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {/* Role Card */}
            <div className="p-3.5 rounded-xl bg-neutral-900/70 border border-neutral-800/80 sm:col-span-2">
              <span className="text-neutral-400 block text-[11px] mb-1">نقش و سطح دسترسی فعلی:</span>
              <div className="flex items-center justify-between">
                <span className="font-bold text-emerald-400 text-sm">
                  {getRoleLabel(user.role)}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-mono">
                  {user.role}
                </span>
              </div>
            </div>

            {/* National Code Verification */}
            <div className="p-3.5 rounded-xl bg-neutral-900/70 border border-neutral-800/80 flex items-center justify-between">
              <div>
                <span className="text-neutral-400 block text-[11px]">احراز هویت شاهکار:</span>
                <span
                  className={`font-semibold mt-1 inline-block ${
                    user.nationalCodeVerified ? "text-emerald-400" : "text-amber-400"
                  }`}
                >
                  {user.nationalCodeVerified ? "کد ملی تایید شده" : "در انتظار تایید"}
                </span>
              </div>
              <ShieldCheck
                className={`h-5 w-5 ${
                  user.nationalCodeVerified ? "text-emerald-400" : "text-neutral-500"
                }`}
              />
            </div>

            {/* 2FA */}
            <div className="p-3.5 rounded-xl bg-neutral-900/70 border border-neutral-800/80 flex items-center justify-between">
              <div>
                <span className="text-neutral-400 block text-[11px]">ورود دو مرحله‌ای (۲FA):</span>
                <span
                  className={`font-semibold mt-1 inline-block ${
                    user.twoFactorActive ? "text-emerald-400" : "text-neutral-400"
                  }`}
                >
                  {user.twoFactorActive ? "فعال و ایمن" : "غیرفعال"}
                </span>
              </div>
              <Lock
                className={`h-5 w-5 ${
                  user.twoFactorActive ? "text-emerald-400" : "text-neutral-500"
                }`}
              />
            </div>

            {/* Registration Date */}
            <div className="p-3.5 rounded-xl bg-neutral-900/70 border border-neutral-800/80">
              <span className="text-neutral-400 block text-[11px] mb-1">تاریخ ثبت‌نام در سامانه:</span>
              <span className="font-mono text-neutral-200">{user.registeredAt}</span>
            </div>

            {/* Last Login */}
            <div className="p-3.5 rounded-xl bg-neutral-900/70 border border-neutral-800/80">
              <span className="text-neutral-400 block text-[11px] mb-1">آخرین زمان فعالیت / ورود:</span>
              <span className="font-mono text-neutral-200">{user.lastLogin}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Notes & Status Banner */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Admin Notes */}
        <div className="p-5 rounded-2xl border border-neutral-800 bg-neutral-900/40 flex flex-col gap-3 lg:col-span-2">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-emerald-400" />
            <h4 className="text-xs sm:text-sm font-bold text-white">یادداشت‌های داخلی مدیران (Admin Notes)</h4>
          </div>
          <p className="text-xs text-neutral-300 leading-relaxed bg-neutral-900 p-3.5 rounded-xl border border-neutral-800/80">
            {user.notes || "هیچ یادداشت خاصی برای این حساب کاربری توسط مدیران درج نشده است."}
          </p>
        </div>

        {/* Account Status Card & Action */}
        <div className="p-5 rounded-2xl border border-neutral-800 bg-neutral-900/40 flex flex-col justify-between gap-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-neutral-400">وضعیت حساب:</span>
              <span
                className={`text-[10px] px-2.5 py-0.5 rounded-full border font-bold ${
                  user.status === "active"
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                    : user.status === "pending_verification"
                    ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                    : "bg-red-500/10 text-red-400 border-red-500/30"
                }`}
              >
                {user.status === "active"
                  ? "فعال و مجاز"
                  : user.status === "pending_verification"
                  ? "در انتظار احراز"
                  : "مسدود شده"}
              </span>
            </div>
            <p className="text-[11px] text-neutral-400 leading-relaxed">
              {user.status === "active"
                ? "کاربر به تمامی خدمات فروشگاهی، استعلام‌ها و ثبت سفارش دسترسی کامل دارد."
                : user.status === "pending_verification"
                ? "حساب کاربر در انتظار اعتبارسنجی اولیه است."
                : "دسترسی این کاربر به دلیل نقض قوانین یا به درخواست مدیر مسدود شده است."}
            </p>
          </div>

          <Button
            onClick={onToggleStatus}
            variant="outline"
            className={`w-full text-xs font-bold gap-2 ${
              user.status === "active"
                ? "border-red-500/30 text-red-400 hover:bg-red-500/10"
                : "border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
            }`}
          >
            {user.status === "active" ? (
              <>
                <Ban className="h-4 w-4" />
                <span>مسدودسازی حساب کاربری</span>
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
    </div>
  );
}
