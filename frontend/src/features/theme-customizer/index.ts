/**
 * theme-customizer — Public Barrel Export
 *
 * Import from "@/features/theme-customizer" to access:
 *  - ThemeProvider  : Wrap your app to enable runtime theming
 *  - useTheme       : Hook for reading/writing the active theme
 *  - ThemeCustomizer: Admin panel UI component
 */

export { ThemeProvider, useTheme } from "./context/ThemeContext";
export type { ThemeProviderProps } from "./context/ThemeContext";

export { ThemeCustomizer } from "./components/ThemeCustomizer";
export { ThemePresetCard } from "./components/ThemePresetCard";

export { THEME_PRESETS, PRESET_ORDER, DEFAULT_PRESET } from "./lib/theme.presets";

export type {
  ThemeTokens,
  ThemeMode,
  ThemeConfig,
  ThemePresetName,
  ThemePreset,
  ThemeContextValue,
} from "./types/theme.types";

export { TOKEN_CSS_VAR_MAP } from "./types/theme.types";
