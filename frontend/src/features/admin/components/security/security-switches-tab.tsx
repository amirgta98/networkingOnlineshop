"use client";

import * as React from "react";
import { useState } from "react";
import {
  Server,
  Network,
  Activity,
  Cpu,
  Thermometer,
  Zap,
  CheckCircle2,
  AlertTriangle,
  ArrowDownLeft,
  ArrowUpRight,
  Radio,
  Sliders,
  Layers,
  Info,
} from "lucide-react";
import { toPersianDigits } from "@/shared/lib/utils";
import type {
  CoreSwitchTelemetry,
  NetworkUplinkTelemetry,
  SwitchPortInfo,
} from "../../types/admin-security.types";

interface SecuritySwitchesTabProps {
  switches: CoreSwitchTelemetry[];
  uplinks: NetworkUplinkTelemetry[];
}

export function SecuritySwitchesTab({ switches, uplinks }: SecuritySwitchesTabProps) {
  const [selectedSwitchId, setSelectedSwitchId] = useState<string>(switches[0]?.id || "SW-CORE-01-N9K");
  const [selectedPort, setSelectedPort] = useState<SwitchPortInfo | null>(null);

  const activeSwitch = switches.find((s) => s.id === selectedSwitchId) || switches[0];

  return (
    <div className="space-y-8">
      {/* ------------------------------------------------------------------- */}
      {/* SECTION 1: NETWORK UPLINKS MONITORING (آپلینک‌های فیبر نوری دیتاسنتر) */}
      {/* ------------------------------------------------------------------- */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
              <Network className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">پایش آپلینک‌های شبکه و ترانزیت دیتاسنتر</h2>
              <p className="text-xs text-zinc-400">اتصال مستقیم فیبر نوری به IXP تهران، رینگ مترو آسیاتک و ترانزیت ابری</p>
            </div>
          </div>
          <span className="text-xs text-zinc-400">
            ظرفیت کل تجمیعی: <strong className="text-sky-400 font-semibold">{toPersianDigits(240)} Gbps</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {uplinks.map((uplink) => {
            const isStandby = uplink.status === "STANDBY";
            const utilColor =
              uplink.utilizationPercent > 80
                ? "bg-rose-500"
                : uplink.utilizationPercent > 50
                ? "bg-amber-500"
                : "bg-emerald-500";

            return (
              <div
                key={uplink.id}
                className={`rounded-2xl border p-5 transition-all bg-zinc-900/60 backdrop-blur-sm ${
                  isStandby
                    ? "border-white/[0.06] opacity-80"
                    : "border-white/[0.08] hover:border-sky-500/30"
                }`}
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white">{uplink.name}</span>
                    </div>
                    <p className="text-[11px] text-zinc-400 truncate">{uplink.provider}</p>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      isStandby
                        ? "bg-zinc-800 text-zinc-300 border border-zinc-700"
                        : "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${isStandby ? "bg-zinc-400" : "bg-emerald-400 animate-pulse"}`} />
                    {isStandby ? "رزرو (Standby)" : "مسیر فعال (Active)"}
                  </span>
                </div>

                {/* Throughput & Utilization Gauge */}
                <div className="space-y-2 mb-5 bg-zinc-950/60 rounded-xl p-3 border border-white/[0.04]">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-400">ترافیک مصرفی:</span>
                    <span className="text-white font-bold">
                      {toPersianDigits(uplink.currentThroughputGbps)} / {toPersianDigits(uplink.capacityGbps)} Gbps
                      <span className="text-zinc-400 text-[11px] mr-1">({toPersianDigits(uplink.utilizationPercent)}٪)</span>
                    </span>
                  </div>

                  <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${utilColor}`}
                      style={{ width: `${Math.min(100, uplink.utilizationPercent)}%` }}
                    />
                  </div>

                  {/* Rx / Tx Split */}
                  <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
                    <div className="flex items-center gap-1.5 text-emerald-400">
                      <ArrowDownLeft className="w-3.5 h-3.5" />
                      <span className="text-[11px] text-zinc-400">دریافت (Rx):</span>
                      <span className="font-semibold">{toPersianDigits(uplink.rxThroughputGbps)} G</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-sky-400">
                      <ArrowUpRight className="w-3.5 h-3.5" />
                      <span className="text-[11px] text-zinc-400">ارسال (Tx):</span>
                      <span className="font-semibold">{toPersianDigits(uplink.txThroughputGbps)} G</span>
                    </div>
                  </div>
                </div>

                {/* BGP & Telemetry Details */}
                <div className="grid grid-cols-2 gap-2.5 text-xs text-zinc-300 border-t border-white/[0.06] pt-3">
                  <div>
                    <span className="text-[11px] text-zinc-400 block">پروتکل مسیریابی:</span>
                    <span className="font-medium text-white">BGP AS{toPersianDigits(uplink.bgpAsn)}</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-zinc-400 block">پیشوندها (Prefixes):</span>
                    <span className="font-medium text-white">{toPersianDigits(uplink.receivedPrefixes)} مسیر</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-zinc-400 block">تاخیر رفت‌وبرگشت (RTT):</span>
                    <span className="font-medium text-emerald-400">{toPersianDigits(uplink.latencyMs)} میلی‌ثانیه</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-zinc-400 block">توان اپتیکال (Rx dBm):</span>
                    <span className="font-medium text-sky-400">{toPersianDigits(uplink.transceiver.rxDbm)} dBm</span>
                  </div>
                </div>

                {/* Mini Throughput Sparkline */}
                {uplink.history && uplink.history.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-white/[0.04]">
                    <span className="text-[10px] text-zinc-400 block mb-1.5">تاریخچه روند ترافیک (۱۵ نقطه اخیر):</span>
                    <div className="flex items-end gap-1 h-8 w-full">
                      {uplink.history.map((h, idx) => {
                        const total = h.rx + h.tx;
                        const heightPct = Math.min(100, Math.max(15, (total / uplink.capacityGbps) * 100));
                        return (
                          <div
                            key={idx}
                            title={`${h.time}: ${toPersianDigits(total.toFixed(1))} Gbps`}
                            className="flex-1 bg-sky-500/30 hover:bg-sky-400 rounded-t transition-colors cursor-pointer"
                            style={{ height: `${heightPct}%` }}
                          />
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ------------------------------------------------------------------- */}
      {/* SECTION 2: DATACENTER CORE SWITCHES (سوییچ‌های Core دیتاسنتر)         */}
      {/* ------------------------------------------------------------------- */}
      <div className="space-y-4 pt-4 border-t border-white/[0.08]">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Server className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">سوییچ‌های Core و Spine/Leaf دیتاسنتر</h2>
              <p className="text-xs text-zinc-400">پایش بلادرنگ وضعیت سخت‌افزار، سلامت پاورها، دمای ASIC و ماتریس پورت‌ها</p>
            </div>
          </div>

          {/* Switch Selector Tabs */}
          <div className="flex items-center gap-1.5 bg-zinc-900/80 p-1 rounded-xl border border-white/[0.08] overflow-x-auto">
            {switches.map((sw) => (
              <button
                key={sw.id}
                type="button"
                onClick={() => {
                  setSelectedSwitchId(sw.id);
                  setSelectedPort(null);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                  selectedSwitchId === sw.id
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                {sw.id}
              </button>
            ))}
          </div>
        </div>

        {/* Active Switch Detailed Inspector */}
        {activeSwitch && (
          <div className="rounded-2xl border border-white/[0.08] bg-zinc-900/60 backdrop-blur-sm p-6 space-y-6">
            {/* Switch Hardware Banner */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-white/[0.08]">
              <div className="space-y-1">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h3 className="text-lg font-bold text-white">{activeSwitch.name}</h3>
                  <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                    لایه {activeSwitch.role} (Active)
                  </span>
                  <span className="text-xs text-zinc-400">رک: {activeSwitch.rack}</span>
                </div>
                <p className="text-xs text-zinc-400 font-mono">{activeSwitch.model}</p>
              </div>

              {/* Hardware Quick Indicators */}
              <div className="flex items-center gap-4 flex-wrap text-xs">
                <div className="flex items-center gap-1.5 bg-zinc-950/60 px-3 py-1.5 rounded-xl border border-white/[0.05]">
                  <Thermometer className="w-4 h-4 text-emerald-400" />
                  <span className="text-zinc-400">دمای چیپست:</span>
                  <span className="text-white font-semibold">{toPersianDigits(activeSwitch.temperatureC)}°C</span>
                </div>

                <div className="flex items-center gap-1.5 bg-zinc-950/60 px-3 py-1.5 rounded-xl border border-white/[0.05]">
                  <Radio className="w-4 h-4 text-sky-400" />
                  <span className="text-zinc-400">دور فن:</span>
                  <span className="text-white font-semibold">{toPersianDigits(activeSwitch.fanRpm)} RPM</span>
                </div>

                <div className="flex items-center gap-1.5 bg-zinc-950/60 px-3 py-1.5 rounded-xl border border-white/[0.05]">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span className="text-zinc-400">پاور دوگانه:</span>
                  <span className="text-emerald-400 font-semibold">Active Redundant</span>
                </div>

                <div className="flex items-center gap-1.5 bg-zinc-950/60 px-3 py-1.5 rounded-xl border border-white/[0.05]">
                  <Activity className="w-4 h-4 text-purple-400" />
                  <span className="text-zinc-400">آپ‌تایم:</span>
                  <span className="text-zinc-200">{activeSwitch.uptime}</span>
                </div>
              </div>
            </div>

            {/* Backplane & Traffic Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="bg-zinc-950/60 p-3.5 rounded-xl border border-white/[0.04]">
                <span className="text-xs text-zinc-400 block mb-1">ظرفیت سوییچینگ (Backplane)</span>
                <span className="text-lg font-bold text-white">{toPersianDigits(activeSwitch.backplaneCapacityTbps)} Tbps</span>
                <span className="text-[10px] text-zinc-400 block mt-0.5">Wire-Speed Non-Blocking</span>
              </div>
              <div className="bg-zinc-950/60 p-3.5 rounded-xl border border-white/[0.04]">
                <span className="text-xs text-zinc-400 block mb-1">ترافیک لحظه‌ای کل</span>
                <span className="text-lg font-bold text-emerald-400">{toPersianDigits(activeSwitch.throughputGbps)} Gbps</span>
                <span className="text-[10px] text-zinc-400 block mt-0.5">نرخ پکت: 48 Mpps</span>
              </div>
              <div className="bg-zinc-950/60 p-3.5 rounded-xl border border-white/[0.04]">
                <span className="text-xs text-zinc-400 block mb-1">اشغال بافر پکت‌ها</span>
                <span className="text-lg font-bold text-sky-400">{toPersianDigits(activeSwitch.bufferUtilizationPercent)}٪</span>
                <span className="text-[10px] text-zinc-400 block mt-0.5">Deep Buffer 32MB Shared</span>
              </div>
              <div className="bg-zinc-950/60 p-3.5 rounded-xl border border-white/[0.04]">
                <span className="text-xs text-zinc-400 block mb-1">پورت‌های فعال / کل</span>
                <span className="text-lg font-bold text-white">
                  {toPersianDigits(activeSwitch.portsUp)} / {toPersianDigits(activeSwitch.portsTotal)}
                </span>
                <span className="text-[10px] text-emerald-400 block mt-0.5">
                  {toPersianDigits(activeSwitch.portsTotal - activeSwitch.portsUp)} پورت آزاد
                </span>
              </div>
            </div>

            {/* ------------------------------------------------------------------- */}
            {/* INTERACTIVE HARDWARE PORT MATRIX (ماتریس بصری پورت‌های سوییچ)          */}
            {/* ------------------------------------------------------------------- */}
            <div className="space-y-3 pt-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold text-white">ماتریس پورت‌های سخت‌افزاری سوییچ (Port Density Matrix)</span>
                </div>

                <div className="flex items-center gap-3 text-[11px] text-zinc-400 flex-wrap">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded bg-emerald-500" />
                    <span>متصل (UP)</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded bg-amber-500" />
                    <span>هشدار (Warning)</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded bg-zinc-700" />
                    <span>قطع/غیرفعال (Down)</span>
                  </span>
                </div>
              </div>

              {/* Ports Visual Grid */}
              <div className="bg-zinc-950 p-4 rounded-xl border border-white/[0.06] overflow-x-auto">
                <div className="grid grid-cols-6 sm:grid-cols-9 md:grid-cols-12 lg:grid-cols-18 gap-2 min-w-[560px]">
                  {activeSwitch.ports.map((port) => {
                    const isSelected = selectedPort?.id === port.id;
                    const statusColor =
                      port.status === "UP"
                        ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40 hover:bg-emerald-500/30"
                        : port.status === "WARNING"
                        ? "bg-amber-500/20 text-amber-400 border-amber-500/40 hover:bg-amber-500/30"
                        : "bg-zinc-800/40 text-zinc-500 border-zinc-700/50 hover:bg-zinc-800";

                    return (
                      <button
                        key={port.id}
                        type="button"
                        onClick={() => setSelectedPort(port)}
                        className={`flex flex-col items-center justify-center p-2 rounded-lg border text-center transition-all ${statusColor} ${
                          isSelected ? "ring-2 ring-emerald-400 ring-offset-2 ring-offset-zinc-950" : ""
                        }`}
                        title={`${port.id} - ${port.status} (${port.speedGbps}G)`}
                      >
                        <span className="text-[10px] font-mono font-bold leading-tight">
                          {port.id.replace(/(QSFP28|SFP28)\s*/, "")}
                        </span>
                        <span className="w-1.5 h-1.5 rounded-full mt-1 bg-current" />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Selected Port Live Telemetry Card */}
              {selectedPort && (
                <div className="bg-zinc-950/90 rounded-xl border border-emerald-500/30 p-4 space-y-3 animate-in fade-in">
                  <div className="flex items-center justify-between border-b border-white/[0.08] pb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-emerald-400">اطلاعات زنده پورت {selectedPort.id}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 font-mono">
                        {selectedPort.type}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedPort(null)}
                      className="text-xs text-zinc-400 hover:text-white"
                    >
                      بستن
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div>
                      <span className="text-[11px] text-zinc-400 block">وضعیت لینک:</span>
                      <span className="font-semibold text-white">
                        {selectedPort.status === "UP" ? "فعال (100G Full-Duplex)" : "قطع (Link Down)"}
                      </span>
                    </div>
                    <div>
                      <span className="text-[11px] text-zinc-400 block">پیر یا سرور متصل:</span>
                      <span className="font-mono text-emerald-300">{selectedPort.connectedTo || "آزاد"}</span>
                    </div>
                    <div>
                      <span className="text-[11px] text-zinc-400 block">ترافیک Rx / Tx:</span>
                      <span className="text-white">
                        {toPersianDigits(selectedPort.rxGbps)}G / {toPersianDigits(selectedPort.txGbps)}G
                      </span>
                    </div>
                    <div>
                      <span className="text-[11px] text-zinc-400 block">توان اپتیکال ماژول:</span>
                      <span className="text-sky-400 font-mono">
                        {selectedPort.opticPowerDbm ? `${toPersianDigits(selectedPort.opticPowerDbm)} dBm` : "---"}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
