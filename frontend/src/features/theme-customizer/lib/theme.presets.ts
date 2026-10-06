/**
 * Theme System — Built-in Presets
 * Feature: theme-customizer
 *
 * Four curated presets tuned for the Network Equipment E-Commerce Platform.
 * All values map directly to CSS variables injected by ThemeProvider.
 */

import type { ThemePreset } from "../types/theme.types";

// ─── Preset: Dark Tech (Default) ─────────────────────────────────────────────
const darkTech: ThemePreset = {
  name: "darkTech",
  label: "دارک تک",
  description: "تاریک، فناورانه — زمینه دیتاسنتر",
  config: {
    preset: "darkTech",
    mode: "dark",
    tokens: {
      primary:     "#0284c7",
      secondary:   "#0f172a",
      accent:      "#10b981",
      accentAlt:   "#6366f1",
      background:  "#09090b",
      foreground:  "#f4f4f5",
      surface:     "#111113",
      surfaceAlt:  "#18181b",
      muted:       "#71717a",
      mutedBg:     "#27272a",
      borderColor: "rgba(255,255,255,0.08)",
      ring:        "rgba(2,132,199,0.4)",
      fontFamily:  '"Vazirmatn","Geist",ui-sans-serif,system-ui,sans-serif',
      radiusBase:  "0.5rem",
    },
  },
};

// ─── Preset: Light Pro ───────────────────────────────────────────────────────
const lightPro: ThemePreset = {
  name: "lightPro",
  label: "لایت پرو",
  description: "سفید، حرفه‌ای — طراحی مینیمال",
  config: {
    preset: "lightPro",
    mode: "light",
    tokens: {
      primary:     "#0369a1",
      secondary:   "#1e3a5f",
      accent:      "#059669",
      accentAlt:   "#4f46e5",
      background:  "#f8fafc",
      foreground:  "#09090b",
      surface:     "#ffffff",
      surfaceAlt:  "#f1f5f9",
      muted:       "#64748b",
      mutedBg:     "#e2e8f0",
      borderColor: "rgba(0,0,0,0.08)",
      ring:        "rgba(3,105,161,0.3)",
      fontFamily:  '"Vazirmatn","Geist",ui-sans-serif,system-ui,sans-serif',
      radiusBase:  "0.5rem",
    },
  },
};

// ─── Preset: Cyber Purple ────────────────────────────────────────────────────
const cyberPurple: ThemePreset = {
  name: "cyberPurple",
  label: "سایبر بنفش",
  description: "تاریک، آینده‌نگر — اکسنت ایندیگو",
  config: {
    preset: "cyberPurple",
    mode: "dark",
    tokens: {
      primary:     "#6366f1",
      secondary:   "#1e1b4b",
      accent:      "#a78bfa",
      accentAlt:   "#ec4899",
      background:  "#0a0a0f",
      foreground:  "#ede9fe",
      surface:     "#12121a",
      surfaceAlt:  "#1a1a28",
      muted:       "#6d6d8a",
      mutedBg:     "#1e1e30",
      borderColor: "rgba(99,102,241,0.15)",
      ring:        "rgba(99,102,241,0.4)",
      fontFamily:  '"Vazirmatn","Geist",ui-sans-serif,system-ui,sans-serif',
      radiusBase:  "0.625rem",
    },
  },
};

// ─── Preset: Warm Neutral ────────────────────────────────────────────────────
const warmNeutral: ThemePreset = {
  name: "warmNeutral",
  label: "وارم نوترال",
  description: "گرم، آرام — اکسنت طلایی",
  config: {
    preset: "warmNeutral",
    mode: "light",
    tokens: {
      primary:     "#b45309",
      secondary:   "#292524",
      accent:      "#d97706",
      accentAlt:   "#0891b2",
      background:  "#faf7f2",
      foreground:  "#1c1917",
      surface:     "#ffffff",
      surfaceAlt:  "#f5f0e8",
      muted:       "#78716c",
      mutedBg:     "#e7e0d8",
      borderColor: "rgba(0,0,0,0.07)",
      ring:        "rgba(180,83,9,0.3)",
      fontFamily:  '"Vazirmatn","Geist",ui-sans-serif,system-ui,sans-serif',
      radiusBase:  "0.75rem",
    },
  },
};

// ─── Exports ─────────────────────────────────────────────────────────────────

export const THEME_PRESETS: Record<string, ThemePreset> = {
  darkTech,
  lightPro,
  cyberPurple,
  warmNeutral,
};

export const DEFAULT_PRESET = darkTech;

export const PRESET_ORDER: Array<ThemePreset["name"]> = [
  "darkTech",
  "lightPro",
  "cyberPurple",
  "warmNeutral",
];
