import type { Metadata } from "next";
import { ThemeCustomizer } from "@/features/theme-customizer";

export const metadata: Metadata = {
  title: "تنظیمات تم | پنل مدیریت | ولوکس",
  description:
    "شخصی‌سازی ظاهر سایت ولوکس — رنگ‌ها، فونت، شکل و حالت نمایش.",
};

/**
 * Admin Theme Settings Page
 * Route: /admin/theme
 *
 * Renders the ThemeCustomizer component which allows administrators to
 * configure all CSS design tokens in real-time:
 *  - Color palette (primary, secondary, accent, background, foreground)
 *  - Font family (Vazirmatn, Geist, Inter, Roboto Mono)
 *  - Border radius
 *  - Dark / Light mode toggle
 *  - Preset themes (darkTech, lightPro, cyberPurple, warmNeutral)
 *
 * Changes are injected into :root as CSS variables via ThemeProvider
 * and persisted to localStorage.
 */
export default function ThemeSettingsPage() {
  return (
    <>
      {/* Page heading (single h1 per page — web-interface-guidelines) */}
      <h1 className="sr-only">تنظیمات ظاهری سایت</h1>

      <ThemeCustomizer />
    </>
  );
}
