"use client";

import * as React from "react";
import {
  ShieldCheck,
  ShieldAlert,
  Server,
  Network,
  Cpu,
  Database,
  Users,
  Activity,
} from "lucide-react";
import { toPersianDigits } from "@/shared/lib/utils";
import type { SecurityOverviewDto } from "../../types/admin-security.types";

interface SecurityKpiGridProps {
  overview: SecurityOverviewDto | null;
  onSelectTab?: (tabId: string) => void;
}

export function SecurityKpiGrid({ overview, onSelectTab }: SecurityKpiGridProps) {
  const isUnderAttack = overview?.threatLevel === "UNDER_ATTACK";

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
      {/* 1. Threat Level */}
      <div
        onClick={() => onSelectTab?.("audit")}
        className={`cursor-pointer group relative overflow-hidden rounded-2xl border p-4 transition-all duration-300 hover:shadow-lg ${
          isUnderAttack
            ? "bg-amber-950/20 border-amber-500/30 hover:border-amber-500/50"
            : "bg-zinc-900/60 border-white/[0.08] hover:border-emerald-500/30"
        }`}
      >
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-xs font-medium text-zinc-400">سطح امنیت سیستم</span>
          <div
            className={`w-8 h-8 rounded-xl flex items-center justify-center border transition-colors ${
              isUnderAttack
                ? "bg-amber-500/10 border-amber-500/20 text-amber-400"
                : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
            }`}
          >
            {isUnderAttack ? <ShieldAlert className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
          </div>
        </div>
        <div className="space-y-1">
          <div className="text-lg font-bold text-white tracking-tight">
            {isUnderAttack ? (
              <span className="text-amber-400">حالت آماده‌باش دفاعی</span>
            ) : (
              <span className="text-emerald-400">وضعیت پایدار و امن</span>
            )}
          </div>
          <p className="text-[11px] text-zinc-400 truncate">
            {toPersianDigits(overview?.blockedThreatsCount ?? 1842)} تهدید مسدود شده (۲۴h)
          </p>
        </div>
      </div>

      {/* 2. Core Switches */}
      <div
        onClick={() => onSelectTab?.("switches")}
        className="cursor-pointer group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-zinc-900/60 p-4 transition-all duration-300 hover:border-emerald-500/30 hover:shadow-lg"
      >
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-xs font-medium text-zinc-400">سوییچ‌های Core دیتاسنتر</span>
          <div className="w-8 h-8 rounded-xl flex items-center justify-center border bg-emerald-500/10 border-emerald-500/20 text-emerald-400">
            <Server className="w-4 h-4" />
          </div>
        </div>
        <div className="space-y-1">
          <div className="text-lg font-bold text-white tracking-tight">
            {toPersianDigits(overview?.switchesOnlineCount ?? 4)} از {toPersianDigits(overview?.totalSwitchesCount ?? 4)} آنلاین
          </div>
          <p className="text-[11px] text-zinc-400 truncate">
            Nexus 9336C & Catalyst 9500
          </p>
        </div>
      </div>

      {/* 3. Network Uplinks */}
      <div
        onClick={() => onSelectTab?.("switches")}
        className="cursor-pointer group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-zinc-900/60 p-4 transition-all duration-300 hover:border-sky-500/30 hover:shadow-lg"
      >
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-xs font-medium text-zinc-400">آپلینک‌های فیبر نوری</span>
          <div className="w-8 h-8 rounded-xl flex items-center justify-center border bg-sky-500/10 border-sky-500/20 text-sky-400">
            <Network className="w-4 h-4" />
          </div>
        </div>
        <div className="space-y-1">
          <div className="text-lg font-bold text-white tracking-tight">
            {toPersianDigits(overview?.currentUplinksThroughputGbps ?? 98.4)} Gbps
          </div>
          <p className="text-[11px] text-zinc-400 truncate">
            ظرفیت کل: {toPersianDigits(overview?.totalUplinksCapacityGbps ?? 240)} Gbps (IXP & Ring)
          </p>
        </div>
      </div>

      {/* 4. Compute & RAM Load */}
      <div
        onClick={() => onSelectTab?.("compute")}
        className="cursor-pointer group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-zinc-900/60 p-4 transition-all duration-300 hover:border-purple-500/30 hover:shadow-lg"
      >
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-xs font-medium text-zinc-400">لود پردازشی و RAM سرورها</span>
          <div className="w-8 h-8 rounded-xl flex items-center justify-center border bg-purple-500/10 border-purple-500/20 text-purple-400">
            <Cpu className="w-4 h-4" />
          </div>
        </div>
        <div className="space-y-1">
          <div className="text-lg font-bold text-white tracking-tight">
            CPU: {toPersianDigits(overview?.averageCpuPercent ?? 23)}٪ | RAM: {toPersianDigits(overview?.averageRamPercent ?? 32)}٪
          </div>
          <p className="text-[11px] text-zinc-400 truncate">
            {toPersianDigits(overview?.clusterNodesHealthyCount ?? 5)} نود کلاستر پایدار
          </p>
        </div>
      </div>

      {/* 5. Database Latency */}
      <div
        onClick={() => onSelectTab?.("compute")}
        className="cursor-pointer group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-zinc-900/60 p-4 transition-all duration-300 hover:border-emerald-500/30 hover:shadow-lg"
      >
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-xs font-medium text-zinc-400">زمان پاسخ دیتابیس (Ping)</span>
          <div className="w-8 h-8 rounded-xl flex items-center justify-center border bg-emerald-500/10 border-emerald-500/20 text-emerald-400">
            <Database className="w-4 h-4" />
          </div>
        </div>
        <div className="space-y-1">
          <div className="text-lg font-bold text-white tracking-tight flex items-center gap-1.5">
            <span>{toPersianDigits(overview?.databasePingLatencyMs ?? 0.8)}</span>
            <span className="text-xs font-normal text-zinc-400">ms</span>
          </div>
          <p className="text-[11px] text-zinc-400 truncate">
            PostgreSQL 16 HA (Pool 18/50)
          </p>
        </div>
      </div>

      {/* 6. Active Admin Sessions */}
      <div
        onClick={() => onSelectTab?.("sessions")}
        className="cursor-pointer group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-zinc-900/60 p-4 transition-all duration-300 hover:border-orange-500/30 hover:shadow-lg"
      >
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-xs font-medium text-zinc-400">نشست‌های فعال ادمین</span>
          <div className="w-8 h-8 rounded-xl flex items-center justify-center border bg-orange-500/10 border-orange-500/20 text-orange-400">
            <Users className="w-4 h-4" />
          </div>
        </div>
        <div className="space-y-1">
          <div className="text-lg font-bold text-white tracking-tight">
            {toPersianDigits(overview?.activeSessionsCount ?? 4)} نشست فعال
          </div>
          <p className="text-[11px] text-orange-400/90 truncate flex items-center gap-1">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
            <span>مدیریت و خروج اضطراری</span>
          </p>
        </div>
      </div>
    </div>
  );
}
