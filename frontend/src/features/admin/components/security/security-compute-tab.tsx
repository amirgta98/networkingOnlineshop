"use client";

import * as React from "react";
import {
  Cpu,
  Database,
  HardDrive,
  Activity,
  Layers,
  Server,
  Zap,
  CheckCircle2,
  Clock,
  Gauge,
  Sparkles,
  ArrowRightLeft,
} from "lucide-react";
import { toPersianDigits } from "@/shared/lib/utils";
import type {
  HostRuntimeTelemetry,
  ClusterNodeTelemetry,
  DatabaseTelemetry,
} from "../../types/admin-security.types";

interface SecurityComputeTabProps {
  hostRuntime: HostRuntimeTelemetry | null;
  clusterNodes: ClusterNodeTelemetry[];
  databaseTelemetry: DatabaseTelemetry | null;
}

export function SecurityComputeTab({
  hostRuntime,
  clusterNodes,
  databaseTelemetry,
}: SecurityComputeTabProps) {
  const formatBytesToMb = (bytes: number) => {
    return (bytes / (1024 * 1024)).toFixed(0);
  };

  const formatBytesToGb = (bytes: number) => {
    return (bytes / (1024 * 1024 * 1024)).toFixed(1);
  };

  const formatSecondsToUptime = (seconds: number) => {
    const d = Math.floor(seconds / (3600 * 24));
    const h = Math.floor((seconds % (3600 * 24)) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (d > 0) return `${toPersianDigits(d)} روز و ${toPersianDigits(h)} ساعت`;
    if (h > 0) return `${toPersianDigits(h)} ساعت و ${toPersianDigits(m)} دقیقه`;
    return `${toPersianDigits(m)} دقیقه`;
  };

  return (
    <div className="space-y-8">
      {/* ------------------------------------------------------------------- */}
      {/* SECTION 1: DATABASE PERFORMANCE & TELEMETRY (پایگاه داده PostgreSQL)*/}
      {/* ------------------------------------------------------------------- */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">پایش عمیق پایگاه داده (PostgreSQL 16 HA Engine)</h2>
              <p className="text-xs text-zinc-400">اندازه‌گیری لحظه‌ای زمان پاسخگویی (Ping Latency)، استخر اتصالات و نرخ تراکنش‌ها</p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>استخر اتصالات سالم</span>
          </span>
        </div>

        {databaseTelemetry && (
          <div className="rounded-2xl border border-white/[0.08] bg-zinc-900/60 backdrop-blur-sm p-6 space-y-6">
            {/* Real-time DB Ping Metric Big Banner */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-zinc-950/80 rounded-xl p-4 border border-emerald-500/20 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs text-zinc-400 mb-1">
                    <span>زمان پاسخگویی واقعی (Ping)</span>
                    <Gauge className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold text-white">
                      {toPersianDigits(databaseTelemetry.pingLatencyMs)}
                    </span>
                    <span className="text-sm font-semibold text-emerald-400">میلی‌ثانیه</span>
                  </div>
                </div>
                <div className="w-full bg-zinc-800 h-1.5 rounded-full mt-3 overflow-hidden">
                  <div
                    className="bg-emerald-400 h-full rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, Math.max(10, databaseTelemetry.pingLatencyMs * 15))}%` }}
                  />
                </div>
              </div>

              <div className="bg-zinc-950/80 rounded-xl p-4 border border-white/[0.05] flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs text-zinc-400 mb-1">
                    <span>استخر اتصالات (Connection Pool)</span>
                    <Activity className="w-4 h-4 text-sky-400" />
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold text-white">
                      {toPersianDigits(databaseTelemetry.activeConnections)}
                    </span>
                    <span className="text-sm text-zinc-400">/ {toPersianDigits(databaseTelemetry.maxConnections)} اتصال</span>
                  </div>
                </div>
                <div className="w-full bg-zinc-800 h-1.5 rounded-full mt-3 overflow-hidden">
                  <div
                    className="bg-sky-400 h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${(databaseTelemetry.activeConnections / databaseTelemetry.maxConnections) * 100}%`,
                    }}
                  />
                </div>
              </div>

              <div className="bg-zinc-950/80 rounded-xl p-4 border border-white/[0.05] flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs text-zinc-400 mb-1">
                    <span>نرخ اصابت به کش حافظه</span>
                    <Sparkles className="w-4 h-4 text-purple-400" />
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold text-white">
                      {toPersianDigits(databaseTelemetry.cacheHitRatioPercent)}
                    </span>
                    <span className="text-sm font-semibold text-purple-400">درصد</span>
                  </div>
                </div>
                <div className="w-full bg-zinc-800 h-1.5 rounded-full mt-3 overflow-hidden">
                  <div
                    className="bg-purple-400 h-full rounded-full"
                    style={{ width: `${databaseTelemetry.cacheHitRatioPercent}%` }}
                  />
                </div>
              </div>

              <div className="bg-zinc-950/80 rounded-xl p-4 border border-white/[0.05] flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs text-zinc-400 mb-1">
                    <span>نرخ تراکنش در ثانیه (TPS)</span>
                    <ArrowRightLeft className="w-4 h-4 text-orange-400" />
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold text-white">
                      {toPersianDigits(databaseTelemetry.transactionsPerSecond)}
                    </span>
                    <span className="text-sm text-zinc-400">req/s</span>
                  </div>
                </div>
                <span className="text-[11px] text-zinc-400 mt-2 block">
                  تاخیر تکثیر نسخه پشتیبان: {toPersianDigits(databaseTelemetry.replicationLagMs)}ms
                </span>
              </div>
            </div>

            {/* Additional Engine Details */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-zinc-300 border-t border-white/[0.06] pt-4">
              <div>
                <span className="text-[11px] text-zinc-400 block">نسخه موتور دیتابیس:</span>
                <span className="font-semibold text-white">{databaseTelemetry.engine}</span>
              </div>
              <div>
                <span className="text-[11px] text-zinc-400 block">اتصالات آماده (Idle):</span>
                <span className="font-semibold text-white">{toPersianDigits(databaseTelemetry.idleConnections)} کانکشن</span>
              </div>
              <div>
                <span className="text-[11px] text-zinc-400 block">کوئری‌های کند (Slow Queries &gt; 100ms):</span>
                <span className="font-semibold text-emerald-400">{toPersianDigits(databaseTelemetry.slowQueries24h)} کوئری</span>
              </div>
              <div>
                <span className="text-[11px] text-zinc-400 block">تعداد جداول پلتفرم:</span>
                <span className="font-semibold text-white">{toPersianDigits(databaseTelemetry.tableCount)} جدول فعال</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------------- */}
      {/* SECTION 2: LIVE HOST & PROCESS RUNTIME (پروسس واقعی سرور و هاست)    */}
      {/* ------------------------------------------------------------------- */}
      {hostRuntime && (
        <div className="space-y-4 pt-4 border-t border-white/[0.08]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">تلمتری لحظه‌ای پروسس بک‌اند و هاست سیستم</h2>
              <p className="text-xs text-zinc-400">
                مقادیر خوانده‌شده مستقیم از هسته سیستم‌عامل و رانتایم Node.js {hostRuntime.nodeVersion}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Heap Memory */}
            <div className="rounded-2xl border border-white/[0.08] bg-zinc-900/60 p-5 space-y-3">
              <div className="flex items-center justify-between text-xs text-zinc-400">
                <span>مصرف حافظه Heap پروسس</span>
                <span className="text-white font-bold">
                  {toPersianDigits(formatBytesToMb(hostRuntime.processHeapUsedBytes))} /{" "}
                  {toPersianDigits(formatBytesToMb(hostRuntime.processHeapTotalBytes))} MB
                </span>
              </div>
              <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-purple-500 h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${(hostRuntime.processHeapUsedBytes / hostRuntime.processHeapTotalBytes) * 100}%`,
                  }}
                />
              </div>
              <p className="text-[11px] text-zinc-400">
                حافظه فیزیکی رزرو شده (RSS): {toPersianDigits(formatBytesToMb(hostRuntime.processRssBytes))} مگابایت
              </p>
            </div>

            {/* Host Total RAM */}
            <div className="rounded-2xl border border-white/[0.08] bg-zinc-900/60 p-5 space-y-3">
              <div className="flex items-center justify-between text-xs text-zinc-400">
                <span>مصرف کل RAM سرور هاست</span>
                <span className="text-white font-bold">
                  {toPersianDigits(hostRuntime.osUsedMemPercent)}٪ ({toPersianDigits(formatBytesToGb(hostRuntime.osTotalMemBytes - hostRuntime.osFreeMemBytes))} GB)
                </span>
              </div>
              <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                  style={{ width: `${hostRuntime.osUsedMemPercent}%` }}
                />
              </div>
              <p className="text-[11px] text-zinc-400">
                کل رم هاست: {toPersianDigits(formatBytesToGb(hostRuntime.osTotalMemBytes))} گیگابایت | رم آزاد:{" "}
                {toPersianDigits(formatBytesToGb(hostRuntime.osFreeMemBytes))} GB
              </p>
            </div>

            {/* CPU Model & Load Average */}
            <div className="rounded-2xl border border-white/[0.08] bg-zinc-900/60 p-5 space-y-2">
              <span className="text-xs text-zinc-400 block">پردازنده و میانگین بار پردازشی</span>
              <div className="text-sm font-semibold text-white truncate" title={hostRuntime.cpuModel}>
                {hostRuntime.cpuModel}
              </div>
              <div className="text-xs text-zinc-300 pt-1 flex items-center justify-between">
                <span>تعداد هسته‌ها: {toPersianDigits(hostRuntime.cpuCount)} هسته</span>
                <span>آپ‌تایم: {formatSecondsToUptime(hostRuntime.uptimeSeconds)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------- */}
      {/* SECTION 3: CLUSTER NODES MONITORING (نودهای کلاستر زیرساخت)         */}
      {/* ------------------------------------------------------------------- */}
      <div className="space-y-4 pt-4 border-t border-white/[0.08]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400">
              <Server className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">مانیتورینگ کلاستر نودهای سیستم (Infrastructure Nodes)</h2>
              <p className="text-xs text-zinc-400">توزیع بار میان Gateway، هسته NestJS، فرانت‌اند Next.js و ورکرها</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {clusterNodes.map((node) => {
            const cpuColor =
              node.cpuUsagePercent > 75
                ? "bg-rose-500"
                : node.cpuUsagePercent > 50
                ? "bg-amber-500"
                : "bg-emerald-500";
            const ramColor =
              node.ramUsagePercent > 80
                ? "bg-rose-500"
                : node.ramUsagePercent > 60
                ? "bg-amber-500"
                : "bg-purple-500";

            return (
              <div
                key={node.id}
                className="rounded-2xl border border-white/[0.08] bg-zinc-900/60 backdrop-blur-sm p-5 space-y-4 hover:border-white/20 transition-colors"
              >
                {/* Node Header */}
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <span className="text-sm font-bold text-white block">{node.name}</span>
                    <span className="text-xs text-zinc-400 block">{node.role}</span>
                  </div>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>سالم</span>
                  </span>
                </div>

                {/* Progress Bars for CPU & RAM */}
                <div className="space-y-3 bg-zinc-950/60 p-3 rounded-xl border border-white/[0.04]">
                  {/* CPU Load */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-zinc-400">بار پردازشی CPU:</span>
                      <span className="font-bold text-white">{toPersianDigits(node.cpuUsagePercent)}٪</span>
                    </div>
                    <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${cpuColor}`}
                        style={{ width: `${node.cpuUsagePercent}%` }}
                      />
                    </div>
                  </div>

                  {/* RAM Load */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-zinc-400">مصرف حافظه RAM:</span>
                      <span className="font-bold text-white">
                        {toPersianDigits(node.ramUsedGb)} / {toPersianDigits(node.ramTotalGb)} GB ({toPersianDigits(node.ramUsagePercent)}٪)
                      </span>
                    </div>
                    <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${ramColor}`}
                        style={{ width: `${node.ramUsagePercent}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Node Bottom Telemetry */}
                <div className="grid grid-cols-2 gap-2 text-xs text-zinc-400 border-t border-white/[0.06] pt-3">
                  <div>
                    <span>آی‌پی داخلی: </span>
                    <span className="text-zinc-200 font-mono">{node.ip}</span>
                  </div>
                  <div>
                    <span>دیسک NVMe: </span>
                    <span className="text-zinc-200">{toPersianDigits(node.diskUsagePercent)}٪ ({toPersianDigits(node.iops)} IOPS)</span>
                  </div>
                  <div>
                    <span>کانکشن‌ها: </span>
                    <span className="text-zinc-200">{toPersianDigits(node.activeConnections ?? 0)}</span>
                  </div>
                  <div>
                    <span>آپ‌تایم نود: </span>
                    <span className="text-zinc-200">{node.uptime}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
