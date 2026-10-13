"use client";

import * as React from "react";
import { Smartphone, ArrowLeft } from "lucide-react";
import { useAuth } from "../../context/auth-context";
import {
  isValidIranianMobile,
  normalizePhoneNumber,
} from "../../api/mock-users";
import { Button } from "@/shared/components/ui/button";

export interface PhoneStepProps {
  onSuccess?: () => void;
}

export function PhoneStep({ onSuccess }: PhoneStepProps) {
  const { sendOtp, isLoading, error } = useAuth();
  const [phone, setPhone] = React.useState<string>("");
  const [localError, setLocalError] = React.useState<string | null>(null);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const cleaned = normalizePhoneNumber(raw);
    setPhone(cleaned);
    if (localError) setLocalError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const normalized = normalizePhoneNumber(phone);

    if (!normalized) {
      setLocalError("لطفاً شماره موبایل خود را وارد کنید.");
      return;
    }

    if (!isValidIranianMobile(normalized)) {
      setLocalError("شماره همراه باید ۱۱ رقم و با پیش‌شماره ۰۹ باشد (مثال: ۰۹۱۲۳۴۵۶۷۸۹)");
      return;
    }

    setLocalError(null);
    const ok = await sendOtp(normalized);
    if (ok && onSuccess) {
      onSuccess();
    }
  };

  return (
    <div className="flex flex-col gap-5" dir="rtl">
      {/* Step Header */}
      <div className="text-right">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--theme-primary)]/15 text-[var(--theme-primary)]">
            <Smartphone className="h-4 w-4" />
          </span>
          <h2 className="text-lg font-bold text-[var(--theme-foreground)]">
            ورود یا عضویت
          </h2>
        </div>
        <p className="text-xs text-[var(--theme-muted)] leading-relaxed">
          برای دسترسی به پنل کاربری، سازمانی یا مدیریت، شماره تلفن همراه خود را وارد کنید. کد تایید ۵ رقمی برایتان پیامک خواهد شد.
        </p>
      </div>

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="auth-phone-input"
            className="text-xs font-semibold text-[var(--theme-foreground)]"
          >
            شماره تلفن همراه
          </label>
          <div className="relative">
            <input
              id="auth-phone-input"
              type="tel"
              inputMode="numeric"
              autoComplete="tel"
              placeholder="۰۹۱۲۳۴۵۶۷۸۹"
              value={phone}
              onChange={handlePhoneChange}
              maxLength={11}
              autoFocus
              className={`h-11 w-full rounded-xl border bg-black/40 px-3.5 pl-14 text-sm font-mono tracking-wider text-left text-[var(--theme-foreground)] placeholder:text-neutral-500 transition-all focus:outline-none focus:ring-2 ${
                localError || error
                  ? "border-red-500/80 focus:ring-red-500/20"
                  : "border-[var(--theme-border-color)] hover:border-neutral-600 focus:border-[var(--theme-primary)] focus:ring-[var(--theme-primary)]/20"
              }`}
              dir="ltr"
            />
            {/* Country code prefix badge */}
            <div className="absolute left-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1 border-r border-neutral-700/60 pr-2 text-xs font-mono font-medium text-neutral-400 select-none">
              <span>+۹۸</span>
              <span className="text-[10px] text-neutral-500">IR</span>
            </div>
          </div>

          {(localError || error) && (
            <p className="text-[11px] text-red-400 font-medium mt-0.5">
              {localError || error}
            </p>
          )}
        </div>

        {/* Submit button */}
        <Button
          type="submit"
          isLoading={isLoading}
          disabled={isLoading || phone.length < 10}
          className="h-11 w-full rounded-xl font-semibold shadow-lg shadow-[var(--theme-primary)]/15 gap-2 cursor-pointer"
        >
          <span>ارسال کد تایید ۵ رقمی</span>
          <ArrowLeft className="h-4 w-4" />
        </Button>
      </form>

      {/* Security and privacy note */}
      <p className="text-[11px] text-neutral-500 text-center leading-relaxed">
        ورود شما به منزله پذیرش{" "}
        <a href="#" className="underline hover:text-neutral-300">
          قوانین حریم خصوصی
        </a>{" "}
        و{" "}
        <a href="#" className="underline hover:text-neutral-300">
          شرایط استفاده
        </a>{" "}
        ققنوس آکادمی است.
      </p>
    </div>
  );
}
