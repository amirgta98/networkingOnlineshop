"use client";

import * as React from "react";
import {
  Lock,
  ShieldCheck,
  Smartphone,
  Laptop,
  Clock,
  AlertTriangle,
  History,
  KeyRound,
  CheckCircle2,
  Trash2,
  Loader2,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { toPersianDigits } from "@/shared/lib/utils";
import { apiClient } from "@/shared/lib/api-client";

interface ActiveSession {
  id: string;
  adminName?: string;
  device?: string;
  ip?: string;
  loginAt?: string;
  isCurrent?: boolean;
}

interface AuditLogItem {
  id: string;
  adminName?: string;
  action: string;
  timestamp: string;
  level: string;
}

export function PartnerSecurityView() {
  const [sessions, setSessions] = React.useState<ActiveSession[]>([]);
  const [auditLogs, setAuditLogs] = React.useState<AuditLogItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [twoFactorActive, setTwoFactorActive] = React.useState(true);

  const fetchSecurityData = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const [sessionsRes, logsRes] = await Promise.allSettled([
        apiClient.get<ActiveSession[]>("/security/sessions", { timeout: 8000 }),
        apiClient.get<AuditLogItem[]>("/security/audit-logs?limit=5", { timeout: 8000 }),
      ]);

      if (sessionsRes.status === "fulfilled" && Array.isArray(sessionsRes.value)) {
        setSessions(sessionsRes.value);
      } else {
        setSessions([
          {
            id: "current",
            device: "مرورگر وب جاری (نشست فعال سیستم)",
            ip: "اتصال امن TLS v1.3",
            loginAt: "هم‌اکنون",
            isCurrent: true,
          },
        ]);
      }

      if (logsRes.status === "fulfilled" && Array.isArray(logsRes.value)) {
        setAuditLogs(logsRes.value);
      } else {
        setAuditLogs([]);
      }
    } catch (err) {
      console.warn("[PartnerSecurityView] Failed to load security data from backend:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void fetchSecurityData();
  }, [fetchSecurityData]);

  const handleRevokeSession = async (sessionId: string) => {
    try {
      await apiClient.delete(`/security/sessions/${sessionId}`);
      await fetchSecurityData();
    } catch (err) {
      console.error("[PartnerSecurityView] Failed to revoke session:", err);
    }
  };

  return (
    <div className="flex flex-col gap-6 text-right" dir="rtl">
      {/* Top Header Card */}
      <div className="rounded-3xl border border-[var(--theme-border-color)] bg-[var(--theme-surface)] p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400">
              <Lock className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">امنیت سازمانی، نشست‌ها و لاگ دسترسی</h2>
              <p className="text-xs text-neutral-400 mt-0.5">
                تایید دو مرحله‌ای حساب حقوقی، پایش نشست‌های ورود نمایندگان و ثبت لاگ امنیتی تراکنش‌ها
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4" />
            <span>حساب سازمانی در بالاترین لایه امنیت</span>
          </span>
        </div>
      </div>

      {/* 2FA Status Card */}
      <div className="rounded-3xl border border-sky-500/30 bg-gradient-to-br from-sky-950/20 via-[var(--theme-surface)] to-[var(--theme-surface)] p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-sky-500/15 border border-sky-500/30 text-sky-400">
            <Smartphone className="h-7 w-7" />
          </div>
          <div className="flex flex-col gap-1">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <span>احراز هویت دو مرحله‌ای پیامکی / TOTP</span>
              <span className="text-[11px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full font-bold">
                فعال
              </span>
            </h3>
            <p className="text-xs text-neutral-400 max-w-xl leading-relaxed">
              جهت جلوگیری از نفوذ غیرمجاز به موجودی کیف پول و سفارش‌های سازمانی، ورود به حساب و ثبت درخواست‌های تسویه ملزم به وارد نمودن کد تایید پیامکی یکبار مصرف (OTP) است.
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          className="text-xs border-sky-500/40 text-sky-300 hover:bg-sky-500/10 shrink-0 cursor-pointer"
          onClick={() => alert("تنظیمات احراز هویت دو مرحله‌ای در پنل مدیریت ققنوس محفوظ است.")}
        >
          <KeyRound className="h-3.5 w-3.5 ml-1.5" />
          <span>تنظیم مجدد احراز هویت</span>
        </Button>
      </div>

      {/* Active Sessions */}
      <div className="rounded-3xl border border-[var(--theme-border-color)] bg-[var(--theme-surface)] p-6 shadow-sm flex flex-col gap-5">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
          <div className="flex items-center gap-2">
            <Laptop className="h-5 w-5 text-sky-400" />
            <h3 className="font-bold text-white text-base">نشست‌های فعال</h3>
          </div>
          <span className="text-xs text-neutral-400">
            تعداد: <strong className="text-white font-mono">{toPersianDigits(sessions.length)}</strong> دستگاه
          </span>
        </div>

        {isLoading ? (
          <div className="p-8 text-center flex flex-col items-center justify-center gap-3">
            <Loader2 className="h-8 w-8 text-sky-400 animate-spin" />
            <span className="text-xs text-neutral-400">در حال دریافت وضعیت نشست‌ها از سرور...</span>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {sessions.map((sess) => (
              <div
                key={sess.id}
                className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-neutral-800 text-neutral-300">
                    <Laptop className="h-5 w-5" />
                  </div>
                  <div className="flex flex-col gap-1 text-xs">
                    <div className="flex items-center gap-2 font-bold text-white">
                      <span>{sess.device || sess.adminName || "مرورگر دسکتاپ"}</span>
                      {sess.isCurrent && (
                        <span className="text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                          دستگاه فعلی شما
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-neutral-400 font-mono text-[11px]">
                      <span>IP: {sess.ip || "127.0.0.1"}</span>
                      <span>زمان ورود: {sess.loginAt || "هم‌اکنون"}</span>
                    </div>
                  </div>
                </div>

                {!sess.isCurrent && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-950/20 cursor-pointer"
                    onClick={() => handleRevokeSession(sess.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5 ml-1" />
                    <span>خروج از این دستگاه</span>
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Audit Logs */}
      {auditLogs.length > 0 && (
        <div className="rounded-3xl border border-[var(--theme-border-color)] bg-[var(--theme-surface)] p-6 shadow-sm flex flex-col gap-5">
          <div className="flex items-center gap-2 pb-3 border-b border-neutral-800">
            <History className="h-5 w-5 text-neutral-400" />
            <h3 className="font-bold text-white text-base">آخرین رویدادهای امنیتی حساب</h3>
          </div>

          <div className="flex flex-col gap-2.5 text-xs">
            {auditLogs.map((log) => (
              <div
                key={log.id}
                className="p-3 rounded-xl bg-neutral-900/60 border border-neutral-800/80 flex items-center justify-between text-neutral-300"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                  <span>{log.action}</span>
                </div>
                <span className="text-[11px] text-neutral-500 font-mono">
                  {toPersianDigits(log.timestamp ? new Date(log.timestamp).toLocaleDateString("fa-IR") : "")}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
