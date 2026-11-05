"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  Copy,
  Check,
  ExternalLink,
  X,
  Smartphone,
  Globe,
  Info,
  ShieldCheck,
} from "lucide-react";

interface RecruitmentTelegramModalProps {
  isOpen: boolean;
  onClose: () => void;
  telegramId?: string;
}

export function RecruitmentTelegramModal({
  isOpen,
  onClose,
  telegramId = "@ghoghnoos_academy",
}: RecruitmentTelegramModalProps) {
  const [copied, setCopied] = React.useState(false);

  // Normalize telegram handle (strip @, URL prefixes if any)
  const cleanId = React.useMemo(() => {
    if (!telegramId) return "ghoghnoos_academy";
    return telegramId
      .replace(/^https?:\/\/(t\.me|telegram\.me)\//i, "")
      .replace(/^@/, "")
      .trim();
  }, [telegramId]);

  const displayHandle = `@${cleanId}`;
  const deepLink = `tg://resolve?domain=${cleanId}`;
  const webLink = `https://t.me/${cleanId}`;

  // Keyboard accessibility: Escape to close
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  const handleCopy = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(displayHandle);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="telegram-modal-title"
          dir="rtl"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
            aria-hidden="true"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 16 }}
            transition={{ type: "spring", damping: 25, stiffness: 350 }}
            className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-sky-500/30 bg-[#12141c] p-6 sm:p-8 text-right shadow-2xl shadow-sky-950/40 z-10"
          >
            {/* Ambient Background Glow */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -top-24 -right-24 h-56 w-56 rounded-full bg-sky-500/15 blur-3xl"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -bottom-24 -left-24 h-56 w-56 rounded-full bg-blue-600/10 blur-3xl"
            />

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="absolute top-5 left-5 flex h-9 w-9 items-center justify-center rounded-xl bg-neutral-800/80 text-neutral-400 hover:bg-neutral-700 hover:text-white transition-colors cursor-pointer"
              aria-label="بستن پنجره"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Header with Telegram Icon */}
            <div className="flex items-start gap-4 mb-6">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400 to-blue-600 text-white shadow-lg shadow-sky-500/30">
                <Send className="h-6 w-6 ml-0.5" />
              </div>
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-sky-500/15 border border-sky-500/25 px-2.5 py-0.5 text-[11px] font-semibold text-sky-400">
                  <ShieldCheck className="h-3 w-3" />
                  <span>کانال رسمی ارتباط با منابع انسانی</span>
                </div>
                <h3
                  id="telegram-modal-title"
                  className="text-lg sm:text-xl font-bold text-white tracking-tight"
                >
                  ارتباط مستقیم با کارشناس جذب استعدادها
                </h3>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed mb-5">
              جهت ارسال رزومه، پیگیری مصاحبه و پاسخ به سوالات استخدامی، از طریق پیام‌رسان تلگرام با واحد جذب ققنوس آکادمی در ارتباط باشید:
            </p>

            {/* ── Mono Username Box with Copy Button ─────────────────────── */}
            <div className="mb-6 rounded-2xl border border-sky-500/20 bg-sky-950/20 p-4">
              <div className="flex items-center justify-between text-xs text-neutral-400 mb-2">
                <span>شناسه کاربری (آیدی) تلگرام:</span>
                {copied && (
                  <span className="text-emerald-400 font-semibold animate-fade-in">
                    کپی شد!
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between gap-3 bg-neutral-900/90 border border-neutral-800 rounded-xl px-3.5 py-2.5">
                <span
                  className="font-mono text-base font-bold text-sky-400 tracking-wider selection:bg-sky-500 selection:text-white"
                  dir="ltr"
                >
                  {displayHandle}
                </span>

                <button
                  type="button"
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 px-3 py-1.5 text-xs font-semibold text-neutral-200 hover:text-white transition-all cursor-pointer"
                  title="کپی آیدی تلگرام"
                >
                  {copied ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                      <span className="text-emerald-400">کپی شد</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5 text-neutral-400" />
                      <span>کپی آیدی</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* ── Action Buttons ────────────────────────────────────────── */}
            <div className="space-y-3 mb-6">
              {/* Primary Button: Native Telegram Deep-link Protocol */}
              <a
                href={deepLink}
                className="group flex w-full items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-sky-500 via-sky-600 to-blue-600 px-5 py-3.5 text-xs sm:text-sm font-bold text-white shadow-lg shadow-sky-600/30 transition-all duration-150 hover:from-sky-400 hover:to-blue-500 active:scale-[0.98] cursor-pointer"
              >
                <Smartphone className="h-4 w-4 transition-transform group-hover:scale-110" />
                <span>باز کردن در اپلیکیشن تلگرام (بدون فیلترینگ)</span>
              </a>

              {/* Secondary Button: Web Link */}
              <a
                href={webLink}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex w-full items-center justify-center gap-2.5 rounded-xl border border-neutral-700 bg-neutral-900/80 px-5 py-3 text-xs sm:text-sm font-semibold text-neutral-300 transition-all duration-150 hover:border-neutral-600 hover:bg-neutral-800 hover:text-white active:scale-[0.98] cursor-pointer"
              >
                <Globe className="h-4 w-4 text-sky-400 transition-transform group-hover:scale-110" />
                <span>باز کردن در مرورگر وب (t.me)</span>
                <ExternalLink className="h-3.5 w-3.5 text-neutral-500 group-hover:text-neutral-300" />
              </a>
            </div>

            {/* ── Friendly Troubleshooting / Filter Bypass Guide ─────────── */}
            <div className="rounded-xl border border-neutral-800/80 bg-neutral-900/50 p-3.5 flex items-start gap-2.5 text-xs text-neutral-400">
              <Info className="h-4 w-4 text-sky-400 shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                <span className="font-semibold text-neutral-200">راهنمای اتصال: </span>
                دکمه اول (آبی‌رنگ) مستقیماً نرم‌افزار تلگرام نصب‌شده روی ویندوز یا موبایل شما را فراخوانی می‌کند و نیازی به باز شدن سایت فیلترشده t.me ندارد. همچنین می‌توانید آیدی فوق را کپی کرده و در نوار جستجوی تلگرام وارد نمایید.
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
