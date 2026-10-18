"use client";

import * as React from "react";
import Link from "next/link";
import type { AdminUser, AdminUserRole, AdminUserStatus } from "@/features/admin/types/admin-users.types";
import { formatPrice, toPersianDigits } from "@/shared/lib/utils";
import {
  ArrowRight,
  ShieldCheck,
  ShieldAlert,
  Lock,
  Pencil,
  KeyRound,
  Ban,
  CheckCircle2,
  Trash2,
  Sparkles,
  Phone,
  Mail,
  Building2,
  ShoppingBag,
  Wallet,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";

interface UserDetailHeaderProps {
  user: AdminUser;
  onEditUser: () => void;
  onChangeRole: () => void;
  onToggleStatus: () => void;
  onDeleteUser?: () => void;
}

export function UserDetailHeader({
  user,
  onEditUser,
  onChangeRole,
  onToggleStatus,
  onDeleteUser,
}: UserDetailHeaderProps) {
  const getRoleLabel = (role: AdminUserRole) => {
    switch (role) {
      case "admin":
        return "مدیر کل (Root)";
      case "partner_b2b":
        return "همکار تجاری (B2B)";
      case "customer":
      default:
        return "خریدار عادی";
    }
  };

  const hasSpecificName =
    Boolean(user.fullName) &&
    user.fullName.trim() !== "" &&
    user.fullName !== user.phone &&
    !/^[\s\?؟]+$/.test(user.fullName) &&
    !user.fullName.includes("***");
  const displayName = hasSpecificName ? user.fullName : (user.phone || "کاربر");
  const initial = hasSpecificName ? displayName.slice(0, 1) : "ک";

  return (
    <div className="flex flex-col gap-5" dir="rtl">
      {/* Top Breadcrumb & Back Link */}
      <div className="flex items-center justify-between">
        <Link
          href="/admin/users"
          className="inline-flex items-center gap-2 text-xs font-semibold text-neutral-400 hover:text-white transition-colors"
        >
          <ArrowRight className="h-4 w-4" />
          <span>بازگشت به فهرست کاربران</span>
        </Link>

        <span className="text-[11px] font-mono text-neutral-500" dir="ltr">
          ID: {user.id}
        </span>
      </div>

      {/* Main Identity Banner Card */}
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/80 p-5 sm:p-6 backdrop-blur-md flex flex-col lg:flex-row lg:items-center justify-between gap-6 shadow-xl">
        {/* Left: Avatar & User Info */}
        <div className="flex items-start sm:items-center gap-4">
          <div className="relative">
            <div className="flex h-16 w-16 sm:h-20 sm:w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500/25 via-emerald-600/15 to-emerald-950/40 border border-emerald-500/40 text-emerald-400 text-2xl font-black shadow-inner">
              {initial}
            </div>
            {user.userTier && (
              <span
                className={`absolute -bottom-2 -left-2 text-[10px] px-2 py-0.5 rounded-full border font-bold shadow-md ${
                  user.userTier === "gold"
                    ? "bg-amber-500 text-neutral-950 border-amber-400"
                    : user.userTier === "silver"
                    ? "bg-neutral-600 text-white border-neutral-500"
                    : "bg-orange-600 text-white border-orange-500"
                }`}
              >
                {user.userTier === "gold" ? "طلایی" : user.userTier === "silver" ? "نقره‌ای" : "برنزی"}
              </span>
            )}
          </div>

          <div className="flex flex-col gap-1.5 min-w-0">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-lg sm:text-xl font-black text-white tracking-tight">
                {displayName}
              </h1>

              {/* Status Badge */}
              <span
                className={`text-[10px] px-2.5 py-0.5 rounded-full border font-semibold ${
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

              {/* Role Badge */}
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-neutral-800 text-neutral-200 border border-neutral-700 font-medium">
                {getRoleLabel(user.role)}
              </span>

              {/* National code verification badge */}
              {user.nationalCodeVerified && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium flex items-center gap-1">
                  <ShieldCheck className="h-3 w-3" />
                  <span>شاهکار تایید</span>
                </span>
              )}
            </div>

            {/* Contact details */}
            <div className="flex items-center gap-3.5 text-xs text-neutral-400 mt-0.5 flex-wrap">
              <span className="flex items-center gap-1 font-mono text-neutral-300" dir="ltr">
                <Phone className="h-3.5 w-3.5 text-neutral-500" />
                {user.phone}
              </span>

              {user.email && (
                <span className="flex items-center gap-1 font-mono text-neutral-400" dir="ltr">
                  <Mail className="h-3.5 w-3.5 text-neutral-500" />
                  {user.email}
                </span>
              )}

              {user.companyName && (
                <span className="flex items-center gap-1 text-sky-400 font-medium">
                  <Building2 className="h-3.5 w-3.5" />
                  {user.companyName}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right: Actions Group */}
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            size="sm"
            variant="outline"
            onClick={onEditUser}
            className="text-xs h-9 gap-1.5 border-neutral-700 text-neutral-200 hover:bg-neutral-800"
          >
            <Pencil className="h-3.5 w-3.5 text-sky-400" />
            <span>ویرایش مشخصات</span>
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={onChangeRole}
            className="text-xs h-9 gap-1.5 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/10"
          >
            <KeyRound className="h-3.5 w-3.5" />
            <span>تغییر نقش</span>
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={onToggleStatus}
            className={`text-xs h-9 gap-1.5 ${
              user.status === "active"
                ? "border-red-500/30 text-red-400 hover:bg-red-500/10"
                : "border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
            }`}
          >
            {user.status === "active" ? (
              <>
                <Ban className="h-3.5 w-3.5" />
                <span>مسدودسازی</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>فعال‌سازی</span>
              </>
            )}
          </Button>

          {onDeleteUser && (
            <Button
              size="sm"
              variant="outline"
              onClick={onDeleteUser}
              className="text-xs h-9 px-3 border-red-500/20 text-red-400 hover:bg-red-500/10"
              title="حذف حساب کاربری"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
