"use client";

import * as React from "react";
import { AlertTriangle, Trash2, Info } from "lucide-react";
import { DashboardModal } from "./dashboard-modal";
import { Button } from "@/shared/components/ui/button";

export interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "warning" | "info";
  isLoading?: boolean;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = "تأیید و ادامه",
  cancelLabel = "انصراف",
  variant = "danger",
  isLoading = false,
}: ConfirmDialogProps) {
  const iconConfig = {
    danger: {
      icon: Trash2,
      container: "bg-rose-500/10 text-rose-400 border-rose-500/20",
      buttonVariant: "destructive" as const,
    },
    warning: {
      icon: AlertTriangle,
      container: "bg-amber-500/10 text-amber-400 border-amber-500/20",
      buttonVariant: "default" as const,
    },
    info: {
      icon: Info,
      container: "bg-sky-500/10 text-sky-400 border-sky-500/20",
      buttonVariant: "default" as const,
    },
  };

  const current = iconConfig[variant];
  const Icon = current.icon;

  return (
    <DashboardModal isOpen={isOpen} onClose={onClose} maxWidth="sm" hideCloseButton>
      <div className="flex flex-col items-center text-center p-2">
        <div
          className={`flex h-14 w-14 items-center justify-center rounded-2xl border mb-4 ${current.container}`}
        >
          <Icon className="h-7 w-7" />
        </div>

        <h3 className="text-base font-bold text-[var(--theme-foreground)] mb-2">
          {title}
        </h3>

        <p className="text-xs text-neutral-400 leading-relaxed mb-6">
          {message}
        </p>

        <div className="flex items-center gap-3 w-full">
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 border-neutral-700 text-neutral-300 hover:bg-neutral-800 cursor-pointer"
          >
            {cancelLabel}
          </Button>

          <Button
            variant={current.buttonVariant}
            size="sm"
            onClick={onConfirm}
            isLoading={isLoading}
            className="flex-1 cursor-pointer font-bold"
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </DashboardModal>
  );
}
