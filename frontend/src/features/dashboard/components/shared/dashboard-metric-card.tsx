"use client";

import * as React from "react";
import { cn } from "@/shared/lib/utils";

export interface DashboardMetricCardProps {
  title: string;
  value: React.ReactNode;
  subtitle?: string;
  icon: React.ElementType;
  variant?: "orange" | "emerald" | "sky" | "amber" | "purple";
  className?: string;
  onClick?: () => void;
}

export function DashboardMetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = "orange",
  className,
  onClick,
}: DashboardMetricCardProps) {
  const variantStyles = {
    orange: {
      borderHover: "hover:border-orange-500/40",
      iconBg: "bg-orange-500/10 text-orange-400 border-orange-500/20",
      subText: "text-orange-400/90",
    },
    emerald: {
      borderHover: "hover:border-emerald-500/40",
      iconBg: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
      subText: "text-emerald-400/90",
    },
    sky: {
      borderHover: "hover:border-sky-500/40",
      iconBg: "bg-sky-500/10 text-sky-400 border-sky-500/20",
      subText: "text-sky-400/90",
    },
    amber: {
      borderHover: "hover:border-amber-500/40",
      iconBg: "bg-amber-500/10 text-amber-400 border-amber-500/20",
      subText: "text-amber-400/90",
    },
    purple: {
      borderHover: "hover:border-purple-500/40",
      iconBg: "bg-purple-500/10 text-purple-400 border-purple-500/20",
      subText: "text-purple-400/90",
    },
  };

  const v = variantStyles[variant];

  return (
    <div
      onClick={onClick}
      className={cn(
        "group flex flex-col justify-between p-3.5 sm:p-5 rounded-2xl border border-[var(--theme-border-color)] bg-[var(--theme-surface)] transition-all duration-200 text-right shadow-xs",
        v.borderHover,
        onClick && "cursor-pointer hover:shadow-md hover:translate-y-[-2px]",
        className
      )}
      dir="rtl"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <span className="text-xs text-neutral-400 font-medium leading-snug">{title}</span>
        <div
          className={cn(
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border transition-transform duration-200 group-hover:scale-105",
            v.iconBg
          )}
        >
          <Icon className="h-4 w-4" />
        </div>
      </div>

      <div className="text-base sm:text-lg lg:text-xl font-black font-mono text-[var(--theme-foreground)] break-words tracking-tight">
        {value}
      </div>

      {subtitle && (
        <span className={cn("text-[11px] mt-1.5 font-medium leading-relaxed line-clamp-2", v.subText)}>
          {subtitle}
        </span>
      )}
    </div>
  );
}
