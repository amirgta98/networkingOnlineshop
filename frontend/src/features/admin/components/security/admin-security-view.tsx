"use client";

import * as React from "react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Server,
  Cpu,
  Terminal,
  Users,
  AlertCircle,
  CheckCircle2,
  Bell,
  ShieldCheck,
} from "lucide-react";
import { toPersianDigits } from "@/shared/lib/utils";
import { useSecurityStream } from "../../hooks/use-security-stream";
import { SecurityHeaderToolbar } from "./security-header-toolbar";
import { SecurityKpiGrid } from "./security-kpi-grid";
import { SecuritySwitchesTab } from "./security-switches-tab";
import { SecurityComputeTab } from "./security-compute-tab";
import { SecurityAuditLogsTab } from "./security-audit-logs-tab";
import { SecuritySessionsTab } from "./security-sessions-tab";
import { EmergencyKillModal } from "./emergency-kill-modal";
import { BlockIpModal } from "./block-ip-modal";
import { LogDetailDrawer } from "./log-detail-drawer";
import type { SecurityAuditLog } from "../../types/admin-security.types";

export function AdminSecurityView() {
  const {
    overview,
    telemetry,
    auditLogs,
    sessions,
    isLoading,
    connectionStatus,
    pingMs,
    isStreamPaused,
    setIsStreamPaused,
    lastRevokedAlert,
    refreshAll,
    revokeSession,
    emergencyKill,
    toggleUnderAttackMode,
    blockIp,
    clearLogs,
  } = useSecurityStream();

  const [activeTab, setActiveTab] = useState<"switches" | "compute" | "audit" | "sessions">("switches");
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);
  const [isBlockIpModalOpen, setIsBlockIpModalOpen] = useState(false);
  const [selectedAuditLog, setSelectedAuditLog] = useState<SecurityAuditLog | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleRevokeSession = async (sessionId: string) => {
    try {
      const res = await revokeSession(sessionId);
      showToast(res.message || "نشست با موفقیت باطل شد.");
    } catch {
      showToast("خطا در ابطال نشست");
    }
  };

  const handleEmergencyKill = async (options: {
    excludeCurrentSession: boolean;
    reason: string;
  }) => {
    try {
      const currentSessionId = sessions.find((s) => s.isCurrent)?.id;
      const res = await emergencyKill({
        excludeCurrentSession: options.excludeCurrentSession,
        currentSessionId,
        reason: options.reason,
      });
      showToast(res.message);
    } catch {
      showToast("خطا در صدور فرمان خروج اضطراری");
    }
  };

  const handleToggleUnderAttack = async (enabled: boolean) => {
    try {
      await toggleUnderAttackMode(enabled);
      showToast(
        enabled
          ? "حالت آماده‌باش دفاعی (Under Attack Mode) فعال شد!"
          : "حالت عادی دیتاسنتر بازیابی گردید.",
      );
    } catch {
      showToast("خطا در تغییر وضعیت امنیتی WAF");
    }
  };

  const handleBlockIp = async (ip: string, reason: string) => {
    try {
      const res = await blockIp(ip, reason);
      showToast(res.message);
    } catch {
      showToast("خطا در مسدودسازی آدرس IP");
    }
  };

  const handleExportFullReport = () => {
    const reportData = {
      timestamp: new Date().toISOString(),
      overview,
      telemetry,
      sessions,
      recentAuditLogs: auditLogs.slice(0, 50),
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(reportData, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `noc-security-audit-report-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast("گزارش جامع امنیتی دانلود شد.");
  };

  const tabs: Array<{
    id: "switches" | "compute" | "audit" | "sessions";
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string | number;
    badgeColor?: string;
  }> = [
    {
      id: "switches",
      label: "سوییچ‌های Core و آپلینک‌ها",
      icon: Server,
      badge: `${toPersianDigits(overview?.switchesOnlineCount ?? 4)}/${toPersianDigits(overview?.totalSwitchesCount ?? 4)}`,
      badgeColor: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    },
    {
      id: "compute",
      label: "بار سرورها، RAM و دیتابیس",
      icon: Cpu,
      badge: `${toPersianDigits(overview?.databasePingLatencyMs ?? 0.8)}ms`,
      badgeColor: "bg-sky-500/15 text-sky-400 border-sky-500/30",
    },
    {
      id: "audit",
      label: "استریم لاگ‌های ممیزی و امنیت",
      icon: Terminal,
      badge: toPersianDigits(auditLogs.length),
      badgeColor: "bg-purple-500/15 text-purple-400 border-purple-500/30",
    },
    {
      id: "sessions",
      label: "مدیریت نشست‌های فعال ادمین",
      icon: Users,
      badge: toPersianDigits(sessions.length),
      badgeColor: "bg-orange-500/15 text-orange-400 border-orange-500/30",
    },
  ];

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto p-4 sm:p-6 lg:p-8" dir="rtl">
      {/* Toast Alert Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-900 border border-emerald-500/40 text-emerald-300 text-xs font-semibold shadow-2xl backdrop-blur-md"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header & Controls Toolbar */}
      <SecurityHeaderToolbar
        connectionStatus={connectionStatus}
        pingMs={pingMs}
        wafStatus={overview?.wafStatus ?? null}
        onRefresh={refreshAll}
        onToggleUnderAttack={handleToggleUnderAttack}
        onOpenEmergencyModal={() => setIsEmergencyModalOpen(true)}
        onOpenBlockIpModal={() => setIsBlockIpModalOpen(true)}
        onExportReport={handleExportFullReport}
        isRefreshing={isLoading}
      />

      {/* Executive NOC KPI Grid */}
      <SecurityKpiGrid overview={overview} onSelectTab={(tabId) => setActiveTab(tabId as any)} />

      {/* Navigation Tabs Bar */}
      <div className="flex items-center gap-2 border-b border-white/[0.08] overflow-x-auto pb-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex items-center gap-2.5 px-4 py-3 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? "bg-zinc-900 text-white border border-white/10 shadow-sm"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/40"
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? "text-emerald-400" : "text-zinc-500"}`} />
              <span>{tab.label}</span>

              {tab.badge && (
                <span
                  className={`px-2 py-0.5 rounded-full text-[11px] font-mono font-bold border ${tab.badgeColor}`}
                >
                  {tab.badge}
                </span>
              )}

              {isActive && (
                <motion.div
                  layoutId="activeSecurityTabIndicator"
                  className="absolute bottom-0 left-2 right-2 h-0.5 bg-emerald-500 rounded-full"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Active Tab Content */}
      <div className="pt-2">
        {activeTab === "switches" && (
          <SecuritySwitchesTab
            switches={telemetry?.switches || []}
            uplinks={telemetry?.uplinks || []}
          />
        )}

        {activeTab === "compute" && (
          <SecurityComputeTab
            hostRuntime={telemetry?.hostRuntime || null}
            clusterNodes={telemetry?.clusterNodes || []}
            databaseTelemetry={telemetry?.databaseTelemetry || null}
          />
        )}

        {activeTab === "audit" && (
          <SecurityAuditLogsTab
            logs={auditLogs}
            isStreamPaused={isStreamPaused}
            onTogglePause={() => setIsStreamPaused(!isStreamPaused)}
            onClearLogs={clearLogs}
            onSelectLog={(log) => setSelectedAuditLog(log)}
          />
        )}

        {activeTab === "sessions" && (
          <SecuritySessionsTab
            sessions={sessions}
            onRevokeSession={handleRevokeSession}
            onOpenEmergencyModal={() => setIsEmergencyModalOpen(true)}
          />
        )}
      </div>

      {/* Modals & Slide-over Drawers */}
      <EmergencyKillModal
        isOpen={isEmergencyModalOpen}
        onClose={() => setIsEmergencyModalOpen(false)}
        onConfirm={handleEmergencyKill}
      />

      <BlockIpModal
        isOpen={isBlockIpModalOpen}
        onClose={() => setIsBlockIpModalOpen(false)}
        onConfirm={handleBlockIp}
      />

      <LogDetailDrawer
        log={selectedAuditLog}
        onClose={() => setSelectedAuditLog(null)}
      />
    </div>
  );
}
