import type { Metadata } from "next";

import "./globals.css";
import { Providers } from "./providers";
import { CartSheet } from "@/features/cart";
import { NavigationDrawer } from "@/shared/components/layout/navigation-drawer";

// ─── Fonts ────────────────────────────────────────────────────────────────────
// Font variables defined to prevent build failures in offline/restricted network environments
// The Vazirmatn font is loaded via @import in globals.css with system-ui fallbacks
const vazirmatn = { variable: "" };
const geistSans = { variable: "" };
const geistMono = { variable: "" };

// ─── Metadata ────────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  metadataBase: new URL("https://fonix-accademic.ir"),
  title: {
    default: "ققنوس آکادمی | تجهیزات شبکه و زیرساخت",
    template: "%s | ققنوس آکادمی",
  },
  description:
    "ققنوس آکادمی — فروشگاه تخصصی تجهیزات شبکه، زیرساخت اکتیو و پسیو، سوئیچ سیسکو، روتر میکروتیک، کابل‌کشی و اجرای پروژه‌های شبکه سازمانی.",
  keywords: [
    "ققنوس آکادمی",
    "تجهیزات شبکه",
    "سوئیچ سیسکو",
    "روتر میکروتیک",
    "فروشگاه تجهیزات دیتاسنتر",
    "زیرساخت اکتیو",
    "زیرساخت پسیو",
    "SFP",
    "پچ پنل",
    "کابل Cat6",
  ],
  authors: [{ name: "تیم فنی مهندسی ققنوس آکادمی", url: "https://fonix-accademic.ir" }],
  openGraph: {
    type: "website",
    locale: "fa_IR",
    url: "https://fonix-accademic.ir",
    siteName: "ققنوس آکادمی",
    title: "ققنوس آکادمی | مرجع تخصصی تجهیزات شبکه و زیرساخت",
    description: "فروشگاه تخصصی تجهیزات شبکه، کابل‌کشی ساختاریافته و اجرای پروژه‌های زیرساخت ققنوس آکادمی.",
  },
};

// ─── Root Layout ─────────────────────────────────────────────────────────────

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fa"
      dir="rtl"
      className={`${vazirmatn.variable} ${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        {/* Skip-to-main for keyboard accessibility (web-interface-guidelines) */}
        <a href="#main-content" className="skip-link">
          رفتن به محتوای اصلی
        </a>
        <Providers>
          <main id="main-content" className="flex-1 flex flex-col">
            {children}
          </main>
          <CartSheet />
          <NavigationDrawer />
        </Providers>
      </body>
    </html>
  );
}
