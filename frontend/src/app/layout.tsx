import type { Metadata } from "next";

import "./globals.css";
import { Providers } from "./providers";
import { CartSheet } from "@/features/cart";
import { NavigationDrawer } from "@/shared/components/layout/navigation-drawer";
import {
  DEFAULT_SITE_DESCRIPTION,
  SITE_LOCALE,
  SITE_NAME,
  SITE_URL,
} from "@/shared/lib/seo";

// ─── Fonts ────────────────────────────────────────────────────────────────────
// Font variables defined to prevent build failures in offline/restricted network environments
// The Vazirmatn font is loaded via @import in globals.css with system-ui fallbacks
const vazirmatn = { variable: "" };
const geistSans = { variable: "" };
const geistMono = { variable: "" };

// ─── Metadata ────────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} | تجهیزات شبکه و زیرساخت`,
    template: `%s | ${SITE_NAME}`,
  },
  description: DEFAULT_SITE_DESCRIPTION,
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
  authors: [{ name: "تیم فنی مهندسی ققنوس آکادمی", url: SITE_URL }],
  openGraph: {
    type: "website",
    locale: SITE_LOCALE,
    siteName: SITE_NAME,
  },
  twitter: {
    card: "summary_large_image",
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
