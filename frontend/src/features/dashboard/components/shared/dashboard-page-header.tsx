"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, ChevronLeft } from "lucide-react";
import { Button } from "@/shared/components/ui/button";

export interface DashboardPageHeaderProps {
  title: string;
  description: string;
  icon: React.ElementType;
  badge?: string;
  badgeVariant?: "orange" | "emerald" | "sky" | "amber" | "purple";
  actions?: React.ReactNode;
  showBackToOverview?: boolean;
}

export function DashboardPageHeader({
  title,
  description,
  icon: Icon,
  badge,
  badgeVariant = "orange",
  actions,
  showBackToOverview = true,
}: DashboardPageHeaderProps) {
  const badgeColors = {
    orange: "text-orange-400 bg-orange-500/10 border-orange-500/20",
    emerald: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    sky: "text-sky-400 bg-sky-500/10 border-sky-500/20",
    amber: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    purple: "text-purple-400 bg-purple-500/10 border-purple-500/20",
  };

  return (
    <div className="relative overflow-hidden rounded-3xl border border-[var(--theme-border-color)] bg-[var(--theme-surface)] p-4 sm:p-6 lg:p-7 shadow-xl" dir="rtl">
      {/* Background cyber glow */}
      <div className="absolute top-0 left-0 w-80 h-80 bg-orange-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6">
        <div className="flex items-start gap-3 sm:gap-4">
          <div className="flex h-12 w-12 sm:h-16 sm:w-16 shrink-0 items-center justify-center rounded-2xl border border-orange-500/30 bg-orange-500/15 text-orange-400 shadow-lg shadow-orange-500/10">
            <Icon className="h-6 w-6 sm:h-8 sm:w-8" />
          </div>

          <div className="flex flex-col gap-1 text-right min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-lg sm:text-2xl font-black text-[var(--theme-foreground)] leading-snug">
                {title}
              </h1>
              {badge && (
                <span
                  className={`text-[10px] sm:text-[11px] font-semibold px-2.5 py-0.5 rounded-full border shrink-0 ${badgeColors[badgeVariant]}`}
                >
                  {badge}
                </span>
              )}
            </div>

            <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed max-w-2xl mt-0.5">
              {description}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between sm:justify-start gap-2.5 w-full md:w-auto pt-2 md:pt-0 border-t md:border-t-0 border-neutral-800/60 shrink-0">
          <div className="flex flex-wrap items-center gap-2">
            {actions}
          </div>

          {showBackToOverview && (
            <Link href="/dashboard" className="mr-auto sm:mr-0">
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 border-neutral-700/80 hover:bg-neutral-800 text-neutral-300 cursor-pointer text-xs"
              >
                <span>پیشخوان</span>
                <ChevronLeft className="h-3.5 w-3.5" />
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
