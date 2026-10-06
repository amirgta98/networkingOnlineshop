"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/shared/lib/utils";

export interface AdminDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  badge?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: "md" | "lg" | "xl"; // md: 480px, lg: 620px, xl: 780px
  className?: string;
}

const emptySubscribe = () => () => {};

export function AdminDetailDrawer({
  isOpen,
  onClose,
  title,
  subtitle,
  badge,
  children,
  footer,
  size = "lg",
  className,
}: AdminDetailDrawerProps) {
  const mounted = React.useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  // Handle ESC key
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

  // Lock body scroll while drawer is open
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

  const sizeClasses = {
    md: "max-w-md", // ~480px
    lg: "max-w-xl", // ~620px
    xl: "max-w-3xl", // ~780px
  };

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div
          dir="rtl"
          className="fixed inset-0 z-[200] overflow-hidden"
          role="dialog"
          aria-modal="true"
        >
          {/* Backdrop Blur Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/75 backdrop-blur-xs cursor-pointer"
          />

          {/* Slide-over Drawer Panel (Sliding in from Right for RTL) */}
          <div className="fixed inset-y-0 right-0 flex max-w-full pl-0">
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className={cn(
                "relative flex h-full w-screen flex-col border-l border-[var(--theme-border-color)] bg-[var(--theme-surface)] shadow-2xl z-10",
                sizeClasses[size],
                className
              )}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Sticky Drawer Header */}
              <div className="sticky top-0 z-20 flex items-center justify-between border-b border-[var(--theme-border-color)] bg-[var(--theme-surface-alt)]/95 px-5 sm:px-6 py-4.5 backdrop-blur-md shrink-0 gap-4">
                <div className="flex flex-col text-right min-w-0 flex-1">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h3 className="text-base sm:text-lg font-bold text-[var(--theme-foreground)] leading-snug">
                      {title}
                    </h3>
                    {badge && <div className="shrink-0">{badge}</div>}
                  </div>
                  {subtitle && (
                    <div className="text-xs text-[var(--theme-muted)] mt-1 leading-relaxed">
                      {subtitle}
                    </div>
                  )}
                </div>

                {/* Close Button */}
                <button
                  type="button"
                  onClick={onClose}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-neutral-800/80 hover:bg-neutral-800 text-neutral-400 hover:text-white transition-all cursor-pointer active:scale-[0.97]"
                  aria-label="بستن پنل"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Scrollable Content Body */}
              <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-6 text-right">
                {children}
              </div>

              {/* Sticky Drawer Footer */}
              {footer && (
                <div className="sticky bottom-0 z-20 flex items-center justify-between border-t border-[var(--theme-border-color)] bg-[var(--theme-surface-alt)]/95 px-5 sm:px-6 py-4 backdrop-blur-md shrink-0 gap-3">
                  {footer}
                </div>
              )}
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
