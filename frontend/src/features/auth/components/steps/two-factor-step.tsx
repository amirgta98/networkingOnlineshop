"use client";

import * as React from "react";
import {
  ShieldCheck,
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
  KeyRound,
  QrCode,
  AlertCircle,
  HelpCircle,
  Sparkles,
} from "lucide-react";
import { useAuth } from "../../context/auth-context";
import { Button } from "@/shared/components/ui/button";

export interface TwoFactorStepProps {
  onSuccess?: () => void;
}

export function TwoFactorStep({ onSuccess }: TwoFactorStepProps) {
  const { verifyTwoFactor, setStep, challenge, isLoading, error } = useAuth();
  const [pin, setPin] = React.useState<string>("");
  const [showPassword, setShowPassword] = React.useState<boolean>(false);
  const [authMethod, setAuthMethod] = React.useState<"pin" | "totp">("pin");
  const [localError, setLocalError] = React.useState<string | null>(null);

  // Determine hint for demo
  const isAdminPhone = challenge?.phone === "09129999999";
  const demoPin = isAdminPhone ? "999999" : "123456";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pin.trim()) {
      setLocalError("لطفاً رمز دوم یا کد امنیتی را وارد کنید.");
      return;
    }

    setLocalError(null);
    const ok = await verifyTwoFactor(pin.trim());
    if (ok && onSuccess) {
      onSuccess();
    }
  };

  const handleFillDemoPin = () => {
    setPin(demoPin);
    setLocalError(null);
  };

  return (
    <div className="flex flex-col gap-5" dir="rtl">
      {/* High-Security Layer Header */}
      <div className="relative overflow-hidden rounded-2xl border border-amber-500/30 bg-gradient-to-b from-amber-500/10 via-amber-500/5 to-transparent p-4 text-right">
        {/* Subtle LED security dot */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40">
              <ShieldCheck className="h-4 w-4" />
            </span>
            <div>
              <span className="text-[10px] font-semibold tracking-wider text-amber-400 uppercase">
                لایه احراز هویت پیشرفته
              </span>
              <h2 className="text-base font-bold text-[var(--theme-foreground)]">
                تایید هویت دو مرحله‌ای (۲FA)
              </h2>
            </div>
          </div>

          <span className="flex items-center gap-1 text-[11px] font-medium text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
            فعال
          </span>
        </div>

        <p className="text-xs text-neutral-300 leading-relaxed">
          برای حفظ امنیت سازمان و اطلاعات شما، این حساب کاربری مجهز به لایه امنیتی دو مرحله‌ای است. لطفاً رمز عبور امنیتی خود را وارد نمایید.
        </p>
      </div>

      {/* Auth Method Selector Tabs */}
      <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-neutral-900/60 border border-[var(--theme-border-color)]">
        <button
          type="button"
          onClick={() => {
            setAuthMethod("pin");
            setLocalError(null);
          }}
          className={`flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            authMethod === "pin"
              ? "bg-[var(--theme-surface-alt)] text-[var(--theme-foreground)] shadow-sm border border-neutral-700/60"
              : "text-neutral-400 hover:text-neutral-200"
          }`}
        >
          <KeyRound className="h-3.5 w-3.5 text-amber-400" />
          <span>رمز دوم اختصاصی</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setAuthMethod("totp");
            setLocalError(null);
          }}
          className={`flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            authMethod === "totp"
              ? "bg-[var(--theme-surface-alt)] text-[var(--theme-foreground)] shadow-sm border border-neutral-700/60"
              : "text-neutral-400 hover:text-neutral-200"
          }`}
        >
          <QrCode className="h-3.5 w-3.5 text-sky-400" />
          <span>کد احراز هویت (TOTP)</span>
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="auth-2fa-input"
            className="text-xs font-semibold text-[var(--theme-foreground)] flex items-center justify-between"
          >
            <span>
              {authMethod === "pin" ? "رمز دوم یا PIN امنیتی" : "کد ۶ رقمی نرم‌افزار Authenticator"}
            </span>
            <span className="text-[10px] text-neutral-400">حداقل ۶ کاراکتر</span>
          </label>

          <div className="relative">
            <input
              id="auth-2fa-input"
              type={showPassword ? "text" : "password"}
              placeholder={authMethod === "pin" ? "رمز عبور دوم را وارد کنید" : "مثال: ۱۲۳۴۵۶"}
              value={pin}
              onChange={(e) => {
                setPin(e.target.value);
                if (localError) setLocalError(null);
              }}
              autoFocus
              className={`h-11 w-full rounded-xl border bg-black/40 px-3.5 pl-10 text-sm font-mono tracking-wider text-[var(--theme-foreground)] placeholder:text-neutral-500 transition-all focus:outline-none focus:ring-2 ${
                localError || error
                  ? "border-red-500/80 focus:ring-red-500/20"
                  : "border-[var(--theme-border-color)] hover:border-neutral-600 focus:border-amber-500/80 focus:ring-amber-500/20"
              }`}
              dir={showPassword ? "ltr" : "ltr"}
            />

            {/* Toggle show/hide password */}
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "مخفی کردن رمز" : "نمایش رمز"}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-200 transition-colors cursor-pointer"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          {(localError || error) && (
            <p className="text-xs text-red-400 font-medium mt-0.5 flex items-center gap-1">
              <AlertCircle className="h-3 w-3 shrink-0" />
              <span>{localError || error}</span>
            </p>
          )}
        </div>

        {/* Demo Assistant Card for fast evaluation */}
        <div className="rounded-xl border border-dashed border-amber-500/30 bg-amber-500/5 p-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs text-amber-300">
            <Sparkles className="h-3.5 w-3.5 text-amber-400 shrink-0" />
            <span>
              رمز دوم تستی این اکانت:{" "}
              <span className="font-mono font-bold text-amber-200">{demoPin}</span>
            </span>
          </div>
          <button
            type="button"
            onClick={handleFillDemoPin}
            className="text-[11px] px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 font-semibold transition-colors cursor-pointer"
          >
            تکمیل خودکار
          </button>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          isLoading={isLoading}
          disabled={isLoading || !pin.trim()}
          className="h-11 w-full rounded-xl font-semibold bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 shadow-lg shadow-amber-600/20 gap-2 cursor-pointer text-white"
        >
          <span>تایید هویت و ورود به پنل</span>
          <ArrowLeft className="h-4 w-4" />
        </Button>
      </form>

      {/* Auxiliary actions */}
      <div className="flex items-center justify-between text-xs text-neutral-400 pt-1">
        <button
          type="button"
          onClick={() => setStep("otp")}
          className="hover:text-neutral-200 transition-colors cursor-pointer"
        >
          بازگشت به کد پیامکی
        </button>

        <a
          href="tel:09134761097"
          className="flex items-center gap-1 text-neutral-400 hover:text-neutral-200 transition-colors"
        >
          <HelpCircle className="h-3.5 w-3.5" />
          <span>فراموشی رمز دوم؟</span>
        </a>
      </div>
    </div>
  );
}
