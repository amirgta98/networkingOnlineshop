"use client";

import * as React from "react";
import {
  ShieldAlert,
  ShieldCheck,
  RefreshCw,
  Radio,
  OctagonAlert,
  Shield,
  Download,
  Ban,
} from "lucide-react";
import { toPersianDigits } from "@/shared/lib/utils";
import type { ConnectionStatus } from "../../hooks/use-security-stream";
import type { WafSecurityStatus } from "../../types/admin-security.types";

interface SecurityHeaderToolbarProps {
  connectionStatus: ConnectionStatus;
  pingMs: number;
  wafStatus: WafSecurityStatus | null;
  onRefresh: () => void;
  onToggleUnderAttack: (enabled: boolean) => void;
  onOpenEmergencyModal: () => void;
  onOpenBlockIpModal: () => void;
  onExportReport: () => void;
  isRefreshing?: boolean;
}

export function SecurityHeaderToolbar({
  connectionStatus,
  pingMs,
  wafStatus,
  onRefresh,
  onToggleUnderAttack,
  onOpenEmergencyModal,
  onOpenBlockIpModal,
  onExportReport,
  isRefreshing,
}: SecurityHeaderToolbarProps) {
  const isUnderAttack = wafStatus?.underAttackMode ?? false;

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between border-b border-white/[0.08] pb-6">
      {/* Title & Real-time Live Badge */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
              <Shield className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              مرکز عملیات امنیت و مانیتورینگ زیرساخت شبکه (NOC & SOC)
            </h1>
          </div>

          {/* Real-time Connection Status Indicator */}
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-medium bg-zinc-900 border border-white/10 text-zinc-300">
            {connectionStatus === "connected" ? (
              <>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                <span className="text-emerald-400 font-semibold">پایش بلادرنگ (Socket Live)</span>
                <span className="text-zinc-500">|</span>
                <span className="text-zinc-400">تاخیر: {toPersianDigits(pingMs)} میلی‌ثانیه</span>
              </>
            ) : connectionStatus === "polling" ? (
              <>
                <span className="inline-flex rounded-full h-2 w-2 bg-amber-400" />
                <span className="text-amber-400">استعلام دوره‌ای (Polling)</span>
              </>
            ) : (
              <>
                <span className="inline-flex rounded-full h-2 w-2 bg-zinc-500" />
                <span className="text-zinc-400">در حال اتصال...</span>
              </>
            )}
          </div>
        </div>

        <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed max-w-3xl">
          پایش بلادرنگ سوییچ‌های Core سیسکو و آریستا، وضعیت فیبر نوری و آپلینک‌ها، لود پردازشی کلاستر، زمان پاسخ پایگاه داده و مدیریت نشست‌های مدیران
        </p>
      </div>

      {/* Control Actions & Emergency Switch */}
      <div className="flex items-center gap-2.5 flex-wrap">
        {/* Quick Block IP */}
        <button
          type="button"
          onClick={onOpenBlockIpModal}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 border border-white/10 transition-colors"
          title="مسدودسازی سریع آی‌پی در فایروال"
        >
          <Ban className="w-3.5 h-3.5 text-zinc-400" />
          <span>مسدودسازی IP</span>
        </button>

        {/* Export Report */}
        <button
          type="button"
          onClick={onExportReport}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 border border-white/10 transition-colors"
          title="دریافت خروجی گزارش ممیزی"
        >
          <Download className="w-3.5 h-3.5 text-zinc-400" />
          <span className="hidden sm:inline">گزارش ممیزی</span>
        </button>

        {/* Refresh Button */}
        <button
          type="button"
          onClick={onRefresh}
          disabled={isRefreshing}
          className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 border border-white/10 transition-colors disabled:opacity-50"
          title="تازه‌سازی فوری داده‌ها"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin text-emerald-400" : ""}`} />
        </button>

        {/* Under Attack Mode Toggle */}
        <button
          type="button"
          onClick={() => onToggleUnderAttack(!isUnderAttack)}
          className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
            isUnderAttack
              ? "bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-[0_0_20px_rgba(245,158,11,0.25)] animate-pulse"
              : "bg-zinc-900/90 text-zinc-300 hover:text-white border-white/10 hover:border-amber-500/30"
          }`}
          title="فعال/غیرفعال‌سازی حالت آماده‌باش زیر حمله دیتاسنتر"
        >
          <ShieldAlert className={`w-4 h-4 ${isUnderAttack ? "text-amber-400" : "text-zinc-400"}`} />
          <span>{isUnderAttack ? "حالت زیر حمله (فعال)" : "حالت دفاعی (آماده)"}</span>
        </button>

        {/* Emergency Kill Switch Button */}
        <button
          type="button"
          onClick={onOpenEmergencyModal}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-rose-600/90 hover:bg-rose-500 text-white shadow-[0_0_20px_rgba(225,29,72,0.35)] hover:shadow-[0_0_25px_rgba(225,29,72,0.5)] transition-all active:scale-95"
          title="صدور فرمان خروج اضطراری کلی و ابطال نشست‌ها"
        >
          <OctagonAlert className="w-4 h-4 text-white animate-bounce" />
          <span>خروج اضطراری (Kill Switch)</span>
        </button>
      </div>
    </div>
  );
}
