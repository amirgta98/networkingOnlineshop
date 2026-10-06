"use client";

import * as React from "react";
import type { UserRole } from "@/features/auth";
import { ShieldAlert, Building2, UserCheck } from "lucide-react";

interface UserLevelBadgeProps {
  role?: UserRole;
  tierName?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function UserLevelBadge({
  role = "customer",
  tierName,
  size = "md",
  className = "",
}: UserLevelBadgeProps) {
  const configs = {
    admin: {
      label: tierName || "مدیر ارشد سامانه (Root)",
      color: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400 shadow-emerald-500/10",
      ledColor: "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]",
      icon: ShieldAlert,
    },
    partner: {
      label: tierName || "همکار سازمانی (Tier A)",
      color: "border-sky-500/30 bg-sky-500/10 text-sky-400 shadow-sky-500/10",
      ledColor: "bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.8)]",
      icon: Building2,
    },
    customer: {
      label: tierName || "کاربر حقیقی (نقره‌ای)",
      color: "border-orange-500/30 bg-orange-500/10 text-orange-400 shadow-orange-500/10",
      ledColor: "bg-orange-400 shadow-[0_0_8px_rgba(251,146,60,0.8)]",
      icon: UserCheck,
    },
  };

  const current = configs[role] || configs.customer;
  const Icon = current.icon;

  const sizeClasses = {
    sm: "px-2 py-0.5 text-[10px] gap-1.5",
    md: "px-2.5 py-1 text-xs gap-2",
    lg: "px-3.5 py-1.5 text-sm gap-2.5",
  }[size];

  return (
    <span
      className={`inline-flex items-center rounded-full border font-semibold shadow-sm backdrop-blur-md transition-all ${current.color} ${sizeClasses} ${className}`}
    >
      <span className={`h-2 w-2 rounded-full animate-pulse ${current.ledColor}`} />
      <Icon className={size === "sm" ? "h-3 w-3" : size === "md" ? "h-3.5 w-3.5" : "h-4 w-4"} />
      <span className="truncate">{current.label}</span>
    </span>
  );
}
