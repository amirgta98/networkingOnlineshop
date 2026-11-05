"use client";

/**
 * ThemeCustomizer — Admin Panel Component
 * Feature: theme-customizer
 *
 * Full administrative UI for runtime theme configuration.
 * - Preset selection with live preview swatches
 * - Color token pickers (primary, accent, background, foreground, border)
 * - Font family selector
 * - Border-radius slider
 * - Dark / Light mode toggle with animated LED indicator
 * - Save (persist) and Reset actions
 *
 * Layout: RTL (Persian), glassmorphic dark panel aesthetic.
 * Compliance: Vercel Web Interface Guidelines (accessibility, focus, animation).
 */

import * as React from "react";
import { cn } from "@/shared/lib/utils";
import { useTheme } from "../context/ThemeContext";
import { ThemePresetCard } from "./ThemePresetCard";
import { THEME_PRESETS, PRESET_ORDER } from "../lib/theme.presets";
import type { ThemePresetName, ThemeTokens, CursorMode } from "../types/theme.types";
import { useAuth } from "@/features/auth";
import { MousePointer, Sparkles, Volume2, VolumeX, Lock } from "lucide-react";

// ─── Font Options ─────────────────────────────────────────────────────────────

const FONT_OPTIONS: Array<{ value: string; label: string }> = [
  {
    value: '"Vazirmatn","Geist",ui-sans-serif,system-ui,sans-serif',
    label: "Vazirmatn (پیش‌فرض)",
  },
  {
    value: '"Geist",ui-sans-serif,system-ui,sans-serif',
    label: "Geist",
  },
  {
    value: '"Inter",ui-sans-serif,system-ui,sans-serif',
    label: "Inter",
  },
  {
    value: '"Roboto Mono","Courier New",monospace',
    label: "Roboto Mono",
  },
];

// ─── Section Header ───────────────────────────────────────────────────────────

function SectionHeader({ title }: { title: string }) {
  return (
    <h3
      className="text-xs font-semibold uppercase tracking-widest mb-3"
      style={{ color: "var(--theme-muted)" }}
    >
      {title}
    </h3>
  );
}

// ─── Color Picker Row ─────────────────────────────────────────────────────────

interface ColorPickerRowProps {
  label: string;
  tokenKey: keyof ThemeTokens;
  value: string;
  onChange: (key: keyof ThemeTokens, value: string) => void;
}

function ColorPickerRow({
  label,
  tokenKey,
  value,
  onChange,
}: ColorPickerRowProps) {
  const inputId = `theme-color-${tokenKey}`;

  // Only show picker for solid hex colors (not rgba)
  const isRgba = value.startsWith("rgba");
  const displayValue = isRgba ? "#888888" : value;

  return (
    <div className="flex items-center justify-between gap-3 py-2">
      <label
        htmlFor={inputId}
        className="text-sm cursor-pointer"
        style={{ color: "var(--theme-foreground)" }}
      >
        {label}
      </label>
      <div className="flex items-center gap-2">
        {/* Hex text badge */}
        <span
          className="text-xs font-mono px-2 py-0.5 rounded"
          style={{
            background: "var(--theme-muted-bg)",
            color: "var(--theme-muted)",
          }}
        >
          {isRgba ? "rgba" : value}
        </span>
        {/* Color swatch / native picker */}
        <label
          htmlFor={inputId}
          className="relative block w-8 h-8 rounded-lg border cursor-pointer overflow-hidden transition-transform hover:scale-110 focus-within:ring-2 focus-within:ring-[var(--theme-primary)]"
          style={{
            background: displayValue,
            borderColor: "var(--theme-border-color)",
          }}
          aria-label={`انتخاب رنگ برای ${label}`}
        >
          <input
            id={inputId}
            type="color"
            value={displayValue}
            disabled={isRgba}
            onChange={(e) => onChange(tokenKey, e.target.value)}
            className="absolute inset-0 opacity-0 w-full h-full cursor-pointer disabled:cursor-not-allowed"
            aria-label={`رنگ ${label}`}
          />
        </label>
      </div>
    </div>
  );
}

// ─── Radius Slider ────────────────────────────────────────────────────────────

interface RadiusSliderProps {
  value: string;
  onChange: (value: string) => void;
}

function RadiusSlider({ value, onChange }: RadiusSliderProps) {
  // Convert rem string → numeric for the range input
  const numericValue = parseFloat(value) || 0.5;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(`${e.target.value}rem`);
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between items-center">
        <label
          htmlFor="theme-radius-slider"
          className="text-sm"
          style={{ color: "var(--theme-foreground)" }}
        >
          شعاع گوشه‌ها
        </label>
        <span
          className="text-xs font-mono px-2 py-0.5 rounded"
          style={{
            background: "var(--theme-muted-bg)",
            color: "var(--theme-muted)",
          }}
        >
          {value}
        </span>
      </div>
      <input
        id="theme-radius-slider"
        type="range"
        min="0"
        max="1.5"
        step="0.125"
        value={numericValue}
        onChange={handleChange}
        aria-label="شعاع گوشه‌ها"
        className="w-full h-2 rounded-full cursor-pointer appearance-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--theme-primary)]"
        style={{
          accentColor: "var(--theme-primary)",
        }}
      />
      {/* Preview pills */}
      <div className="flex gap-2 mt-1" aria-hidden="true">
        {["0rem", "0.375rem", "0.75rem", "1.5rem"].map((r) => (
          <div
            key={r}
            className="w-8 h-4 border"
            style={{
              borderRadius: r,
              background: "var(--theme-primary)",
              opacity: r === value ? 1 : 0.3,
              borderColor: "var(--theme-border-color)",
            }}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Mode Toggle ──────────────────────────────────────────────────────────────

interface ModeToggleProps {
  mode: "dark" | "light";
  onToggle: () => void;
}

function ModeToggle({ mode, onToggle }: ModeToggleProps) {
  const isDark = mode === "dark";

  return (
    <div className="flex items-center justify-between">
      <span className="text-sm" style={{ color: "var(--theme-foreground)" }}>
        حالت نمایش
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={isDark}
        aria-label={`تغییر به حالت ${isDark ? "روشن" : "تاریک"}`}
        onClick={onToggle}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onToggle();
          }
        }}
        className={cn(
          "relative w-14 h-7 rounded-full border transition-all duration-300 cursor-pointer",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--theme-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--theme-background)]",
          isDark
            ? "border-[var(--theme-primary)]/50"
            : "border-[var(--theme-border-color)]"
        )}
        style={{
          background: isDark
            ? "var(--theme-secondary)"
            : "var(--theme-surface-alt)",
        }}
      >
        {/* Track icons */}
        <span
          aria-hidden="true"
          className="absolute left-1.5 top-1/2 -translate-y-1/2 text-xs"
          style={{ opacity: isDark ? 0.4 : 1 }}
        >
          ☀️
        </span>
        <span
          aria-hidden="true"
          className="absolute right-1.5 top-1/2 -translate-y-1/2 text-xs"
          style={{ opacity: isDark ? 1 : 0.4 }}
        >
          🌙
        </span>

        {/* Thumb with LED */}
        <span
          aria-hidden="true"
          className={cn(
            "absolute top-1 w-5 h-5 rounded-full transition-all duration-300",
            isDark ? "right-1" : "left-1"
          )}
          style={{ background: "var(--theme-primary)" }}
        >
          <span
            className="absolute inset-0 rounded-full animate-led-pulse"
            style={{ boxShadow: `0 0 6px 2px var(--theme-primary)` }}
          />
        </span>
      </button>
    </div>
  );
}

// ─── Save Feedback ────────────────────────────────────────────────────────────

interface SaveFeedbackProps {
  status: "idle" | "saving" | "saved";
}

function SaveFeedback({ status }: SaveFeedbackProps) {
  if (status === "idle") return null;
  return (
    <span
      aria-live="polite"
      role="status"
      className={cn(
        "text-xs font-medium transition-opacity duration-300",
        status === "saving" ? "opacity-70" : "opacity-100"
      )}
      style={{ color: "var(--theme-accent)" }}
    >
      {status === "saving" ? "در حال ذخیره\u2026" : "✓ ذخیره شد"}
    </span>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function ThemeCustomizer() {
  const {
    theme,
    setMode,
    setToken,
    setCursorMode,
    setCursorSound,
    resetToPreset,
    isDirty,
  } = useTheme();

  const { user, isAdmin } = useAuth();
  // Cursor mode is an admin-only privilege; in dev/local mode without an active user, allow selection.
  const canConfigureCursor = isAdmin || user?.role === "admin" || !user;

  const cursorMode = theme.cursor?.mode ?? "default";
  const soundEnabled = theme.cursor?.soundEnabled ?? true;

  const [saveStatus, setSaveStatus] = React.useState<
    "idle" | "saving" | "saved"
  >("idle");

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handlePresetSelect = (name: ThemePresetName) => {
    resetToPreset(name);
  };

  const handleModeToggle = () => {
    setMode(theme.mode === "dark" ? "light" : "dark");
  };

  const handleColorChange = (key: keyof ThemeTokens, value: string) => {
    setToken(key, value);
  };

  const handleFontChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setToken("fontFamily", e.target.value);
  };

  const handleRadiusChange = (value: string) => {
    setToken("radiusBase", value);
  };

  const handleCursorModeChange = (mode: CursorMode) => {
    if (!canConfigureCursor) return;
    setCursorMode(mode);
  };

  const handleCursorSoundToggle = () => {
    if (!canConfigureCursor) return;
    setCursorSound(!soundEnabled);
  };

  const handleSave = async () => {
    setSaveStatus("saving");
    // Simulate async persist (theme is already in localStorage via ThemeProvider)
    await new Promise((r) => setTimeout(r, 600));
    setSaveStatus("saved");
    setTimeout(() => setSaveStatus("idle"), 2000);
  };

  const handleReset = () => {
    resetToPreset("darkTech");
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <section
      aria-label="تنظیمات ظاهری سایت"
      className="w-full max-w-2xl mx-auto animate-fade-in"
      dir="rtl"
    >
      {/* Panel header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          {/* LED indicator dot */}
          <span
            className="led-dot"
            data-active="true"
            aria-hidden="true"
          />
          <h2
            className="text-xl font-bold"
            style={{ color: "var(--theme-foreground)" }}
          >
            تنظیمات تم
          </h2>
        </div>
        <p className="text-sm" style={{ color: "var(--theme-muted)" }}>
          تم سایت را به صورت زنده شخصی‌سازی کنید. تغییرات بلافاصله اعمال می‌شوند.
        </p>
      </div>

      <div className="space-y-6">
        {/* ── Presets ─────────────────────────────────────────────────────── */}
        <fieldset
          className="glass rounded-xl p-5"
          role="radiogroup"
          aria-label="انتخاب پیش‌فرض تم"
        >
          <legend className="sr-only">پیش‌فرض‌های تم</legend>
          <SectionHeader title="پیش‌فرض‌ها" />
          <div className="grid grid-cols-2 gap-3">
            {PRESET_ORDER.map((name) => {
              const preset = THEME_PRESETS[name];
              if (!preset) return null;
              return (
                <ThemePresetCard
                  key={name}
                  preset={preset}
                  isActive={theme.preset === name}
                  onSelect={handlePresetSelect}
                />
              );
            })}
          </div>
        </fieldset>

        {/* ── Mode Toggle ──────────────────────────────────────────────────── */}
        <div className="glass rounded-xl p-5">
          <SectionHeader title="حالت نمایش" />
          <ModeToggle mode={theme.mode} onToggle={handleModeToggle} />
        </div>

        {/* ── Color Tokens ─────────────────────────────────────────────────── */}
        <fieldset className="glass rounded-xl p-5">
          <legend className="sr-only">رنگ‌های تم</legend>
          <SectionHeader title="رنگ‌ها" />
          <div className="divide-y" style={{ borderColor: "var(--theme-border-color)" }}>
            <ColorPickerRow
              label="رنگ اصلی (Primary)"
              tokenKey="primary"
              value={theme.tokens.primary}
              onChange={handleColorChange}
            />
            <ColorPickerRow
              label="رنگ ثانویه (Secondary)"
              tokenKey="secondary"
              value={theme.tokens.secondary}
              onChange={handleColorChange}
            />
            <ColorPickerRow
              label="رنگ تاکیدی (Accent)"
              tokenKey="accent"
              value={theme.tokens.accent}
              onChange={handleColorChange}
            />
            <ColorPickerRow
              label="رنگ پس‌زمینه"
              tokenKey="background"
              value={theme.tokens.background}
              onChange={handleColorChange}
            />
            <ColorPickerRow
              label="رنگ متن"
              tokenKey="foreground"
              value={theme.tokens.foreground}
              onChange={handleColorChange}
            />
          </div>
        </fieldset>

        {/* ── Font Family ──────────────────────────────────────────────────── */}
        <div className="glass rounded-xl p-5">
          <SectionHeader title="فونت" />
          <div className="flex items-center justify-between gap-3">
            <label
              htmlFor="theme-font-select"
              className="text-sm"
              style={{ color: "var(--theme-foreground)" }}
            >
              خانواده فونت
            </label>
            <select
              id="theme-font-select"
              value={theme.tokens.fontFamily}
              onChange={handleFontChange}
              aria-label="انتخاب فونت سایت"
              className="text-sm px-3 py-1.5 rounded-lg border cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--theme-primary)]"
              style={{
                background: "var(--theme-surface-alt)",
                color: "var(--theme-foreground)",
                borderColor: "var(--theme-border-color)",
              }}
            >
              {FONT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* ── Border Radius ────────────────────────────────────────────────── */}
        <div className="glass rounded-xl p-5">
          <SectionHeader title="شکل" />
          <RadiusSlider
            value={theme.tokens.radiusBase}
            onChange={handleRadiusChange}
          />
        </div>

        {/* ── Mouse Cursor (Admin Only Sitewide) ───────────────────────────── */}
        <fieldset
          className="glass rounded-xl p-5"
          role="radiogroup"
          aria-label="تنظیم نشانگر موس در سراسر وبسایت"
        >
          <legend className="sr-only">تنظیمات نشانگر موس</legend>

          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <SectionHeader title="نشانگر موس (سراسری)" />
              <span
                className={cn(
                  "text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1",
                  canConfigureCursor
                    ? "bg-amber-500/15 text-amber-400 border-amber-500/30"
                    : "bg-red-500/15 text-red-400 border-red-500/30"
                )}
              >
                <Lock className="w-3 h-3" />
                ویژه مدیر کل
              </span>
            </div>

            {cursorMode === "whip" && (
              <span className="text-xs text-emerald-400 flex items-center gap-1.5 font-medium">
                <span className="led-dot" data-active="true" aria-hidden="true" />
                شلاق سه‌بعدی فعال
              </span>
            )}
          </div>

          <p className="text-xs mb-4" style={{ color: "var(--theme-muted)" }}>
            انتخاب ظاهر نشانگر موس برای تمامی صفحات سایت. این گزینه تنها توسط مدیر کل قابل انتخاب است و بلافاصله در کل وبسایت فعال می‌گردد.
          </p>

          {!canConfigureCursor && (
            <div className="mb-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-center gap-2">
              <Lock className="w-4 h-4 shrink-0 text-amber-400" />
              <span>
                تغییر نشانگر موس به دلیل اختیارات نظارتی، فقط برای مدیر کل (ادمین) در دسترس است.
              </span>
            </div>
          )}

          {/* Mode Selector Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
            {/* 1. Default Cursor */}
            <button
              type="button"
              role="radio"
              aria-checked={cursorMode === "default"}
              disabled={!canConfigureCursor}
              onClick={() => handleCursorModeChange("default")}
              className={cn(
                "relative flex flex-col items-start p-4 rounded-xl border text-right transition-all duration-200 cursor-pointer",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--theme-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--theme-background)]",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                cursorMode === "default"
                  ? "border-[var(--theme-primary)] bg-[var(--theme-surface-alt)] shadow-md"
                  : "border-[var(--theme-border-color)] hover:border-white/20 bg-[var(--theme-surface)]/50"
              )}
            >
              <div className="flex items-center justify-between w-full mb-2">
                <span
                  className="p-2 rounded-lg border flex items-center justify-center"
                  style={{
                    borderColor: "var(--theme-border-color)",
                    background: "var(--theme-muted-bg)",
                    color: "var(--theme-foreground)",
                  }}
                >
                  <MousePointer className="w-4 h-4" />
                </span>
                {cursorMode === "default" && (
                  <span
                    className="text-[11px] font-bold px-2 py-0.5 rounded-full"
                    style={{
                      background: `${theme.tokens.primary}22`,
                      color: theme.tokens.primary,
                    }}
                  >
                    فعال
                  </span>
                )}
              </div>
              <div
                className="text-sm font-bold mb-1"
                style={{ color: "var(--theme-foreground)" }}
              >
                نشانگر پیش‌فرض سیستم
              </div>
              <div
                className="text-xs leading-relaxed"
                style={{ color: "var(--theme-muted)" }}
              >
                فلش استاندارد مرورگر؛ ساده، سبک و بدون پردازش گرافیکی اضافی.
              </div>
            </button>

            {/* 2. 3D Whip Cursor */}
            <button
              type="button"
              role="radio"
              aria-checked={cursorMode === "whip"}
              disabled={!canConfigureCursor}
              onClick={() => handleCursorModeChange("whip")}
              className={cn(
                "relative flex flex-col items-start p-4 rounded-xl border text-right transition-all duration-200 cursor-pointer overflow-hidden",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--theme-background)]",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                cursorMode === "whip"
                  ? "border-amber-500/70 bg-gradient-to-br from-amber-500/15 via-orange-500/5 to-transparent shadow-lg shadow-amber-500/10 ring-1 ring-amber-500/40"
                  : "border-[var(--theme-border-color)] hover:border-amber-500/30 bg-[var(--theme-surface)]/50"
              )}
            >
              <div className="flex items-center justify-between w-full mb-2">
                <span className="p-2 rounded-lg border flex items-center justify-center bg-gradient-to-br from-amber-500/20 to-orange-600/20 border-amber-500/30 text-amber-400">
                  <Sparkles className="w-4 h-4" />
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    فیزیک سه‌بعدی
                  </span>
                  {cursorMode === "whip" && (
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">
                      فعال
                    </span>
                  )}
                </div>
              </div>
              <div className="text-sm font-bold mb-1 text-white flex items-center gap-1.5">
                <span>شلاق سه‌بعدی و تعاملی (Whip)</span>
              </div>
              <div
                className="text-xs leading-relaxed"
                style={{ color: "var(--theme-muted)" }}
              >
                شبیه‌سازی چرم بافته‌شده، ۲۶ گره Verlet، رشته‌های متحرک، صدای شکستن دیوار صوتی و ضربه با کلیک.
              </div>
            </button>
          </div>

          {/* Sub-options for Whip Cursor */}
          {cursorMode === "whip" && (
            <div
              className="p-3.5 rounded-xl border space-y-3 animate-fade-in"
              style={{
                background: "var(--theme-surface-alt)",
                borderColor: "var(--theme-border-color)",
              }}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span
                    className={cn(
                      "p-1.5 rounded-lg border",
                      soundEnabled
                        ? "bg-amber-500/20 text-amber-400 border-amber-500/30"
                        : "bg-white/5 text-zinc-500 border-white/10"
                    )}
                  >
                    {soundEnabled ? (
                      <Volume2 className="w-4 h-4" />
                    ) : (
                      <VolumeX className="w-4 h-4" />
                    )}
                  </span>
                  <div>
                    <div
                      className="text-xs font-semibold"
                      style={{ color: "var(--theme-foreground)" }}
                    >
                      افکت صوتی شکستن دیوار صوتی
                    </div>
                    <div
                      className="text-[11px]"
                      style={{ color: "var(--theme-muted)" }}
                    >
                      پخش صدای هوازدگی و ضربه پرقدرت صوتی (Sonic Boom) هنگام حرکت سریع و کلیک
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={!canConfigureCursor}
                  onClick={handleCursorSoundToggle}
                  className={cn(
                    "text-xs px-3 py-1.5 rounded-lg border font-medium transition-all duration-150 cursor-pointer",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500",
                    soundEnabled
                      ? "bg-amber-500/20 border-amber-500/40 text-amber-300 hover:bg-amber-500/30"
                      : "bg-white/5 border-white/10 text-zinc-400 hover:bg-white/10"
                  )}
                >
                  {soundEnabled ? "🔊 صدا: فعال" : "🔇 صدا: خاموش"}
                </button>
              </div>

              <div className="text-[11px] pt-2 border-t border-white/5 text-amber-400/90 flex items-center gap-1.5">
                <span>⚡</span>
                <span>
                  همین حالا در هر کجای صفحه کلیک کنید تا ضربه فیزیکی شلاق، جرقه‌ها و موج صوتی را مشاهده و بشنوید!
                </span>
              </div>
            </div>
          )}
        </fieldset>

        {/* ── Preview Card ─────────────────────────────────────────────────── */}
        <div className="glass rounded-xl p-5">
          <SectionHeader title="پیش‌نمایش زنده" />
          <div
            className="rounded-xl p-4 border space-y-3"
            style={{
              background: "var(--theme-surface)",
              borderColor: "var(--theme-border-color)",
              borderRadius: "var(--theme-radius-lg)",
            }}
          >
            {/* Mock product card */}
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <div
                  className="text-xs font-semibold"
                  style={{ color: "var(--theme-muted)" }}
                >
                  Cisco Systems
                </div>
                <div
                  className="text-base font-bold"
                  style={{
                    color: "var(--theme-foreground)",
                    fontFamily: "var(--theme-font-family)",
                  }}
                >
                  سوئیچ ۲۴ پورت گیگابیت
                </div>
                <div
                  className="text-xs font-mono"
                  style={{ color: "var(--theme-muted)" }}
                >
                  WS-C2960X-24TS-L
                </div>
              </div>
              {/* LED badge */}
              <span
                className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full"
                style={{
                  background: `${theme.tokens.accent}22`,
                  color: theme.tokens.accent,
                  borderRadius: "var(--theme-radius-full)",
                }}
                aria-label="موجود در انبار"
              >
                <span className="led-dot" data-active="true" aria-hidden="true" />
                موجود
              </span>
            </div>

            {/* Price row */}
            <div
              className="flex items-center justify-between pt-2 border-t"
              style={{ borderColor: "var(--theme-border-color)" }}
            >
              <div
                className="text-lg font-bold tabular-nums"
                style={{ color: "var(--theme-foreground)" }}
              >
                ۱۲،۵۰۰،۰۰۰ تومان
              </div>
              {/* CTA button */}
              <button
                type="button"
                className="px-4 py-2 text-sm font-semibold text-white transition-transform hover:scale-[1.02] active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--theme-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--theme-background)]"
                style={{
                  background: "var(--theme-primary)",
                  borderRadius: "var(--theme-radius-base)",
                }}
                aria-label="افزودن به سبد خرید"
              >
                افزودن به سبد
              </button>
            </div>
          </div>
        </div>

        {/* ── Actions ──────────────────────────────────────────────────────── */}
        <div
          className="flex items-center justify-between gap-3 py-3 border-t"
          style={{ borderColor: "var(--theme-border-color)" }}
        >
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleSave}
              disabled={saveStatus === "saving"}
              aria-label="ذخیره تنظیمات تم"
              className={cn(
                "px-5 py-2 text-sm font-semibold text-white rounded-lg transition-all duration-150",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--theme-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--theme-background)]",
                "disabled:opacity-60 disabled:cursor-not-allowed",
                "hover:opacity-90 active:scale-[0.97]"
              )}
              style={{
                background: "var(--theme-primary)",
                borderRadius: "var(--theme-radius-base)",
              }}
            >
              {saveStatus === "saving" ? (
                <span className="flex items-center gap-2">
                  <svg
                    className="w-4 h-4 animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  در حال ذخیره&hellip;
                </span>
              ) : (
                "ذخیره تنظیمات"
              )}
            </button>
            <SaveFeedback status={saveStatus} />
          </div>

          <div className="flex items-center gap-2">
            {isDirty && (
              <span
                className="text-xs px-2 py-0.5 rounded-full"
                style={{
                  background: `${theme.tokens.accent}22`,
                  color: theme.tokens.accent,
                }}
                aria-label="تم دستی تغییر کرده است"
              >
                سفارشی
              </span>
            )}
            <button
              type="button"
              onClick={handleReset}
              aria-label="بازنشانی به تم پیش‌فرض دارک تک"
              className={cn(
                "px-4 py-2 text-sm font-medium rounded-lg border transition-all duration-150",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--theme-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--theme-background)]",
                "hover:bg-[var(--theme-surface-alt)] active:scale-[0.97]"
              )}
              style={{
                borderColor: "var(--theme-border-color)",
                color: "var(--theme-muted)",
                borderRadius: "var(--theme-radius-base)",
              }}
            >
              بازنشانی
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
