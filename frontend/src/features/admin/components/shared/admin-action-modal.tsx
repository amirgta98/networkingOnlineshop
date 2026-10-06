"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Info,
  Loader2,
} from "lucide-react";
import { cn } from "@/shared/lib/utils";

export interface AdminActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  variant?: "primary" | "success" | "warning" | "danger" | "info";
  icon?: React.ComponentType<{ className?: string }>;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void | Promise<void>;
  isLoading?: boolean;
  children?: React.ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const emptySubscribe = () => () => {};

export function AdminActionModal({
  isOpen,
  onClose,
  title,
  description,
  variant = "primary",
  icon,
  confirmLabel = "تایید و ادامه",
  cancelLabel = "انصراف",
  onConfirm,
  isLoading = false,
  children,
  maxWidth = "md",
  className,
}: AdminActionModalProps) {
  const mounted = React.useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  // Handle ESC key (disabled while loading)
  React.useEffect(() => {
    if (!isOpen || isLoading) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isLoading, onClose]);

  // Lock body scroll while modal is open
  React.useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  if (!mounted) return null;

  const maxWidthClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
  };

  const getVariantConfig = () => {
    switch (variant) {
      case "success":
        return {
          DefaultIcon: CheckCircle2,
          iconBox: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
          confirmBtn:
            "bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/25",
        };
      case "warning":
        return {
          DefaultIcon: AlertTriangle,
          iconBox: "bg-amber-500/10 text-amber-400 border-amber-500/20",
          confirmBtn:
            "bg-amber-600 hover:bg-amber-500 text-white shadow-md shadow-amber-600/25",
        };
      case "danger":
        return {
          DefaultIcon: AlertCircle,
          iconBox: "bg-rose-500/10 text-rose-400 border-rose-500/20",
          confirmBtn:
            "bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-600/25",
        };
      case "info":
        return {
          DefaultIcon: Info,
          iconBox: "bg-sky-500/10 text-sky-400 border-sky-500/20",
          confirmBtn:
            "bg-sky-600 hover:bg-sky-500 text-white shadow-md shadow-sky-600/25",
        };
      case "primary":
      default:
        return {
          DefaultIcon: AlertCircle,
          iconBox: "bg-orange-500/10 text-orange-400 border-orange-500/20",
          confirmBtn:
            "bg-[var(--theme-primary)] hover:opacity-90 text-white shadow-md shadow-orange-500/25",
        };
    }
  };

  const { DefaultIcon, iconBox, confirmBtn } = getVariantConfig();
  const IconComponent = icon || DefaultIcon;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div
          dir="rtl"
          className="fixed inset-0 z-[250] flex items-center justify-center p-4 sm:p-6"
          role="dialog"
          aria-modal="true"
        >
          {/* Backdrop Blur Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={() => {
              if (!isLoading) onClose();
            }}
            className="fixed inset-0 bg-black/80 backdrop-blur-xs cursor-pointer"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ type: "spring", damping: 25, stiffness: 350 }}
            className={cn(
              "relative w-full overflow-hidden rounded-3xl border border-[var(--theme-border-color)] bg-[var(--theme-surface)] shadow-2xl z-10 flex flex-col max-h-[90vh]",
              maxWidthClasses[maxWidth],
              className
            )}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-[var(--theme-border-color)] p-5 sm:p-6 shrink-0 gap-4">
              <div className="flex items-start gap-3.5 min-w-0 flex-1">
                <div
                  className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border mt-0.5",
                    iconBox
                  )}
                >
                  <IconComponent className="h-5 w-5" />
                </div>

                <div className="flex flex-col text-right min-w-0 flex-1">
                  <h3 className="text-base sm:text-lg font-bold text-[var(--theme-foreground)] leading-snug">
                    {title}
                  </h3>
                  {description && (
                    <p className="text-xs sm:text-sm text-[var(--theme-muted)] mt-1 leading-relaxed">
                      {description}
                    </p>
                  )}
                </div>
              </div>

              {/* Close Button */}
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-neutral-800/80 hover:bg-neutral-800 text-neutral-400 hover:text-white transition-all cursor-pointer active:scale-[0.97] disabled:pointer-events-none disabled:opacity-40"
                aria-label="بستن پنجره"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Children / Form Inputs */}
            {children && (
              <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-4 text-right space-y-4">
                {children}
              </div>
            )}

            {/* Modal Action Buttons Footer */}
            <div className="flex items-center justify-end gap-2.5 border-t border-[var(--theme-border-color)] bg-[var(--theme-surface-alt)]/50 px-5 sm:px-6 py-4 shrink-0">
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="rounded-xl border border-[var(--theme-border-color)] bg-[var(--theme-surface)] px-4 py-2 text-xs sm:text-sm font-medium text-[var(--theme-foreground)] hover:bg-neutral-800 transition-all cursor-pointer active:scale-[0.97] disabled:pointer-events-none disabled:opacity-40"
              >
                {cancelLabel}
              </button>

              <button
                type="button"
                onClick={onConfirm}
                disabled={isLoading}
                className={cn(
                  "inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2 text-xs sm:text-sm font-semibold transition-all cursor-pointer active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50",
                  confirmBtn
                )}
              >
                {isLoading && (
                  <Loader2 className="h-4 w-4 animate-spin text-current" />
                )}
                <span>{confirmLabel}</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
