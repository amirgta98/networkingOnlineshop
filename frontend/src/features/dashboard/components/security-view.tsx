"use client";

import * as React from "react";
import {
  Lock,
  KeyRound,
  ShieldCheck,
  Smartphone,
  Laptop,
  LogOut,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff,
  History,
} from "lucide-react";
import { useDashboardSecurity } from "../hooks/use-dashboard-security";
import {
  DashboardPageHeader,
  DashboardMetricCard,
  DashboardStatusBadge,
  ConfirmDialog,
} from "./shared";
import { Button } from "@/shared/components/ui/button";
import { toPersianDigits } from "@/shared/lib/utils";

export function SecurityView() {
  const {
    securityState,
    isLoaded,
    updateTwoFactor,
    terminateOtherSessions,
    terminateSingleSession,
  } = useDashboardSecurity();

  // 2FA state
  const [twoFactorEnabled, setTwoFactorEnabled] = React.useState(securityState.twoFactorEnabled);
  const [twoFactorPin, setTwoFactorPin] = React.useState(securityState.twoFactorPin || "123456");
  const [pinToast, setPinToast] = React.useState<string | null>(null);

  // Password state
  const [currentPass, setCurrentPass] = React.useState("");
  const [newPass, setNewPass] = React.useState("");
  const [confirmPass, setConfirmPass] = React.useState("");
  const [passToast, setPassToast] = React.useState<string | null>(null);
  const [passError, setPassError] = React.useState<string | null>(null);

  // Terminate All Sessions Confirm
  const [isTerminateAllOpen, setIsTerminateAllOpen] = React.useState(false);

  React.useEffect(() => {
    if (isLoaded) {
      setTwoFactorEnabled(securityState.twoFactorEnabled);
      setTwoFactorPin(securityState.twoFactorPin || "123456");
    }
  }, [securityState, isLoaded]);

  const handleSave2FA = (e: React.FormEvent) => {
    e.preventDefault();
    updateTwoFactor(twoFactorEnabled, twoFactorPin);
    setPinToast("تنظیمات تایید دو مرحله‌ای (۲FA) با موفقیت ذخیره و اعمال شد.");
    setTimeout(() => setPinToast(null), 3000);
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPassError(null);
    setPassToast(null);

    if (!currentPass.trim()) {
      setPassError("کلمه عبور فعلی الزامی است.");
      return;
    }
    if (newPass.length < 8) {
      setPassError("کلمه عبور جدید باید حداقل ۸ کاراکتر باشد.");
      return;
    }
    if (newPass !== confirmPass) {
      setPassError("تکرار کلمه عبور با کلمه عبور جدید مطابقت ندارد.");
      return;
    }

    setCurrentPass("");
    setNewPass("");
    setConfirmPass("");
    setPassToast("کلمه عبور حساب کاربری با موفقیت تغییر یافت.");
    setTimeout(() => setPassToast(null), 3000);
  };

  return (
    <div className="flex flex-col gap-6" dir="rtl">
      {/* ── 1. Page Header ────────────────────────────────────────── */}
      <DashboardPageHeader
        title="امنیت و تایید دو مرحله‌ای (۲FA)"
        description="مدیریت لایه‌های حفاظتی حساب، پین کد ورود دو مرحله‌ای، تغییر رمز عبور و نظارت بر نشست‌های فعال دستگاه‌ها"
        icon={Lock}
        badge="محافظت شده با ۲FA"
        badgeVariant="emerald"
      />

      {/* ── 2. Metric Cards ───────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4">
        <DashboardMetricCard
          title="وضعیت تایید دو مرحله‌ای (۲FA)"
          value={twoFactorEnabled ? "فعال و ایمن" : "غیرفعال"}
          subtitle={twoFactorEnabled ? "حفاظت با پین ۶ رقمی پیامکی" : "پیشنهاد می‌شود سریعاً فعال گردد"}
          icon={KeyRound}
          variant={twoFactorEnabled ? "emerald" : "amber"}
        />

        <DashboardMetricCard
          title="نشست‌های فعال (Active Sessions)"
          value={
            <span>
              {toPersianDigits(securityState.activeSessions.length)}{" "}
              <span className="text-xs font-normal text-neutral-400">دستگاه متصل</span>
            </span>
          }
          subtitle="اتصال از ویندوز، اندروید و لینوکس"
          icon={Laptop}
          variant="sky"
        />

        <DashboardMetricCard
          title="پایش ورودهای مشکوک"
          value="۰ تهدید فعال"
          subtitle="فایروال پلتفرم ورودهای غیرمجاز را مسدود کرده است"
          icon={ShieldCheck}
          variant="emerald"
        />
      </div>

      {/* ── 3. 2FA Configuration Card ──────────────────────────────── */}
      <div className="rounded-3xl border border-[var(--theme-border-color)] bg-[var(--theme-surface)] p-4 sm:p-6 shadow-xs flex flex-col gap-4 text-right">
        <div className="flex items-center justify-between border-b border-[var(--theme-border-color)] pb-3">
          <div className="flex items-center gap-2.5">
            <KeyRound className="h-4 w-4 text-orange-400 shrink-0" />
            <h3 className="text-sm font-bold text-[var(--theme-foreground)]">
              تنظیمات لایه دوم احراز هویت (۲FA)
            </h3>
          </div>

          <span
            className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
              twoFactorEnabled
                ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                : "bg-neutral-800 text-neutral-400 border-neutral-700"
            }`}
          >
            {twoFactorEnabled ? "۲FA فعال است" : "۲FA غیرفعال"}
          </span>
        </div>

        {pinToast && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{pinToast}</span>
          </div>
        )}

        <form onSubmit={handleSave2FA} className="flex flex-col gap-4">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              id="twoFactorToggle"
              checked={twoFactorEnabled}
              onChange={(e) => setTwoFactorEnabled(e.target.checked)}
              className="h-4 w-4 mt-0.5 rounded text-orange-500 cursor-pointer shrink-0"
            />
            <span className="text-xs text-neutral-200 leading-relaxed">
              فعال‌سازی الزام به ورود رمز امنیتی دوم (PIN) هنگام ورود از هر دستگاه جدید
            </span>
          </label>

          {twoFactorEnabled && (
            <div className="max-w-xs">
              <label className="text-xs font-semibold text-neutral-300 block mb-1">
                رمز دوم ۶ رقمی (PIN Code):
              </label>
              <input
                type="text"
                dir="ltr"
                value={twoFactorPin}
                onChange={(e) => setTwoFactorPin(e.target.value)}
                maxLength={6}
                placeholder="123456"
                className="w-full h-10 px-3 rounded-xl border border-[var(--theme-border-color)] bg-neutral-900 text-center font-mono font-bold tracking-widest text-sm text-white focus:outline-none focus:border-orange-500"
              />
              <span className="text-[10px] text-neutral-500 block mt-1">
                کد تست دمو پیش‌فرض: ۱۲۳۴۵۶
              </span>
            </div>
          )}

          <div className="flex justify-end pt-2">
            <Button type="submit" variant="default" size="sm" className="w-full sm:w-auto font-bold justify-center">
              ذخیره تغییرات ۲FA
            </Button>
          </div>
        </form>
      </div>

      {/* ── 4. Change Password Card ────────────────────────────────── */}
      <div className="rounded-3xl border border-[var(--theme-border-color)] bg-[var(--theme-surface)] p-4 sm:p-6 shadow-xs flex flex-col gap-4 text-right">
        <div className="flex items-center gap-2.5 border-b border-[var(--theme-border-color)] pb-3">
          <Lock className="h-4 w-4 text-sky-400 shrink-0" />
          <h3 className="text-sm font-bold text-[var(--theme-foreground)]">
            تغییر کلمه عبور حساب کاربری
          </h3>
        </div>

        {passError && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>{passError}</span>
          </div>
        )}

        {passToast && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{passToast}</span>
          </div>
        )}

        <form onSubmit={handleChangePassword} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="text-xs font-semibold text-neutral-300 block mb-1">
              کلمه عبور فعلی:
            </label>
            <input
              type="password"
              dir="ltr"
              value={currentPass}
              onChange={(e) => setCurrentPass(e.target.value)}
              className="w-full h-10 px-3 rounded-xl border border-[var(--theme-border-color)] bg-neutral-900 text-xs text-white focus:outline-none focus:border-orange-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-neutral-300 block mb-1">
              کلمه عبور جدید (حداقل ۸ کاراکتر):
            </label>
            <input
              type="password"
              dir="ltr"
              value={newPass}
              onChange={(e) => setNewPass(e.target.value)}
              className="w-full h-10 px-3 rounded-xl border border-[var(--theme-border-color)] bg-neutral-900 text-xs text-white focus:outline-none focus:border-orange-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-neutral-300 block mb-1">
              تکرار کلمه عبور جدید:
            </label>
            <input
              type="password"
              dir="ltr"
              value={confirmPass}
              onChange={(e) => setConfirmPass(e.target.value)}
              className="w-full h-10 px-3 rounded-xl border border-[var(--theme-border-color)] bg-neutral-900 text-xs text-white focus:outline-none focus:border-orange-500"
            />
          </div>

          <div className="sm:col-span-3 flex justify-end pt-2">
            <Button type="submit" variant="outline" size="sm" className="w-full sm:w-auto font-bold border-neutral-700 justify-center">
              به‌روزرسانی رمز عبور
            </Button>
          </div>
        </form>
      </div>

      {/* ── 5. Active Sessions Management ──────────────────────────── */}
      <div className="rounded-3xl border border-[var(--theme-border-color)] bg-[var(--theme-surface)] p-4 sm:p-6 shadow-xs flex flex-col gap-4 text-right">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--theme-border-color)] pb-3">
          <div className="flex items-center gap-2.5">
            <Laptop className="h-4 w-4 text-emerald-400 shrink-0" />
            <h3 className="text-sm font-bold text-[var(--theme-foreground)]">
              نشست‌های فعال و دستگاه‌های متصل به حساب
            </h3>
          </div>

          {securityState.activeSessions.length > 1 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsTerminateAllOpen(true)}
              className="text-xs text-rose-400 hover:bg-rose-500/10 cursor-pointer w-full sm:w-auto justify-center"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>خروج از تمام دستگاه‌های دیگر</span>
            </Button>
          )}
        </div>

        <div className="flex flex-col divide-y divide-neutral-800 text-xs">
          {securityState.activeSessions.map((session) => (
            <div
              key={session.id}
              className="py-3.5 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-300">
                  {session.os.includes("Android") ? (
                    <Smartphone className="h-4 w-4" />
                  ) : (
                    <Laptop className="h-4 w-4" />
                  )}
                </div>

                <div className="flex flex-col min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-neutral-200">{session.deviceName}</span>
                    {session.isCurrent && (
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded-full border border-emerald-500/30">
                        همین دستگاه (جاری)
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-neutral-400 mt-1 font-mono break-words leading-relaxed">
                    {session.browser} • {session.os} • آی‌پی: {session.ipAddress}
                  </span>
                  <span className="text-[11px] text-neutral-500 mt-0.5 leading-relaxed">
                    موقعیت: {session.location} • فعالیت: {session.lastActive}
                  </span>
                </div>
              </div>

              {!session.isCurrent && (
                <button
                  type="button"
                  onClick={() => terminateSingleSession(session.id)}
                  className="text-xs text-rose-400 hover:text-rose-300 self-start sm:self-center font-medium cursor-pointer py-1"
                >
                  خروج از این دستگاه
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── 6. Login History Log ───────────────────────────────────── */}
      <div className="rounded-3xl border border-[var(--theme-border-color)] bg-[var(--theme-surface)] p-4 sm:p-6 shadow-xs flex flex-col gap-4 text-right">
        <div className="flex items-center gap-2.5 border-b border-[var(--theme-border-color)] pb-3">
          <History className="h-4 w-4 text-neutral-400 shrink-0" />
          <h3 className="text-sm font-bold text-[var(--theme-foreground)]">
            تاریخچه آخرین فعالیت‌های ورود (Login Audit Log)
          </h3>
        </div>

        <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
          <table className="w-full min-w-[520px] text-xs text-right divide-y divide-neutral-800">
            <thead className="bg-neutral-900/60 text-neutral-400 font-semibold">
              <tr>
                <th className="p-3">تاریخ و ساعت</th>
                <th className="p-3">آدرس IP</th>
                <th className="p-3">دستگاه و سیستم‌عامل</th>
                <th className="p-3">موقعیت</th>
                <th className="p-3">وضعیت</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60 text-neutral-300 font-mono">
              {securityState.loginHistory.map((log) => (
                <tr key={log.id} className="hover:bg-neutral-900/30">
                  <td className="p-3 whitespace-nowrap">{toPersianDigits(log.timestamp)}</td>
                  <td className="p-3 whitespace-nowrap">{log.ipAddress}</td>
                  <td className="p-3 font-sans whitespace-nowrap">{log.device}</td>
                  <td className="p-3 font-sans whitespace-nowrap">{log.location}</td>
                  <td className="p-3 font-sans whitespace-nowrap">
                    <DashboardStatusBadge
                      label={log.statusLabel}
                      variant={log.status === "success" ? "success" : "danger"}
                      size="sm"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Terminate All Confirm Dialog */}
      <ConfirmDialog
        isOpen={isTerminateAllOpen}
        onClose={() => setIsTerminateAllOpen(false)}
        onConfirm={() => {
          terminateOtherSessions();
          setIsTerminateAllOpen(false);
        }}
        title="خروج اضطراری از سایر دستگاه‌ها"
        message="با این کار، تمام نشست‌های ورود دیگر روی گوشی‌های موبایل، لپ‌تاپ‌ها یا تبلت‌ها بسته شده و مجدداً نیاز به احراز هویت خواهند داشت."
        confirmLabel="بله، خروج از همه"
        cancelLabel="انصراف"
        variant="warning"
      />
    </div>
  );
}
