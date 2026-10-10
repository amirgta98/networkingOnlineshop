"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Wifi, CheckCircle2, ArrowLeft, Shield, ExternalLink } from "lucide-react";
import { useAuth } from "../context/auth-context";
import { PhoneStep } from "./steps/phone-step";
import { OtpStep } from "./steps/otp-step";
import { TwoFactorStep } from "./steps/two-factor-step";
import { RoleBadge } from "./role-badge";

export interface AuthCardProps {
  redirectUrl?: string;
  className?: string;
}

export function AuthCard({ redirectUrl, className }: AuthCardProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const targetRedirect = redirectUrl || searchParams?.get("redirect") || null;

  const { step, user, challenge, getRedirectUrlForRole } = useAuth();
  const [redirectCountdown, setRedirectCountdown] = React.useState<number>(2);

  // When reaching "success" step, wait briefly and redirect to the appropriate layer
  React.useEffect(() => {
    if (step !== "success" || !user) return;

    const timer = setInterval(() => {
      setRedirectCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          const destination = targetRedirect || getRedirectUrlForRole(user.role);
          router.push(destination);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [step, user, targetRedirect, getRedirectUrlForRole, router]);

  // Step indicator status: 2FA step is strictly hidden by default!
  // Only shown if the user has actively enabled two-factor authentication in their panel.
  const hasTwoFactor = challenge?.hasTwoFactor === true || step === "2fa";

  const stepsMeta = React.useMemo(() => {
    if (hasTwoFactor) {
      return [
        { id: "phone", label: "شماره همراه" },
        { id: "otp", label: "کد ۵ رقمی" },
        { id: "2fa", label: "تایید ۲ مرحله‌ای" },
      ];
    }
    return [
      { id: "phone", label: "شماره همراه" },
      { id: "otp", label: "کد ۵ رقمی" },
    ];
  }, [hasTwoFactor]);

  const getStepStatus = (stepId: string) => {
    if (step === "success") return "completed";
    if (step === stepId) return "current";
    if (step === "2fa" && (stepId === "phone" || stepId === "otp")) return "completed";
    if (step === "otp" && stepId === "phone") return "completed";
    return "upcoming";
  };

  return (
    <div
      className={`relative w-full max-w-md overflow-hidden rounded-3xl border border-[var(--theme-border-color)] bg-[var(--theme-surface)]/90 p-6 sm:p-8 backdrop-blur-2xl shadow-2xl ${
        className || ""
      }`}
      dir="rtl"
    >
      {/* Top subtle glow light effect */}
      <div className="absolute -top-24 left-1/2 h-44 w-72 -translate-x-1/2 rounded-full bg-[var(--theme-primary)]/15 blur-3xl pointer-events-none" />

      {/* Brand Header */}
      <div className="flex flex-col items-center justify-center text-center mb-6">
        <div
          className="flex h-12 w-12 items-center justify-center rounded-2xl shadow-lg shadow-[var(--theme-primary)]/20 mb-3"
          style={{
            background: "linear-gradient(135deg, #c2410c 0%, #ea580c 100%)",
          }}
        >
          <Wifi className="h-6 w-6 text-white" />
        </div>
        <h1 className="text-xl font-black text-[var(--theme-foreground)] tracking-tight">
          سامانه یکپارچه ورود به ققنوس آکادمی
        </h1>
        <p className="text-xs text-[var(--theme-muted)] mt-1">
          زیرساخت تجهیزات شبکه و راهکارهای داده‌محور
        </p>
      </div>

      {/* Step Stepper Indicator (Hidden when in success) */}
      {step !== "success" && (
        <div className="mb-6 flex items-center justify-between border-y border-[var(--theme-border-color)] py-3 px-2">
          {stepsMeta.map((s, idx) => {
            const status = getStepStatus(s.id);
            return (
              <React.Fragment key={s.id}>
                <div className="flex items-center gap-1.5">
                  <span
                    className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold transition-all ${
                      status === "completed"
                        ? "bg-emerald-500 text-black font-black"
                        : status === "current"
                        ? "bg-[var(--theme-primary)] text-white shadow-sm ring-2 ring-[var(--theme-primary)]/30"
                        : "bg-neutral-800 text-neutral-500"
                    }`}
                  >
                    {status === "completed" ? "✓" : idx + 1}
                  </span>
                  <span
                    className={`text-[11px] font-medium ${
                      status === "current"
                        ? "text-[var(--theme-foreground)] font-bold"
                        : status === "completed"
                        ? "text-emerald-400"
                        : "text-neutral-500"
                    }`}
                  >
                    {s.label}
                  </span>
                </div>
                {idx < stepsMeta.length - 1 && (
                  <div
                    className={`h-[1px] flex-1 mx-2 transition-all ${
                      status === "completed"
                        ? "bg-emerald-500/50"
                        : "bg-[var(--theme-border-color)]"
                    }`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      )}

      {/* Animated Step Content */}
      <AnimatePresence mode="wait">
        {step === "phone" && (
          <motion.div
            key="phone"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            <PhoneStep />
          </motion.div>
        )}

        {step === "otp" && (
          <motion.div
            key="otp"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            <OtpStep />
          </motion.div>
        )}

        {step === "2fa" && (
          <motion.div
            key="2fa"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            <TwoFactorStep />
          </motion.div>
        )}

        {step === "success" && user && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center text-center py-4 gap-4"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
              <CheckCircle2 className="h-9 w-9 text-emerald-400" />
            </div>

            <div className="flex flex-col gap-1">
              <h2 className="text-xl font-extrabold text-[var(--theme-foreground)]">
                احراز هویت با موفقیت انجام شد
              </h2>
              <p className="text-sm text-neutral-300">
                خوش آمدید، <span className="font-bold text-white">{user.name}</span>
              </p>
            </div>

            {/* Role Badge Indicator */}
            <div className="flex flex-col items-center gap-1.5">
              <span className="text-[11px] text-neutral-400">سطح دسترسی و لایه کاربری:</span>
              <RoleBadge role={user.role} size="lg" />
            </div>

            {/* Destination Layer Indicator */}
            <div className="w-full rounded-2xl border border-[var(--theme-border-color)] bg-neutral-900/60 p-4 text-right flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs text-neutral-300">
                <span className="font-semibold">انتقال خودکار به لایه اختصاصی:</span>
                <span className="font-mono text-emerald-400 font-bold">
                  {user.role === "admin"
                    ? "پنل مدیریت کل (ادمین)"
                    : user.role === "partner"
                    ? "پرتال سازمانی و همکاران"
                    : "داشبورد کاربر عادی"}
                </span>
              </div>

              <div className="h-1.5 w-full overflow-hidden rounded-full bg-neutral-800">
                <div
                  className="h-full bg-emerald-500 transition-all duration-1000 ease-linear"
                  style={{ width: `${((3 - redirectCountdown) / 3) * 100}%` }}
                />
              </div>

              <button
                type="button"
                onClick={() => {
                  const dest = targetRedirect || getRedirectUrlForRole(user.role);
                  router.push(dest);
                }}
                className="mt-1 flex items-center justify-center gap-1.5 text-xs text-[var(--theme-primary)] hover:underline font-semibold cursor-pointer"
              >
                <span>انتقال فوری به پنل</span>
                <ExternalLink className="h-3 w-3" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
