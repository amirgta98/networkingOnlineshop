"use client";

import * as React from "react";
import { useState } from "react";
import {
  Users,
  Shield,
  Laptop,
  Smartphone,
  Globe,
  MapPin,
  Clock,
  LogOut,
  OctagonAlert,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { toPersianDigits } from "@/shared/lib/utils";
import type { ActiveAdminSessionDto } from "../../types/admin-security.types";

interface SecuritySessionsTabProps {
  sessions: ActiveAdminSessionDto[];
  onRevokeSession: (sessionId: string) => Promise<unknown>;
  onOpenEmergencyModal: () => void;
}

export function SecuritySessionsTab({
  sessions,
  onRevokeSession,
  onOpenEmergencyModal,
}: SecuritySessionsTabProps) {
  const [revokingId, setRevokingId] = useState<string | null>(null);

  const handleRevoke = async (sessionId: string) => {
    if (!confirm("آیا از ابطال این نشست و خروج اجباری کاربر مطمئن هستید؟")) return;
    try {
      setRevokingId(sessionId);
      await onRevokeSession(sessionId);
    } finally {
      setRevokingId(null);
    }
  };

  const getDeviceIcon = (deviceName: string, os: string) => {
    const isMobile =
      deviceName.toLowerCase().includes("phone") ||
      os.toLowerCase().includes("ios") ||
      os.toLowerCase().includes("android");
    return isMobile ? <Smartphone className="w-5 h-5 text-sky-400" /> : <Laptop className="w-5 h-5 text-purple-400" />;
  };

  const formatRelativeTime = (isoString: string) => {
    try {
      const diffMs = Date.now() - new Date(isoString).getTime();
      const diffMin = Math.floor(diffMs / 60000);
      if (diffMin < 1) return "هم‌اکنون آنلاین";
      if (diffMin < 60) return `${toPersianDigits(diffMin)} دقیقه پیش`;
      const diffHours = Math.floor(diffMin / 60);
      if (diffHours < 24) return `${toPersianDigits(diffHours)} ساعت پیش`;
      return `${toPersianDigits(Math.floor(diffHours / 24))} روز پیش`;
    } catch {
      return "اخیراً";
    }
  };

  return (
    <div className="space-y-6">
      {/* ------------------------------------------------------------------- */}
      {/* EMERGENCY KILL SWITCH HERO BANNER (بنر فرمان خروج اضطراری)           */}
      {/* ------------------------------------------------------------------- */}
      <div className="relative overflow-hidden rounded-2xl border border-rose-500/30 bg-gradient-to-r from-rose-950/40 via-zinc-900/80 to-zinc-950 p-6 shadow-[0_0_30px_rgba(225,29,72,0.15)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0 shadow-[0_0_15px_rgba(225,29,72,0.2)]">
              <OctagonAlert className="w-5 h-5 animate-pulse" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>فرمان خروج اضطراری کلی (Emergency Kill Switch)</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 font-semibold">
                  سطح دسترسی: سوپرادمین
                </span>
              </h3>
              <p className="text-xs text-zinc-300 leading-relaxed max-w-2xl">
                در صورت مشاهده نفوذ یا رفتار مشکوک در سیستم، با صدور این فرمان تمامی نشست‌های فعال مدیران فوراً باطل شده و ورود مجدد تنها از طریق احراز هویت پیامکی دو مرحله‌ای (2FA) امکان‌پذیر خواهد بود.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenEmergencyModal}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-[0_0_20px_rgba(225,29,72,0.4)] transition-all shrink-0 active:scale-95"
          >
            <LogOut className="w-4 h-4" />
            <span>صدور فرمان خروج اضطراری</span>
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------------- */}
      {/* SESSIONS LIST (فهرست نشست‌های فعال)                                   */}
      {/* ------------------------------------------------------------------- */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">نشست‌های فعال مدیران و کارشناسان</h2>
              <p className="text-xs text-zinc-400">لیست نشست‌های متصل به دیتابیس همراه با اطلاعات مرورگر، سیستم‌عامل و موقعیت IP</p>
            </div>
          </div>

          <span className="text-xs text-zinc-400 font-medium">
            تعداد کل: <strong className="text-white">{toPersianDigits(sessions.length)} نشست</strong>
          </span>
        </div>

        {sessions.length === 0 ? (
          <div className="bg-zinc-900/60 rounded-2xl border border-white/[0.08] p-8 text-center text-zinc-400 text-xs">
            هیچ نشست فعالی در حال حاضر ثبت نشده است.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3.5">
            {sessions.map((sess) => {
              const isCurrent = sess.isCurrent;
              const isRevoking = revokingId === sess.id;

              return (
                <div
                  key={sess.id}
                  className={`rounded-2xl border p-5 transition-all bg-zinc-900/60 backdrop-blur-sm ${
                    isCurrent
                      ? "border-emerald-500/30 bg-emerald-950/10 shadow-[0_0_20px_rgba(16,185,129,0.08)]"
                      : "border-white/[0.08] hover:border-white/20"
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Left: User & Device Info */}
                    <div className="flex items-start gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-zinc-950 border border-white/10 flex items-center justify-center shrink-0">
                        {getDeviceIcon(sess.deviceName, sess.os)}
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <span className="text-sm font-bold text-white">{sess.userName}</span>
                          <span className="text-xs text-zinc-400 font-mono">({toPersianDigits(sess.userPhone)})</span>
                          <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-orange-500/15 text-orange-400 border border-orange-500/30">
                            {sess.userRole}
                          </span>
                          {isCurrent && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                              <span>نشست فعلی شما</span>
                            </span>
                          )}
                        </div>

                        {/* Device & Browser */}
                        <div className="flex items-center gap-3 text-xs text-zinc-300 flex-wrap">
                          <span className="text-zinc-200 font-medium">{sess.deviceName}</span>
                          <span className="text-zinc-500">•</span>
                          <span>{sess.os}</span>
                          <span className="text-zinc-500">•</span>
                          <span>{sess.browser}</span>
                        </div>

                        {/* Network & IP */}
                        <div className="flex items-center gap-3 text-xs text-zinc-400 flex-wrap pt-0.5">
                          <span className="flex items-center gap-1 font-mono text-zinc-300">
                            <Globe className="w-3.5 h-3.5 text-zinc-500" />
                            {sess.ipAddress}
                          </span>
                          <span className="text-zinc-500">•</span>
                          <span className="flex items-center gap-1 text-zinc-400">
                            <MapPin className="w-3.5 h-3.5 text-zinc-500" />
                            {sess.location}
                          </span>
                          <span className="text-zinc-500">•</span>
                          <span className="flex items-center gap-1 text-emerald-400">
                            <Clock className="w-3.5 h-3.5" />
                            {formatRelativeTime(sess.lastActiveAt)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-2 self-end lg:self-center shrink-0">
                      <button
                        type="button"
                        onClick={() => handleRevoke(sess.id)}
                        disabled={isRevoking}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-zinc-800/80 hover:bg-rose-950/40 text-zinc-300 hover:text-rose-400 border border-white/10 hover:border-rose-500/30 transition-all disabled:opacity-50"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>{isRevoking ? "در حال ابطال..." : "خروج و ابطال نشست"}</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
