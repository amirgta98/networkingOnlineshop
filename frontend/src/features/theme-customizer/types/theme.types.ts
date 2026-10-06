/**
 * Theme System — Type Definitions
 * Feature: theme-customizer
 *
 * All runtime theme configuration is expressed through these types.
 * The ThemeProvider injects ThemeTokens as CSS variables on :root at runtime.
 */

// ─── Token Shapes ────────────────────────────────────────────────────────────

/** All configurable CSS variable tokens that make up a visual theme. */
export interface ThemeTokens {
  /** Main brand color — primary action buttons, links, key accents */
  primary: string;
  /** Structural dark color — panels, sidebars, nav backgrounds */
  secondary: string;
  /** Status / highlight color — LED indicators, badges, tags */
  accent: string;
  /** Secondary highlight — alternate indicators and decorators */
  accentAlt: string;
  /** Global body background */
  background: string;
  /** Primary text and high-contrast element color */
  foreground: string;
  /** Card & panel surface color */
  surface: string;
  /** Elevated surface — dropdowns, popovers */
  surfaceAlt: string;
  /** De-emphasized text */
  muted: string;
  /** Muted background — chips, badges */
  mutedBg: string;
  /** Border / outline color — glassmorphic container outlines */
  borderColor: string;
  /** Focus ring color (rgba with alpha) */
  ring: string;
  /** Primary font family — full Persian + Latin support */
  fontFamily: string;
  /** Base border-radius — applied to cards, inputs, buttons */
  radiusBase: string;
}

// ─── Mode & Config ───────────────────────────────────────────────────────────

/** Color mode for the site. Controls the data-theme attribute on <html>. */
export type ThemeMode = "dark" | "light";

/** The top-level theme configuration shape stored in localStorage and context. */
export interface ThemeConfig {
  /** Which preset this config was derived from (or 'custom' if user-modified). */
  preset: ThemePresetName | "custom";
  mode: ThemeMode;
  tokens: ThemeTokens;
}

// ─── Presets ─────────────────────────────────────────────────────────────────

/** The four built-in named presets available in the Admin Theme Customizer. */
export type ThemePresetName = "darkTech" | "lightPro" | "cyberPurple" | "warmNeutral";

/** A named, immutable preset configuration. */
export interface ThemePreset {
  name: ThemePresetName;
  /** Display label shown in the Admin UI (Persian) */
  label: string;
  /** Short description shown in the Admin UI (Persian) */
  description: string;
  config: ThemeConfig;
}

// ─── Context Shape ───────────────────────────────────────────────────────────

/** The shape of the ThemeContext value exposed via useTheme(). */
export interface ThemeContextValue {
  /** Currently active theme configuration */
  theme: ThemeConfig;
  /** Replace the entire theme config atomically */
  setTheme: (config: ThemeConfig) => void;
  /** Toggle or set the color mode */
  setMode: (mode: ThemeMode) => void;
  /** Update a single token value */
  setToken: <K extends keyof ThemeTokens>(key: K, value: ThemeTokens[K]) => void;
  /** Reset to a named preset */
  resetToPreset: (name: ThemePresetName) => void;
  /** Whether any tokens differ from the original preset */
  isDirty: boolean;
}

// ─── CSS Variable Map ─────────────────────────────────────────────────────────

/**
 * Maps ThemeTokens keys → the corresponding CSS variable name.
 * Used by ThemeProvider to inject variables into :root.
 */
export const TOKEN_CSS_VAR_MAP: Record<keyof ThemeTokens, string> = {
  primary:     "--theme-primary",
  secondary:   "--theme-secondary",
  accent:      "--theme-accent",
  accentAlt:   "--theme-accent-alt",
  background:  "--theme-background",
  foreground:  "--theme-foreground",
  surface:     "--theme-surface",
  surfaceAlt:  "--theme-surface-alt",
  muted:       "--theme-muted",
  mutedBg:     "--theme-muted-bg",
  borderColor: "--theme-border-color",
  ring:        "--theme-ring",
  fontFamily:  "--theme-font-family",
  radiusBase:  "--theme-radius-base",
};
