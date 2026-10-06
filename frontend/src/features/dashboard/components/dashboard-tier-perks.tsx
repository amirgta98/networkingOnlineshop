"use client";

import * as React from "react";
import type { AuthUser } from "@/features/auth";
import type { DashboardPageKey } from "../types/dashboard.types";
import { getUserTierInfo } from "../data/dashboard-pages";
import {
  Sparkles,
  CheckCircle2,
  TrendingUp,
  Percent,
  Truck,
  Wallet,
  ShieldCheck,
  Building2,
  ChevronLeft,
} from "lucide-react";

interface DashboardTierPerksProps {
  user: AuthUser | null;
  onNavigatePage?: (pageKey: DashboardPageKey) => void;
}

export function DashboardTierPerks({ user, onNavigatePage }: DashboardTierPerksProps) {
  const tierInfo = getUserTierInfo(user);
  const isPartner = user?.role === "partner";
  const isAdmin = user?.role === "admin";
  const isCustomer = user?.role === "customer" || !user?.role;

  return (
    <div className="relative overflow-hidden rounded-3xl border border-[var(--theme-border-color)] bg-gradient-to-br from-[var(--theme-surface)] via-[var(--theme-surface)] to-[var(--theme-surface-alt)] p-6 sm:p-7 shadow-lg">
      {/* Decorative ambient glow */}
      <div
        className={`absolute -top-24 -left-24 h-72 w-72 rounded-full blur-3xl pointer-events-none opacity-20 ${
          isAdmin
            ? "bg-emerald-500"
            : isPartner
            ? "bg-sky-500"
            : "bg-orange-500"
        }`}
      />

      <div className="relative z-10 flex flex-col gap-6">
        {/* Tier Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--theme-border-color)] pb-5">
          <div className="flex items-center gap-3.5">
            <div
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border text-xl shadow-md ${
                isAdmin
                  ? "border-emerald-500/30 bg-emerald-500/15 text-emerald-400"
                  : isPartner
                  ? "border-sky-500/30 bg-sky-500/15 text-sky-400"
                  : "border-orange-500/30 bg-orange-500/15 text-orange-400"
              }`}
            >
              <Sparkles className="h-6 w-6" />
            </div>

            <div className="flex flex-col text-right">
              <div className="flex items-center gap-2">
                <span className="text-xs text-neutral-400 font-medium">سطح کاربری فعلی شما:</span>
                <span
                  className={`text-xs font-black px-2 py-0.5 rounded-full border ${
                    isAdmin
                      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                      : isPartner
                      ? "border-sky-500/30 bg-sky-500/10 text-sky-300"
                      : "border-orange-500/30 bg-orange-500/10 text-orange-300"
                  }`}
                >
                  {tierInfo.badgeLabel}
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-[var(--theme-foreground)] mt-0.5">
                {tierInfo.tierName}
              </h2>
            </div>
          </div>

          {/* Quick Metrics Chips */}
          <div className="grid grid-cols-2 sm:flex sm:items-center gap-2.5">
            <div className="flex items-center gap-2 rounded-xl border border-neutral-800 bg-neutral-900/60 px-3 py-2 text-right">
              <Percent className="h-4 w-4 text-emerald-400 shrink-0" />
              <div>
                <span className="block text-[10px] text-neutral-400">تخفیف پیش‌فرض</span>
                <span className="text-xs font-bold text-neutral-100 font-mono">
                  {tierInfo.discountRate}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 rounded-xl border border-neutral-800 bg-neutral-900/60 px-3 py-2 text-right">
              <Truck className="h-4 w-4 text-sky-400 shrink-0" />
              <div>
                <span className="block text-[10px] text-neutral-400">هزینه ارسال</span>
                <span className="text-xs font-bold text-neutral-100">
                  {isPartner ? "رایگان پروژه‌ای" : "بالای ۵ م.ت رایگان"}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 rounded-xl border border-neutral-800 bg-neutral-900/60 px-3 py-2 text-right">
              <Wallet className="h-4 w-4 text-amber-400 shrink-0" />
              <div>
                <span className="block text-[10px] text-neutral-400">وضعیت اعتبار</span>
                <span className="text-xs font-bold text-neutral-100 font-mono">
                  {isPartner ? "۵۰۰ م.ت مصوب" : "۲.۴۵ م.ت هدیه"}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 rounded-xl border border-neutral-800 bg-neutral-900/60 px-3 py-2 text-right">
              <ShieldCheck className="h-4 w-4 text-purple-400 shrink-0" />
              <div>
                <span className="block text-[10px] text-neutral-400">گارانتی محصولات</span>
                <span className="text-xs font-bold text-neutral-100">
                  {tierInfo.warrantyText}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Perks Checklist */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-neutral-300">
              مزایا و اختیارات فعال برای سطح شما در این سامانه:
            </h3>
            <span className="text-[11px] text-neutral-500 font-mono">
              {tierInfo.perks.length} مزیت فعال
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {tierInfo.perks.map((perk, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2.5 rounded-2xl border border-neutral-800/80 bg-neutral-900/40 p-3 hover:border-neutral-700/80 transition-colors text-right"
              >
                <div
                  className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-lg border ${
                    isAdmin
                      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                      : isPartner
                      ? "border-sky-500/30 bg-sky-500/10 text-sky-400"
                      : "border-orange-500/30 bg-orange-500/10 text-orange-400"
                  }`}
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                </div>
                <span className="text-xs font-medium text-neutral-200 leading-relaxed">
                  {perk}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Next Tier Progress / Upgrade CTA */}
        {tierInfo.nextTierGoal && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-neutral-800 bg-neutral-950/60 p-4">
            <div className="flex flex-col gap-1.5 flex-1">
              <div className="flex items-center justify-between text-xs font-bold text-neutral-300">
                <span className="flex items-center gap-1.5">
                  <TrendingUp className="h-3.5 w-3.5 text-orange-400" />
                  <span>هدف ارتقا: {tierInfo.nextTierGoal}</span>
                </span>
                <span className="font-mono text-orange-400">
                  {tierInfo.nextTierProgressPercent}%
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-neutral-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-orange-500 to-amber-400 transition-all duration-500"
                  style={{ width: `${tierInfo.nextTierProgressPercent}%` }}
                />
              </div>
            </div>

            {isCustomer && onNavigatePage && (
              <button
                type="button"
                onClick={() => onNavigatePage("upgrade-partner")}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-sky-500/30 bg-sky-500/10 px-3.5 py-2 text-xs font-bold text-sky-300 hover:bg-sky-500/20 hover:border-sky-500/50 transition-colors shrink-0 cursor-pointer"
              >
                <Building2 className="h-3.5 w-3.5" />
                <span>درخواست ارتقا به همکار حقوقی (B2B)</span>
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
