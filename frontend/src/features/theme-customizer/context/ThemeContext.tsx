"use client";

/**
 * Theme System — Context & Provider
 * Feature: theme-customizer
 *
 * ThemeProvider injects CSS variables into :root at runtime, enabling
 * live theme switching from the Admin Panel without a page reload.
 *
 * Persistence: ThemeConfig is serialized to localStorage under STORAGE_KEY.
 * On mount, the saved config is applied before first paint (suppresses hydration
 * mismatch via suppressHydrationWarning on <html>).
 */

import * as React from "react";
import type {
  ThemeConfig,
  ThemeContextValue,
  ThemeMode,
  ThemePresetName,
  ThemeTokens,
} from "../types/theme.types";
import { TOKEN_CSS_VAR_MAP } from "../types/theme.types";
import {
  DEFAULT_PRESET,
  THEME_PRESETS,
} from "../lib/theme.presets";

// ─── Constants ────────────────────────────────────────────────────────────────

const STORAGE_KEY = "velox:theme-config";

// ─── Context ─────────────────────────────────────────────────────────────────

const ThemeContext = React.createContext<ThemeContextValue | null>(null);
ThemeContext.displayName = "ThemeContext";

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Injects all ThemeTokens as CSS custom properties onto document.documentElement.
 * Also sets the data-theme attribute for CSS selector–based overrides.
 */
function applyTheme(config: ThemeConfig): void {
  if (typeof document === "undefined") return;

  const root = document.documentElement;

  // Set mode attribute for CSS [data-theme] selectors
  root.setAttribute("data-theme", config.mode);

  // Inject every token as a CSS variable
  const tokens = config.tokens as unknown as Record<string, string>;
  const varMap = TOKEN_CSS_VAR_MAP as Record<string, string>;
  for (const key of Object.keys(varMap)) {
    const cssVar = varMap[key];
    const value = tokens[key];
    if (cssVar && value !== undefined) {
      root.style.setProperty(cssVar, value);
    }
  }
}

function loadFromStorage(): ThemeConfig | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as ThemeConfig;
  } catch {
    return null;
  }
}

function saveToStorage(config: ThemeConfig): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch {
    // Storage may be unavailable in private browsing — silently fail
  }
}

function isDirtyConfig(config: ThemeConfig): boolean {
  const preset = THEME_PRESETS[config.preset];
  if (!preset || config.preset === "custom") return true;
  // Deep-compare tokens
  const presetTokens = preset.config.tokens as unknown as Record<string, string>;
  const currentTokens = config.tokens as unknown as Record<string, string>;
  return Object.keys(presetTokens).some(
    (k) => presetTokens[k] !== currentTokens[k]
  );
}

// ─── Provider ────────────────────────────────────────────────────────────────

export interface ThemeProviderProps {
  children: React.ReactNode;
  /** Override the default initial config (useful for SSR/tests). */
  initialConfig?: ThemeConfig;
}

export function ThemeProvider({
  children,
  initialConfig,
}: ThemeProviderProps) {
  const [theme, setThemeState] = React.useState<ThemeConfig>(() => {
    // Priority: prop > localStorage > default preset
    return initialConfig ?? loadFromStorage() ?? DEFAULT_PRESET.config;
  });

  // Apply theme to DOM whenever it changes
  React.useEffect(() => {
    applyTheme(theme);
    saveToStorage(theme);
  }, [theme]);

  // ── Actions ──────────────────────────────────────────────────────────────

  const setTheme = React.useCallback((config: ThemeConfig) => {
    setThemeState(config);
  }, []);

  const setMode = React.useCallback((mode: ThemeMode) => {
    setThemeState((prev) => ({ ...prev, mode }));
  }, []);

  const setToken = React.useCallback(
    <K extends keyof ThemeTokens>(key: K, value: ThemeTokens[K]) => {
      setThemeState((prev) => ({
        ...prev,
        preset: "custom",
        tokens: { ...prev.tokens, [key]: value },
      }));
    },
    []
  );

  const resetToPreset = React.useCallback((name: ThemePresetName) => {
    const preset = THEME_PRESETS[name];
    if (preset) {
      setThemeState(preset.config);
    }
  }, []);

  const isDirty = React.useMemo(() => isDirtyConfig(theme), [theme]);

  const value = React.useMemo<ThemeContextValue>(
    () => ({ theme, setTheme, setMode, setToken, resetToPreset, isDirty }),
    [theme, setTheme, setMode, setToken, resetToPreset, isDirty]
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * Access the current theme configuration and mutation methods.
 * Must be used inside a <ThemeProvider>.
 */
export function useTheme(): ThemeContextValue {
  const ctx = React.useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme() must be used within a <ThemeProvider>.");
  }
  return ctx;
}
