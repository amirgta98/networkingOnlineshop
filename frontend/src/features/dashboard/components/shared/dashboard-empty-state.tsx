"use client";

import * as React from "react";
import Link from "next/link";
import { LucideIcon } from "lucide-react";
import { Button } from "@/shared/components/ui/button";

export interface DashboardEmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  onActionClick?: () => void;
  secondaryAction?: React.ReactNode;
}

export function DashboardEmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionHref,
  onActionClick,
  secondaryAction,
}: DashboardEmptyStateProps) {
  return (
    <div
      className="flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-3xl border border-[var(--theme-border-color)] bg-[var(--theme-surface)]/60 backdrop-blur-xs"
      dir="rtl"
    >
      <div className="flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-3xl bg-neutral-900 border border-neutral-800 text-neutral-400 mb-4 shadow-inner">
        <Icon className="h-8 w-8 sm:h-10 sm:w-10 opacity-70" />
      </div>

      <h3 className="text-base sm:text-lg font-bold text-[var(--theme-foreground)] mb-1.5">
        {title}
      </h3>

      <p className="text-xs sm:text-sm text-neutral-400 max-w-md leading-relaxed mb-6">
        {description}
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        {actionLabel && (
          actionHref ? (
            <Link href={actionHref}>
              <Button variant="default" size="sm" className="font-semibold text-xs cursor-pointer">
                {actionLabel}
              </Button>
            </Link>
          ) : (
            <Button
              variant="default"
              size="sm"
              onClick={onActionClick}
              className="font-semibold text-xs cursor-pointer"
            >
              {actionLabel}
            </Button>
          )
        )}

        {secondaryAction}
      </div>
    </div>
  );
}
