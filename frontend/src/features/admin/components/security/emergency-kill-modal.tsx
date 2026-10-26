"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { OctagonAlert, X, ShieldAlert, Check } from "lucide-react";

interface EmergencyKillModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (options: {
    excludeCurrentSession: boolean;
    reason: string;
  }) => Promise<void>;
}

export function EmergencyKillModal({
  isOpen,
  onClose,
  onConfirm,
}: EmergencyKillModalProps) {
  const [mounted, setMounted] = useState(false);
  const [excludeCurrent, setExcludeCurrent] = useState(true);
  const [reason, setReason] = useState("");
  const [confirmText, setConfirmText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      setReason("");
      setConfirmText("");
      setExcludeCurrent(true);
      setIsSubmitting(false);
    }
  }, [isOpen]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isSubmitting) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isSubmitting, onClose]);

  if (!mounted || !isOpen) return null;

  const isConfirmed = confirmText.trim() === "خروج اضطراری";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConfirmed || isSubmitting) return;

    try {
      setIsSubmitting(true);
      await onConfirm({
        excludeCurrentSession: excludeCurrent,
        reason: reason.trim() || "فرمان امنیتی اضطراری NOC",
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" dir="rtl">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => !isSubmitting && onClose()}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm"
        />

        {/* Modal Dialog */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-lg rounded-2xl border border-rose-500/40 bg-zinc-950 p-6 shadow-[0_0_50px_rgba(225,29,72,0.3)] z-10 space-y-5"
        >
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
                <OctagonAlert className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">صدور فرمان خروج اضطراری (Kill Switch)</h3>
                <p className="text-xs text-rose-400 font-medium">ابطال آنی کلیه نشست‌های فعال سامانه</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => !isSubmitting && onClose()}
              className="p-1 rounded-lg text-zinc-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Warning Message */}
            <div className="rounded-xl border border-rose-500/30 bg-rose-950/30 p-3.5 text-xs text-rose-200 leading-relaxed">
              با تایید این فرمان، توکن‌های احراز هویت بلافاصله منقضی شده و تمام ارتباطات سوکت و دسترسی ادمین‌ها در دیتاسنتر لغو خواهد شد.
            </div>

            {/* Scope Selection */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-300 block">محدوده اعمال فرمان:</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <label
                  onClick={() => setExcludeCurrent(true)}
                  className={`cursor-pointer rounded-xl border p-3 flex items-start gap-2.5 transition-all ${
                    excludeCurrent
                      ? "border-emerald-500/50 bg-emerald-950/20 text-white"
                      : "border-white/10 bg-zinc-900/60 text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  <input
                    type="radio"
                    name="scope"
                    checked={excludeCurrent}
                    onChange={() => setExcludeCurrent(true)}
                    className="mt-0.5 accent-emerald-500"
                  />
                  <div className="text-xs">
                    <span className="font-bold block text-emerald-300">نشست من فعال بماند</span>
                    <span className="text-[11px] text-zinc-400">سایر ادمین‌ها فوراً خارج شوند</span>
                  </div>
                </label>

                <label
                  onClick={() => setExcludeCurrent(false)}
                  className={`cursor-pointer rounded-xl border p-3 flex items-start gap-2.5 transition-all ${
                    !excludeCurrent
                      ? "border-rose-500/50 bg-rose-950/20 text-white"
                      : "border-white/10 bg-zinc-900/60 text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  <input
                    type="radio"
                    name="scope"
                    checked={!excludeCurrent}
                    onChange={() => setExcludeCurrent(false)}
                    className="mt-0.5 accent-rose-500"
                  />
                  <div className="text-xs">
                    <span className="font-bold block text-rose-300">خروج کامل همه (حتی من)</span>
                    <span className="text-[11px] text-zinc-400">قفل کامل و نیاز به ورود مجدد</span>
                  </div>
                </label>
              </div>
            </div>

            {/* Reason Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300 block">دلیل اقدام امنیتی (جهت ثبت در لاگ ممیزی):</label>
              <input
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="مثال: شناسایی نشست غیرمجاز از آی‌پی ناشناس..."
                className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-rose-500/50"
              />
            </div>

            {/* Confirmation typing field */}
            <div className="space-y-1.5 pt-1">
              <label className="text-xs font-semibold text-zinc-300 block">
                جهت تایید، عبارت <strong className="text-rose-400 select-all font-mono">خروج اضطراری</strong> را تایپ کنید:
              </label>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="خروج اضطراری"
                className="w-full bg-zinc-900 border border-rose-500/30 rounded-xl px-3.5 py-2.5 text-xs text-white font-bold text-center placeholder-zinc-600 focus:outline-none focus:border-rose-500"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-white/[0.08]">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-medium text-zinc-400 hover:text-white transition-colors"
              >
                انصراف
              </button>

              <button
                type="submit"
                disabled={!isConfirmed || isSubmitting}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-[0_0_20px_rgba(225,29,72,0.4)] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                {isSubmitting ? (
                  <span>در حال صدور فرمان...</span>
                ) : (
                  <>
                    <OctagonAlert className="w-4 h-4" />
                    <span>تایید و صدور فرمان</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body,
  );
}
