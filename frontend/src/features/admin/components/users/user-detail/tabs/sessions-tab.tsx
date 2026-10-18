"use client";

import * as React from "react";
import type { AdminUserSession } from "@/features/admin/types/admin-users.types";
import { adminUsersApi } from "@/features/admin/api/admin-users-api";
import { toPersianDigits } from "@/shared/lib/utils";
import {
  Monitor,
  Smartphone,
  Globe,
  MapPin,
  Clock,
  Calendar,
  AlertCircle,
  RefreshCw,
  Ban,
  CheckCircle2,
  ShieldAlert,
  Laptop,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { TabPagination } from "../tab-pagination";

interface SessionsTabProps {
  userId: string;
}

export function SessionsTab({ userId }: SessionsTabProps) {
  const [sessions, setSessions] = React.useState<AdminUserSession[]>([]);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);
  const [revokingSessionId, setRevokingSessionId] = React.useState<string | null>(null);
  const [sessionToRevoke, setSessionToRevoke] = React.useState<AdminUserSession | null>(null);
  const [currentPage, setCurrentPage] = React.useState<number>(1);
  const pageSize = 5;

  const fetchSessions = React.useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await adminUsersApi.getUserSessions(userId);
      setSessions(data || []);
    } catch (err: any) {
      console.error("Failed to load user sessions:", err);
      setError("خطا در بارگذاری نشست‌ها و تاریخچه ورود کاربر.");
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  React.useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const handleRevoke = async (session: AdminUserSession) => {
    try {
      setRevokingSessionId(session.id);
      await adminUsersApi.revokeUserSession(userId, session.id);
      // Update session locally
      setSessions((prev) =>
        prev.map((s) => (s.id === session.id ? { ...s, isRevoked: true } : s))
      );
      setSessionToRevoke(null);
    } catch (err: any) {
      console.error("Failed to revoke session:", err);
      alert("خطا در ابطال نشست کاربر. لطفا مجددا تلاش کنید.");
    } finally {
      setRevokingSessionId(null);
    }
  };

  const getDeviceIcon = (session: AdminUserSession) => {
    const text = `${session.deviceName || ""} ${session.os || ""}`.toLowerCase();
    if (text.includes("mobile") || text.includes("android") || text.includes("ios") || text.includes("iphone")) {
      return <Smartphone className="h-5 w-5" />;
    }
    if (text.includes("mac") || text.includes("laptop")) {
      return <Laptop className="h-5 w-5" />;
    }
    return <Monitor className="h-5 w-5" />;
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4" dir="rtl">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="p-5 rounded-2xl border border-neutral-800 bg-neutral-900/40 animate-pulse h-28"
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 rounded-2xl border border-red-500/20 bg-red-500/5 text-center flex flex-col items-center justify-center gap-3" dir="rtl">
        <AlertCircle className="h-8 w-8 text-red-400" />
        <p className="text-sm text-neutral-300 font-medium">{error}</p>
        <Button
          size="sm"
          variant="outline"
          onClick={fetchSessions}
          className="gap-2 border-neutral-700 text-neutral-200"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>تلاش مجدد</span>
        </Button>
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <div className="p-12 rounded-2xl border border-dashed border-neutral-800 bg-neutral-900/20 text-center flex flex-col items-center justify-center gap-3" dir="rtl">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral-800 text-neutral-400">
          <Monitor className="h-6 w-6" />
        </div>
        <h3 className="text-sm font-bold text-white">هیچ نشست فعالی ثبت نشده است</h3>
        <p className="text-xs text-neutral-400 max-w-sm">
          اطلاعات نشست یا لاگ ورود اخیر برای این حساب کاربری در پایگاه داده موجود نیست.
        </p>
      </div>
    );
  }

  const activeSessionsCount = sessions.filter((s) => !s.isRevoked).length;

  return (
    <div className="flex flex-col gap-4" dir="rtl">
      <div className="flex items-center justify-between text-xs text-neutral-400">
        <span>
          نشست‌های فعال: <strong className="text-emerald-400 font-mono">{toPersianDigits(activeSessionsCount)}</strong> از مجموع{" "}
          <strong className="text-white font-mono">{toPersianDigits(sessions.length)}</strong> دستگاه ثبت‌شده
        </span>
      </div>

      <div className="flex flex-col gap-3">
        {sessions
          .slice((currentPage - 1) * pageSize, currentPage * pageSize)
          .map((session) => (
          <div
            key={session.id}
            className={`p-4 sm:p-5 rounded-2xl border transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
              session.isRevoked
                ? "border-neutral-800/60 bg-neutral-900/20 opacity-70"
                : session.isCurrent
                ? "border-emerald-500/40 bg-neutral-900/80 shadow-lg shadow-emerald-950/20"
                : "border-neutral-800 bg-neutral-900/50 hover:border-neutral-700"
            }`}
          >
            {/* Left: Device & Browser info */}
            <div className="flex items-start sm:items-center gap-3.5">
              <div
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border ${
                  session.isRevoked
                    ? "bg-neutral-800 border-neutral-700 text-neutral-500"
                    : session.isCurrent
                    ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400"
                    : "bg-sky-500/10 border-sky-500/20 text-sky-400"
                }`}
              >
                {getDeviceIcon(session)}
              </div>

              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-xs sm:text-sm font-bold text-white">
                    {session.deviceName || `${session.os || "دستگاه"} - ${session.browser || "مرورگر وب"}`}
                  </h4>

                  {session.isCurrent && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-semibold">
                      نشست جاری
                    </span>
                  )}

                  {session.isRevoked ? (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-400 border border-neutral-700 font-semibold">
                      ابطال شده
                    </span>
                  ) : (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
                      فعال
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3 text-xs text-neutral-400 mt-1 flex-wrap">
                  <span className="font-mono text-neutral-300" dir="ltr">
                    IP: {session.ipAddress || "نامشخص"}
                  </span>
                  {session.location && (
                    <span className="flex items-center gap-1 text-neutral-400">
                      <MapPin className="h-3 w-3 text-neutral-500" />
                      {session.location}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3 text-neutral-500" />
                    آخرین فعالیت: {session.lastActiveAt}
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-neutral-800">
              <span className="text-[11px] text-neutral-500 font-mono">
                ورود اولیه: {session.createdAt}
              </span>

              {!session.isRevoked && (
                <Button
                  size="sm"
                  variant="outline"
                  disabled={revokingSessionId === session.id}
                  onClick={() => setSessionToRevoke(session)}
                  className="h-8 text-xs border-red-500/30 text-red-400 hover:bg-red-500/10 gap-1.5"
                >
                  <Ban className="h-3.5 w-3.5" />
                  <span>{revokingSessionId === session.id ? "در حال ابطال..." : "ابطال نشست"}</span>
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      <TabPagination
        currentPage={currentPage}
        totalItems={sessions.length}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
      />

      {/* Confirmation Modal for Revoking Session */}
      {sessionToRevoke && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="w-full max-w-md p-6 rounded-2xl border border-neutral-800 bg-neutral-900 text-right flex flex-col gap-4 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-2.5 text-red-400">
              <ShieldAlert className="h-6 w-6" />
              <h3 className="text-base font-bold text-white">تایید ابطال نشست کاربر</h3>
            </div>

            <p className="text-xs text-neutral-300 leading-relaxed">
              آیا از ابطال نشست دستگاه{" "}
              <strong className="text-white">
                «{sessionToRevoke.deviceName || sessionToRevoke.browser || "این دستگاه"}»
              </strong>{" "}
              با آدرس آی‌پی <span className="font-mono text-emerald-400">{sessionToRevoke.ipAddress}</span> اطمینان دارید؟ با تایید این عملیات، دسترسی کاربر از این مرورگر بلافاصله خاتمه خواهد یافت.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-neutral-800">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSessionToRevoke(null)}
                disabled={Boolean(revokingSessionId)}
                className="text-xs border-neutral-700 text-neutral-300"
              >
                انصراف
              </Button>
              <Button
                size="sm"
                onClick={() => handleRevoke(sessionToRevoke)}
                disabled={Boolean(revokingSessionId)}
                className="text-xs bg-red-600 hover:bg-red-700 text-white font-bold"
              >
                {revokingSessionId ? "در حال ابطال..." : "بله، نشست باطل شود"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
