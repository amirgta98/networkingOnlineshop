"use client";

/**
 * ThemePresetCard — Admin Theme Customizer
 * Feature: theme-customizer
 *
 * A visual swatch card representing one named theme preset.
 * Shows color swatches, label, and description.
 * Keyboard-navigable, focus-visible compliant (web-interface-guidelines).
 */

import * as React from "react";
import { cn } from "@/shared/lib/utils";
import type { ThemePreset } from "../types/theme.types";

// ─── Props ────────────────────────────────────────────────────────────────────

interface ThemePresetCardProps {
  preset: ThemePreset;
  isActive: boolean;
  onSelect: (name: ThemePreset["name"]) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ThemePresetCard({
  preset,
  isActive,
  onSelect,
}: ThemePresetCardProps) {
  const { name, label, description, config } = preset;
  const { tokens } = config;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onSelect(name);
    }
  };

  return (
    <button
      type="button"
      role="radio"
      aria-checked={isActive}
      aria-label={`انتخاب تم ${label}`}
      onClick={() => onSelect(name)}
      onKeyDown={handleKeyDown}
      className={cn(
        // Base layout
        "group relative flex flex-col gap-3 rounded-xl p-4 w-full text-right",
        "border transition-all duration-200 cursor-pointer select-none",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--theme-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--theme-background)]",
        // Active state
        isActive
          ? "border-[var(--theme-primary)] bg-[var(--theme-primary)]/5 shadow-[0_0_16px_var(--theme-ring)]"
          : "border-[var(--theme-border-color)] bg-[var(--theme-surface)] hover:border-[var(--theme-primary)]/50 hover:bg-[var(--theme-surface-alt)]"
      )}
    >
      {/* Active checkmark badge */}
      {isActive && (
        <span
          aria-hidden="true"
          className="absolute top-3 left-3 w-5 h-5 rounded-full flex items-center justify-center text-white"
          style={{ background: tokens.primary }}
        >
          <svg
            width="10"
            height="10"
            viewBox="0 0 10 10"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M1.5 5L3.8 7.5L8.5 2.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      )}

      {/* Color swatches */}
      <div className="flex gap-1.5 items-center" aria-hidden="true">
        {/* Background swatch */}
        <span
          className="w-8 h-8 rounded-lg border border-white/10 shadow-sm flex-shrink-0"
          style={{ background: tokens.background }}
        />
        {/* Palette dots */}
        <div className="flex flex-col gap-1">
          <div className="flex gap-1">
            <span
              className="w-4 h-4 rounded-md"
              style={{ background: tokens.primary }}
            />
            <span
              className="w-4 h-4 rounded-md"
              style={{ background: tokens.accent }}
            />
            <span
              className="w-4 h-4 rounded-md"
              style={{ background: tokens.accentAlt }}
            />
          </div>
          <div className="flex gap-1">
            <span
              className="w-4 h-4 rounded-md"
              style={{ background: tokens.foreground, opacity: 0.8 }}
            />
            <span
              className="w-4 h-4 rounded-md"
              style={{ background: tokens.surface }}
            />
            <span
              className="w-4 h-4 rounded-md"
              style={{ background: tokens.muted }}
            />
          </div>
        </div>
      </div>

      {/* Text */}
      <div className="flex flex-col gap-0.5 text-right">
        <span
          className="text-sm font-semibold leading-tight"
          style={{ color: "var(--theme-foreground)" }}
        >
          {label}
        </span>
        <span
          className="text-xs leading-snug"
          style={{ color: "var(--theme-muted)" }}
        >
          {description}
        </span>
      </div>

      {/* Mode badge */}
      <span
        className="absolute bottom-3 left-3 text-[10px] font-medium px-1.5 py-0.5 rounded-full"
        style={{
          background: "var(--theme-muted-bg)",
          color: "var(--theme-muted)",
        }}
        aria-hidden="true"
      >
        {config.mode === "dark" ? "🌙 تاریک" : "☀️ روشن"}
      </span>
    </button>
  );
}
