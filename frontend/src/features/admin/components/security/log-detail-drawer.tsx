"use client";

import * as React from "react";
import { AdminDetailDrawer } from "../shared/admin-detail-drawer";
import { Copy, Check, Terminal, Shield, Globe, Clock, User } from "lucide-react";
import type { SecurityAuditLog } from "../../types/admin-security.types";

interface LogDetailDrawerProps {
  log: SecurityAuditLog | null;
  onClose: () => void;
}

export function LogDetailDrawer({ log, onClose }: LogDetailDrawerProps) {
  const [copied, setCopied] = React.useState(false);

  if (!log) return null;

  const copyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(log, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AdminDetailDrawer
      isOpen={!!log}
      onClose={onClose}
      title={`رویداد امنیتی: ${log.action}`}
      subtitle={`شناسه ردیابی: ${log.id}`}
      badge={
        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
          {log.category}
        </span>
      }
      size="lg"
      footer={
        <div className="flex items-center justify-between w-full">
          <button
            type="button"
            onClick={copyJson}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-white/10 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "کپی شد!" : "کپی ساختار JSON"}</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
          >
            بستن
          </button>
        </div>
      }
    >
      <div className="space-y-6 text-xs">
        {/* Message Banner */}
        <div className="rounded-xl border border-white/10 bg-zinc-900/80 p-4 space-y-1.5">
          <span className="text-[11px] text-zinc-400 block">شرح کامل رویداد:</span>
          <p className="text-sm font-medium text-white leading-relaxed">{log.message}</p>
        </div>

        {/* Metadata Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-white/[0.06] bg-zinc-950/60 p-3.5 space-y-1">
            <span className="text-[11px] text-zinc-400 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-emerald-400" />
              <span>کاربر یا فاعل (Actor):</span>
            </span>
            <span className="text-sm font-semibold text-white block">{log.actor}</span>
          </div>

          <div className="rounded-xl border border-white/[0.06] bg-zinc-950/60 p-3.5 space-y-1">
            <span className="text-[11px] text-zinc-400 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-sky-400" />
              <span>آدرس IP مبدا:</span>
            </span>
            <span className="text-sm font-semibold font-mono text-white block">{log.ip}</span>
          </div>

          <div className="rounded-xl border border-white/[0.06] bg-zinc-950/60 p-3.5 space-y-1">
            <span className="text-[11px] text-zinc-400 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>زمان ثبت دقیق:</span>
            </span>
            <span className="text-xs font-mono text-zinc-300 block">{log.timestamp}</span>
          </div>

          <div className="rounded-xl border border-white/[0.06] bg-zinc-950/60 p-3.5 space-y-1">
            <span className="text-[11px] text-zinc-400 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-purple-400" />
              <span>موقعیت مکانی یا نود:</span>
            </span>
            <span className="text-xs text-zinc-300 block">{log.location || "دیتاسنتر محلی"}</span>
          </div>
        </div>

        {/* Raw Payload JSON */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
              <Terminal className="w-4 h-4 text-emerald-400" />
              <span>داده‌های ساختاریافته (Raw Payload):</span>
            </span>
          </div>

          <pre className="p-4 rounded-xl border border-white/10 bg-zinc-950 text-emerald-300 font-mono text-[11px] leading-relaxed overflow-x-auto max-h-64">
            {JSON.stringify(log.details || log, null, 2)}
          </pre>
        </div>
      </div>
    </AdminDetailDrawer>
  );
}
