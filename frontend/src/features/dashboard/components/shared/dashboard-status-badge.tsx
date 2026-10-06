"use client";

import * as React from "react";
import { cn } from "@/shared/lib/utils";

export type StatusVariant =
  | "success"
  | "warning"
  | "info"
  | "danger"
  | "purple"
  | "neutral";

export interface DashboardStatusBadgeProps {
  label: string;
  variant?: StatusVariant;
  size?: "sm" | "md";
  dot?: boolean;
  className?: string;
}

export function DashboardStatusBadge({
  label,
  variant = "neutral",
  size = "md",
  dot = true,
  className,
}: DashboardStatusBadgeProps) {
  const variantStyles: Record<StatusVariant, { badge: string; dot: string }> = {
    success: {
      badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/25",
      dot: "bg-emerald-400 animate-pulse",
    },
    warning: {
      badge: "bg-amber-500/10 text-amber-400 border-amber-500/25",
      dot: "bg-amber-400",
    },
    info: {
      badge: "bg-sky-500/10 text-sky-400 border-sky-500/25",
      dot: "bg-sky-400",
    },
    danger: {
      badge: "bg-rose-500/10 text-rose-400 border-rose-500/25",
      dot: "bg-rose-400",
    },
    purple: {
      badge: "bg-purple-500/10 text-purple-400 border-purple-500/25",
      dot: "bg-purple-400",
    },
    neutral: {
      badge: "bg-neutral-800/80 text-neutral-300 border-neutral-700/60",
      dot: "bg-neutral-400",
    },
  };

  const current = variantStyles[variant];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 font-medium rounded-full border whitespace-nowrap",
        size === "sm" ? "text-[10px] px-2 py-0.5" : "text-xs px-2.5 py-0.5",
        current.badge,
        className
      )}
    >
      {dot && <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", current.dot)} />}
      <span>{label}</span>
    </span>
  );
}
