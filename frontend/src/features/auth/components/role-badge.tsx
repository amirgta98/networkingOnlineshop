import * as React from "react";
import { ShieldAlert, Building2, UserCheck, ShieldCheck } from "lucide-react";
import type { UserRole } from "../types";
import { cn } from "@/shared/lib/utils";

export interface RoleBadgeProps {
  role: UserRole;
  size?: "sm" | "md" | "lg";
  className?: string;
  showIcon?: boolean;
}

export function RoleBadge({
  role,
  size = "md",
  className,
  showIcon = true,
}: RoleBadgeProps) {
  const configs = {
    admin: {
      label: "ادمین / صاحب وبسایت",
      shortLabel: "مدیر ارشد",
      icon: ShieldAlert,
      bg: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
      led: "bg-emerald-400 shadow-[0_0_8px_#34d399]",
    },
    partner: {
      label: "پنل سازمانی / همکار B2B",
      shortLabel: "همکار سازمانی",
      icon: Building2,
      bg: "bg-sky-500/10 text-sky-400 border-sky-500/30",
      led: "bg-sky-400 shadow-[0_0_8px_#38bdf8]",
    },
    customer: {
      label: "کاربر عادی",
      shortLabel: "کاربر عادی",
      icon: UserCheck,
      bg: "bg-orange-500/10 text-orange-400 border-orange-500/30",
      led: "bg-orange-400 shadow-[0_0_8px_#fb923c]",
    },
  };

  const config = configs[role] || configs.customer;
  const Icon = config.icon;

  const sizeClasses = {
    sm: "text-[11px] px-2 py-0.5 gap-1.5",
    md: "text-xs px-2.5 py-1 gap-2",
    lg: "text-sm px-3.5 py-1.5 gap-2.5",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center font-medium rounded-full border backdrop-blur-md transition-colors",
        config.bg,
        sizeClasses[size],
        className
      )}
      dir="rtl"
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", config.led)} />
      {showIcon && <Icon className="h-3.5 w-3.5 shrink-0" />}
      <span>{size === "sm" ? config.shortLabel : config.label}</span>
    </span>
  );
}
