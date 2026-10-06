"use client";

import * as React from "react";
import { MessageSquareCode, ArrowLeft, RefreshCw, Pencil, CheckCircle2, ShieldCheck } from "lucide-react";
import { useAuth } from "../../context/auth-context";
import { useOtpCountdown } from "../../hooks/use-otp-countdown";
import { normalizePhoneNumber } from "../../api/mock-users";
import { Button } from "@/shared/components/ui/button";

export interface OtpStepProps {
  onSuccess?: () => void;
}

export function OtpStep({ onSuccess }: OtpStepProps) {
  const { challenge, verifyOtp, resendOtp, setStep, isLoading, error } = useAuth();
  const [digits, setDigits] = React.useState<string[]>(["", "", "", "", ""]);
  const [localError, setLocalError] = React.useState<string | null>(null);
  const inputRefs = React.useRef<(HTMLInputElement | null)[]>([]);

  // 120-second countdown for SMS resend
  const { secondsLeft, isFinished, formattedPersianTime, start } = useOtpCountdown({
    initialSeconds: 120,
    autoStart: true,
  });

  // Focus the first empty digit box on mount
  React.useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const fullCode = digits.join("");

  // Handle single digit input
  const handleDigitChange = (index: number, value: string) => {
    // Extract only the last typed digit if multiple characters
    const clean = normalizePhoneNumber(value).slice(-1);

    const newDigits = [...digits];
    newDigits[index] = clean;
    setDigits(newDigits);
    setLocalError(null);

    // Auto-focus next input if digit entered
    if (clean && index < 4) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all 5 digits are entered
    const updatedFull = newDigits.join("");
    if (updatedFull.length === 5 && !newDigits.includes("")) {
      handleVerify(updatedFull);
    }
  };

  // Keyboard navigation (Backspace, Arrow keys)
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (!digits[index] && index > 0) {
        // Move back to previous box and clear it
        const newDigits = [...digits];
        newDigits[index - 1] = "";
        setDigits(newDigits);
        inputRefs.current[index - 1]?.focus();
      } else {
        const newDigits = [...digits];
        newDigits[index] = "";
        setDigits(newDigits);
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      // In RTL, left arrow moves to next box (or previous depending on layout direction)
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < 4) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle pasting entire code
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text");
    const cleaned = normalizePhoneNumber(pasted).replace(/\D/g, "");
    if (!cleaned) return;

    const newDigits = ["", "", "", "", ""];
    for (let i = 0; i < 5 && i < cleaned.length; i++) {
      newDigits[i] = cleaned[i];
    }
    setDigits(newDigits);
    setLocalError(null);

    // Focus last filled or submit if 5 digits
    const nextIndex = Math.min(cleaned.length, 4);
    inputRefs.current[nextIndex]?.focus();

    if (cleaned.length >= 5) {
      handleVerify(newDigits.join(""));
    }
  };

  // Auto-fill dev code helper
  const handleFillDevCode = () => {
    const dev = challenge?.devCode || "54321";
    const newDigits = dev.split("").slice(0, 5);
    setDigits(newDigits);
    setLocalError(null);
    handleVerify(dev);
  };

  const handleVerify = async (codeToVerify: string) => {
    if (codeToVerify.length !== 5) {
      setLocalError("لطفاً کد تایید ۵ رقمی را کامل وارد کنید.");
      return;
    }
    setLocalError(null);
    const ok = await verifyOtp(codeToVerify);
    if (ok && onSuccess) {
      onSuccess();
    }
  };

  const handleResend = async () => {
    if (!isFinished || isLoading) return;
    const ok = await resendOtp();
    if (ok) {
      start(120);
      setDigits(["", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    }
  };

  return (
    <div className="flex flex-col gap-5" dir="rtl">
      {/* Step Header */}
      <div className="text-right">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--theme-primary)]/15 text-[var(--theme-primary)]">
              <MessageSquareCode className="h-4 w-4" />
            </span>
            <h2 className="text-lg font-bold text-[var(--theme-foreground)]">
              کد تایید ۵ رقمی
            </h2>
          </div>

          {/* Edit phone button */}
          <button
            type="button"
            onClick={() => setStep("phone")}
            className="flex items-center gap-1 text-xs text-[var(--theme-primary)] hover:underline cursor-pointer transition-colors"
          >
            <Pencil className="h-3 w-3" />
            <span>ویرایش شماره</span>
          </button>
        </div>

        <p className="text-xs text-[var(--theme-muted)] leading-relaxed">
          کد پیامک شده به شماره{" "}
          <span className="font-mono font-bold text-[var(--theme-foreground)]" dir="ltr">
            {challenge?.maskedPhone || challenge?.phone}
          </span>{" "}
          را وارد نمایید:
        </p>
      </div>

      {/* 5-box OTP Input */}
      <div className="flex flex-col items-center gap-3">
        <div className="flex items-center justify-center gap-2.5 sm:gap-3" dir="ltr">
          {digits.map((digit, idx) => (
            <input
              key={idx}
              ref={(el) => {
                inputRefs.current[idx] = el;
              }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleDigitChange(idx, e.target.value)}
              onKeyDown={(e) => handleKeyDown(idx, e)}
              onPaste={handlePaste}
              aria-label={`رقم ${idx + 1} از ۵`}
              className={`h-14 w-11 sm:h-16 sm:w-13 rounded-xl border bg-black/40 text-center text-2xl font-mono font-bold text-[var(--theme-foreground)] transition-all select-none focus:outline-none focus:ring-2 ${
                digit
                  ? "border-[var(--theme-primary)]/80 shadow-[0_0_12px_rgba(234,88,12,0.25)]"
                  : "border-[var(--theme-border-color)] hover:border-neutral-600"
              } ${
                localError || error
                  ? "border-red-500/80 focus:ring-red-500/20"
                  : "focus:border-[var(--theme-primary)] focus:ring-[var(--theme-primary)]/30"
              }`}
            />
          ))}
        </div>

        {(localError || error) && (
          <p className="text-xs text-red-400 font-medium text-center">
            {localError || error}
          </p>
        )}
      </div>

      {/* Dev helper pill for fast evaluation */}
      <div className="rounded-xl border border-dashed border-amber-500/30 bg-amber-500/5 p-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-xs text-amber-300">
          <ShieldCheck className="h-4 w-4 shrink-0 text-amber-400" />
          <span>
            کد پیامک تستی:{" "}
            <span className="font-mono font-bold text-amber-200">
              {challenge?.devCode || "۵۴۳۲۱"}
            </span>
          </span>
        </div>
        <button
          type="button"
          onClick={handleFillDevCode}
          className="text-[11px] px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 font-semibold transition-colors cursor-pointer"
        >
          تکمیل خودکار
        </button>
      </div>

      {/* Submit Button */}
      <Button
        type="button"
        onClick={() => handleVerify(fullCode)}
        isLoading={isLoading}
        disabled={isLoading || fullCode.length !== 5}
        className="h-11 w-full rounded-xl font-semibold shadow-lg shadow-[var(--theme-primary)]/15 gap-2 cursor-pointer"
      >
        <span>تایید و ادامه</span>
        <ArrowLeft className="h-4 w-4" />
      </Button>

      {/* Resend SMS Counter & Action */}
      <div className="flex items-center justify-between text-xs text-neutral-400 pt-1">
        <button
          type="button"
          onClick={() => setStep("phone")}
          className="hover:text-neutral-200 transition-colors cursor-pointer"
        >
          تغییر شماره همراه
        </button>

        {isFinished ? (
          <button
            type="button"
            onClick={handleResend}
            disabled={isLoading}
            className="flex items-center gap-1.5 text-[var(--theme-primary)] hover:underline font-semibold cursor-pointer transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>ارسال مجدد پیامک</span>
          </button>
        ) : (
          <span className="flex items-center gap-1.5 text-neutral-400">
            <span>ارسال مجدد پس از:</span>
            <span className="font-mono font-semibold text-neutral-200">
              {formattedPersianTime}
            </span>
          </span>
        )}
      </div>
    </div>
  );
}
