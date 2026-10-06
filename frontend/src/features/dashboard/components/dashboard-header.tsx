"use client";

import * as React from "react";
import Link from "next/link";
import type { AuthUser } from "@/features/auth";
import { UserLevelBadge } from "./user-level-badge";
import {
  ShoppingBag,
  Building,
  LogOut,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";

interface DashboardHeaderProps {
  user: AuthUser | null;
  onLogout: () => void;
  isLoading?: boolean;
}

export function DashboardHeader({ user, onLogout, isLoading }: DashboardHeaderProps) {
  return (
    <div className="flex flex-col gap-6" dir="rtl">
      {/* Breadcrumb & Status */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-neutral-400">
          <Link href="/" className="hover:text-white transition-colors">
            خانه
          </Link>
          <span>/</span>
          <span className="text-[var(--theme-foreground)] font-semibold">
            داشبورد کاربری
          </span>
        </div>

        <div className="flex items-center gap-2">
          <UserLevelBadge role={user?.role} size="sm" />
        </div>
      </div>

      {/* Main Welcome Hero Card */}
      <div className="relative overflow-hidden rounded-3xl border border-[var(--theme-border-color)] bg-[var(--theme-surface)] p-6 sm:p-7 shadow-xl">
        <div className="absolute top-0 left-0 w-80 h-80 bg-orange-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          {/* User Info */}
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500/20 to-amber-500/10 border border-orange-500/30 text-orange-400 text-xl font-black shadow-md ring-2 ring-orange-500/20">
              {user?.name?.slice(0, 1) || "ک"}
            </div>

            <div className="flex flex-col gap-1 text-right">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-xl sm:text-2xl font-black text-[var(--theme-foreground)]">
                  خوش آمدید، {user?.name}
                </h1>
                <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                  حساب کاربری فعال
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-400 font-mono">
                <span>تلفن: {user?.phone}</span>
                {user?.email && <span>• ایمیل: {user?.email}</span>}
                <span>• تاریخ عضویت: {user?.createdAt || "۱۴۰۲"}</span>
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-2.5">
            <Link href="/products">
              <Button variant="default" className="gap-2 shadow-lg shadow-[var(--theme-primary)]/15">
                <ShoppingBag className="h-4 w-4" />
                <span>مشاهده کاتالوگ محصولات</span>
              </Button>
            </Link>

            {user?.role === "partner" && (
              <Link href="/partner">
                <Button variant="secondary" className="gap-2">
                  <Building className="h-4 w-4 text-sky-400" />
                  <span>ورود به پرتال سازمانی</span>
                </Button>
              </Link>
            )}

            {user?.role === "admin" && (
              <Link href="/admin">
                <Button variant="secondary" className="gap-2">
                  <ExternalLink className="h-4 w-4 text-emerald-400" />
                  <span>ورود به پنل ادمین</span>
                </Button>
              </Link>
            )}

            <Button
              variant="outline"
              onClick={onLogout}
              disabled={isLoading}
              className="gap-2 text-red-400 border-red-500/20 hover:bg-red-500/10 hover:text-red-300 hover:border-red-500/40 cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
              <span>خروج</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
