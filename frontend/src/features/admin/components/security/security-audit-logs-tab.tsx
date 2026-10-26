"use client";

import * as React from "react";
import { useState, useMemo } from "react";
import {
  Search,
  Pause,
  Play,
  Trash2,
  Download,
  Filter,
  ShieldAlert,
  Info,
  AlertTriangle,
  XCircle,
  Radio,
  FileCode,
  Terminal,
} from "lucide-react";
import { toPersianDigits } from "@/shared/lib/utils";
import type {
  SecurityAuditLog,
  SecurityAuditCategory,
  SecurityAuditLevel,
} from "../../types/admin-security.types";

interface SecurityAuditLogsTabProps {
  logs: SecurityAuditLog[];
  isStreamPaused: boolean;
  onTogglePause: () => void;
  onClearLogs: () => void;
  onSelectLog: (log: SecurityAuditLog) => void;
}

export function SecurityAuditLogsTab({
  logs,
  isStreamPaused,
  onTogglePause,
  onClearLogs,
  onSelectLog,
}: SecurityAuditLogsTabProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [selectedLevel, setSelectedLevel] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const categories: Array<{ id: string; label: string }> = [
    { id: "ALL", label: "همه دسته‌ها" },
    { id: "AUTH", label: "احراز هویت و لاگین" },
    { id: "NETWORK", label: "شبکه و آپلینک" },
    { id: "FIREWALL", label: "فایروال و WAF" },
    { id: "SESSION", label: "نشست‌ها و ابطال" },
    { id: "DATABASE", label: "پایگاه داده" },
    { id: "SYSTEM", label: "سیستم و سخت‌افزار" },
  ];

  const levels: Array<{ id: string; label: string; color: string }> = [
    { id: "ALL", label: "همه سطوح", color: "text-zinc-300" },
    { id: "INFO", label: "اطلاعات (Info)", color: "text-emerald-400" },
    { id: "WARNING", label: "هشدار (Warning)", color: "text-amber-400" },
    { id: "ERROR", label: "خطا (Error)", color: "text-rose-400" },
    { id: "CRITICAL", label: "بحرانی (Critical)", color: "text-fuchsia-400" },
  ];

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      if (selectedCategory !== "ALL" && log.category !== selectedCategory) return false;
      if (selectedLevel !== "ALL" && log.level !== selectedLevel) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const matches =
          log.message.toLowerCase().includes(q) ||
          log.actor.toLowerCase().includes(q) ||
          log.ip.toLowerCase().includes(q) ||
          log.action.toLowerCase().includes(q);
        if (!matches) return false;
      }
      return true;
    });
  }, [logs, selectedCategory, selectedLevel, searchQuery]);

  const exportToJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(filteredLogs, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `security-audit-logs-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const exportToCsv = () => {
    const headers = ["Timestamp", "Level", "Category", "Action", "Actor", "IP", "Message"];
    const rows = filteredLogs.map((l) => [
      l.timestamp,
      l.level,
      l.category,
      l.action,
      `"${l.actor.replace(/"/g, '""')}"`,
      l.ip,
      `"${l.message.replace(/"/g, '""')}"`,
    ]);
    const csvContent =
      "data:text/csv;charset=utf-8,\uFEFF" +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", encodeURI(csvContent));
    downloadAnchor.setAttribute("download", `security-audit-logs-${Date.now()}.csv`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const getLevelBadge = (level: SecurityAuditLevel) => {
    switch (level) {
      case "CRITICAL":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/40 animate-pulse">
            <ShieldAlert className="w-3 h-3" />
            <span>بحرانی</span>
          </span>
        );
      case "ERROR":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-500/15 text-rose-400 border border-rose-500/30">
            <XCircle className="w-3 h-3" />
            <span>خطا</span>
          </span>
        );
      case "WARNING":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30">
            <AlertTriangle className="w-3 h-3" />
            <span>هشدار</span>
          </span>
        );
      case "INFO":
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <Info className="w-3 h-3" />
            <span>اطلاعات</span>
          </span>
        );
    }
  };

  const formatPersianTime = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString("fa-IR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="space-y-4">
      {/* Stream Control Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-zinc-900/60 p-4 rounded-2xl border border-white/[0.08]">
        {/* Stream Status & Actions */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-emerald-400" />
            <h2 className="text-sm font-bold text-white">کنسول استریم لاگ‌های ممیزی و امنیت</h2>
          </div>

          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs bg-zinc-950 border border-white/10">
            <span
              className={`w-2 h-2 rounded-full ${
                isStreamPaused ? "bg-amber-400" : "bg-emerald-400 animate-ping"
              }`}
            />
            <span className={isStreamPaused ? "text-amber-400" : "text-emerald-400 font-medium"}>
              {isStreamPaused ? "استریم موقتاً متوقف شد" : "استریم زنده و فعال"}
            </span>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={onTogglePause}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors ${
              isStreamPaused
                ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                : "bg-zinc-800/80 text-zinc-300 hover:text-white border-white/10"
            }`}
          >
            {isStreamPaused ? (
              <>
                <Play className="w-3.5 h-3.5" />
                <span>ادامه استریم</span>
              </>
            ) : (
              <>
                <Pause className="w-3.5 h-3.5" />
                <span>توقف استریم</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={exportToJson}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 border border-white/10 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>JSON</span>
          </button>

          <button
            type="button"
            onClick={exportToCsv}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 border border-white/10 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>CSV</span>
          </button>

          <button
            type="button"
            onClick={onClearLogs}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-zinc-800/80 hover:bg-rose-950/40 text-zinc-400 hover:text-rose-400 border border-white/10 transition-colors"
            title="پاک‌سازی لاگ‌های جاری از کنسول"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>پاک کردن</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="space-y-3 bg-zinc-900/40 p-4 rounded-2xl border border-white/[0.06]">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-zinc-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="جستجوی سریع لاگ بر اساس آی‌پی، کاربر، پیام رویداد یا اقدام..."
            className="w-full bg-zinc-950/80 border border-white/10 rounded-xl pr-10 pl-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500/50"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          <span className="text-[11px] text-zinc-400 ml-2 whitespace-nowrap">دسته‌بندی:</span>
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat.id
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                  : "bg-zinc-950/60 text-zinc-400 hover:text-white border border-white/[0.05]"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Level Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <span className="text-[11px] text-zinc-400 ml-2 whitespace-nowrap">سطح خطا:</span>
          {levels.map((lvl) => (
            <button
              key={lvl.id}
              type="button"
              onClick={() => setSelectedLevel(lvl.id)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                selectedLevel === lvl.id
                  ? "bg-zinc-800 text-white border border-white/20"
                  : "bg-zinc-950/60 text-zinc-400 hover:text-white border border-white/[0.05]"
              }`}
            >
              {lvl.label}
            </button>
          ))}
        </div>
      </div>

      {/* Logs Console Container */}
      <div className="rounded-2xl border border-white/[0.08] bg-zinc-950 overflow-hidden font-mono text-xs">
        {/* Terminal Header */}
        <div className="bg-zinc-900/80 px-4 py-2.5 border-b border-white/[0.08] flex items-center justify-between text-zinc-400 text-[11px]">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
            <span className="mr-2 text-zinc-300 font-sans font-medium">
              تعداد رویدادها: {toPersianDigits(filteredLogs.length)}
            </span>
          </div>
          <span className="font-sans text-[11px]">برای مشاهده Payload کامل، روی هر لاگ کلیک کنید</span>
        </div>

        {/* Logs List */}
        <div className="max-h-[580px] overflow-y-auto divide-y divide-white/[0.04]">
          {filteredLogs.length === 0 ? (
            <div className="py-12 text-center text-zinc-500 font-sans text-xs">
              هیچ لاگی منطبق با فیلترهای جستجو یافت نشد.
            </div>
          ) : (
            filteredLogs.map((log) => (
              <div
                key={log.id}
                onClick={() => onSelectLog(log)}
                className="p-3 sm:px-4 hover:bg-zinc-900/60 cursor-pointer transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-2"
              >
                <div className="flex items-start sm:items-center gap-2.5 flex-1 min-w-0">
                  <span className="text-[11px] text-zinc-500 whitespace-nowrap">
                    {formatPersianTime(log.timestamp)}
                  </span>
                  <div>{getLevelBadge(log.level)}</div>
                  <span className="px-1.5 py-0.5 rounded text-[10px] bg-zinc-900 text-zinc-400 border border-white/[0.05] whitespace-nowrap">
                    {log.category}
                  </span>
                  <span className="text-zinc-200 font-sans text-xs truncate" title={log.message}>
                    {log.message}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-[11px] text-zinc-400 self-end sm:self-auto shrink-0">
                  <span className="text-emerald-400/90 font-sans">{log.actor}</span>
                  <span className="text-zinc-500 font-mono">{log.ip}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
