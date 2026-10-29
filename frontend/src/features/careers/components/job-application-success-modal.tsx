"use client";

import * as React from "react";
import {
  CheckCircle2,
  X,
  Copy,
  Check,
  PhoneCall,
  Briefcase,
  User,
  Clock,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import type { SubmissionResult } from "../types";

export interface JobApplicationSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: SubmissionResult | null;
  onExploreOtherPositions?: () => void;
}

export function JobApplicationSuccessModal({
  isOpen,
  onClose,
  result,
  onExploreOtherPositions,
}: JobApplicationSuccessModalProps) {
  const [copied, setCopied] = React.useState(false);

  // Close on Escape key
  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen || !result) return null;

  const handleCopy = () => {
    if (result.trackingCode && typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(result.trackingCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    }
  };

  const handleExplore = () => {
    onClose();
    if (onExploreOtherPositions) {
      onExploreOtherPositions();
    } else {
      const el = document.getElementById("careers-positions-list");
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="job-success-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in"
      onClick={onClose}
      dir="rtl"
    >
      <div
        className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-emerald-500/40 bg-gradient-to-b from-[#131b17] via-[#0f1311] to-[#0c0e0d] p-6 sm:p-8 shadow-2xl text-center animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Ambient background glow */}
        <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-56 w-72 rounded-full bg-emerald-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 left-1/2 -translate-x-1/2 h-48 w-60 rounded-full bg-orange-500/10 blur-3xl" />

        {/* Close Button (X) */}
        <button
          type="button"
          onClick={onClose}
          aria-label="بستن پنجره"
          className="absolute left-4 top-4 flex h-9 w-9 items-center justify-center rounded-xl bg-neutral-800/80 text-neutral-400 hover:bg-neutral-700 hover:text-white transition-colors cursor-pointer border border-neutral-700/60"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Big Success Icon with glowing ring */}
        <div className="relative mx-auto mb-4 flex h-20 w-20 items-center justify-center">
          <div className="absolute inset-0 rounded-3xl bg-emerald-500/20 blur-xl animate-pulse" />
          <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-emerald-500/30 to-emerald-700/20 border border-emerald-400/50 text-emerald-400 shadow-[0_0_35px_rgba(16,185,129,0.35)]">
            <CheckCircle2 className="h-11 w-11" />
          </div>
        </div>

        {/* Top Badge */}
        <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/15 px-3 py-1 text-xs font-bold text-emerald-400 mb-3 shadow-xs">
          <Sparkles className="h-3.5 w-3.5" />
          <span>درخواست همکاری با موفقیت ثبت گردید</span>
        </div>

        {/* Exact message requested by the user */}
        <h2
          id="job-success-title"
          className="text-lg sm:text-xl md:text-2xl font-black text-white leading-snug mb-3"
        >
          درخواست شما ثبت شد و در صورت قبولی شما با شما تماس گرفته خواهد شد
        </h2>

        {/* Supporting description */}
        <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed max-w-md mx-auto mb-6">
          اطلاعات و رزومه کاری شما در سامانه جذب منابع انسانی ققنوس آکادمی ثبت گردید. پس از بررسی و تطبیق شرایط با موقعیت شغلی، کارشناسان ما با شما تماس خواهند گرفت.
        </p>

        {/* Tracking Code Ticket Box */}
        <div className="rounded-2xl border border-emerald-500/30 bg-neutral-900/80 p-4 mb-5 text-right shadow-inner">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-3 mb-3">
            <span className="text-xs text-neutral-400 font-medium">کد رهگیری اختصاصی:</span>
            <div className="flex items-center gap-2">
              <span className="font-mono text-base sm:text-lg font-black text-emerald-400 tracking-wider" dir="ltr">
                {result.trackingCode}
              </span>
              <button
                type="button"
                onClick={handleCopy}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-emerald-500/40 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 text-xs font-semibold transition-all cursor-pointer"
                title="کپی کد رهگیری"
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                    <span>کپی شد!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>کپی</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between text-neutral-300">
              <span className="flex items-center gap-1.5 text-neutral-400">
                <User className="h-3.5 w-3.5 text-neutral-500" />
                <span>نام متقاضی:</span>
              </span>
              <span className="font-semibold text-white">{result.fullName}</span>
            </div>

            <div className="flex items-center justify-between text-neutral-300">
              <span className="flex items-center gap-1.5 text-neutral-400">
                <Briefcase className="h-3.5 w-3.5 text-neutral-500" />
                <span>موقعیت انتخابی:</span>
              </span>
              <span className="font-semibold text-white">{result.positionTitle}</span>
            </div>

            {result.phoneNumber && (
              <div className="flex items-center justify-between text-neutral-300">
                <span className="flex items-center gap-1.5 text-neutral-400">
                  <PhoneCall className="h-3.5 w-3.5 text-neutral-500" />
                  <span>شماره تماس:</span>
                </span>
                <span className="font-mono text-neutral-300" dir="ltr">
                  {result.phoneNumber}
                </span>
              </div>
            )}

            <div className="flex items-center justify-between text-neutral-300">
              <span className="flex items-center gap-1.5 text-neutral-400">
                <Clock className="h-3.5 w-3.5 text-neutral-500" />
                <span>زمان ثبت:</span>
              </span>
              <span className="font-mono text-neutral-400">{result.submittedAt}</span>
            </div>
          </div>
        </div>

        {/* Notice alert */}
        <div className="flex items-start gap-2.5 rounded-xl border border-sky-500/20 bg-sky-500/10 p-3 text-right text-xs text-sky-300 mb-6">
          <PhoneCall className="h-4 w-4 shrink-0 text-sky-400 mt-0.5" />
          <p className="leading-relaxed text-[11px] sm:text-xs">
            لطفاً در روزهای کاری آینده تلفن همراه خود را در دسترس نگه دارید. در صورت تایید اولیه رزومه، هماهنگی جلسه مصاحبه از طریق تماس تلفنی انجام خواهد شد.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <Button
            type="button"
            onClick={onClose}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold h-11 rounded-xl shadow-lg shadow-emerald-600/25 cursor-pointer"
          >
            <span>متوجه شدم</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={handleExplore}
            className="w-full border-neutral-700 hover:bg-neutral-800 text-neutral-200 h-11 rounded-xl cursor-pointer"
          >
            <span>مشاهده سایر فرصت‌های شغلی</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
