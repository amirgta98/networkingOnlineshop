"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/shared/lib/utils";

export interface DashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "4xl";
  className?: string;
  hideCloseButton?: boolean;
}

export function DashboardModal({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = "lg",
  className,
  hideCloseButton = false,
}: DashboardModalProps) {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

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

  // Lock body scroll
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!mounted) return null;

  const maxWidthClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
    "4xl": "max-w-4xl",
  };

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-3 sm:p-6" dir="rtl">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/75 backdrop-blur-xs"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", damping: 25, stiffness: 350 }}
            className={cn(
              "relative w-full overflow-hidden rounded-3xl border border-[var(--theme-border-color)] bg-[var(--theme-surface)] shadow-2xl z-10 flex flex-col max-h-[92vh] sm:max-h-[90vh]",
              maxWidthClasses[maxWidth],
              className
            )}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            {(title || !hideCloseButton) && (
              <div className="flex items-center justify-between border-b border-[var(--theme-border-color)] px-4 sm:px-6 py-3.5 sm:py-4.5 shrink-0 gap-3">
                <div className="flex flex-col text-right min-w-0 flex-1">
                  {title && (
                    <h3 className="text-sm sm:text-lg font-bold text-[var(--theme-foreground)] leading-snug">
                      {title}
                    </h3>
                  )}
                  {description && (
                    <p className="text-xs text-neutral-400 mt-0.5 leading-relaxed">{description}</p>
                  )}
                </div>

                {!hideCloseButton && (
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-neutral-800/80 hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors cursor-pointer"
                    aria-label="بستن"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            )}

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 text-right">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
