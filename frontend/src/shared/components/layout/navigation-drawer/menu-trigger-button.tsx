"use client";

import * as React from "react";
import { Menu } from "lucide-react";
import { useNavigationDrawer } from "./navigation-drawer-context";
import { cn } from "@/shared/lib/utils";

export interface MenuTriggerButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "icon" | "compact" | "full";
  showLabel?: boolean;
}

export function MenuTriggerButton({
  variant = "icon",
  showLabel = false,
  className,
  ...props
}: MenuTriggerButtonProps) {
  const { toggleDrawer, isOpen } = useNavigationDrawer();

  if (variant === "full") {
    return (
      <button
        type="button"
        onClick={toggleDrawer}
        className={cn(
          "flex items-center gap-2 rounded-xl border border-[var(--theme-border-color)] bg-[var(--theme-surface-alt)] px-3 py-1.5 text-xs font-semibold text-[var(--theme-foreground)] hover:border-neutral-700 hover:text-white transition-all cursor-pointer active:scale-95",
          isOpen && "border-[var(--theme-primary)] text-[var(--theme-primary)] bg-[var(--theme-primary)]/10",
          className
        )}
        aria-label="باز کردن منوی ناوبری"
        aria-expanded={isOpen}
        {...props}
      >
        <Menu className="h-4 w-4" />
        <span>منوی صفحات</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggleDrawer}
      className={cn(
        "flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--theme-border-color)] bg-[var(--theme-surface-alt)] text-neutral-300 hover:border-neutral-700 hover:text-white transition-all cursor-pointer active:scale-95",
        isOpen && "border-[var(--theme-primary)] text-[var(--theme-primary)] bg-[var(--theme-primary)]/10 shadow-sm shadow-[var(--theme-primary)]/20",
        className
      )}
      aria-label="باز کردن منوی ناوبری"
      aria-expanded={isOpen}
      {...props}
    >
      <Menu className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
      {showLabel && <span className="mr-1 text-xs">منو</span>}
    </button>
  );
}
