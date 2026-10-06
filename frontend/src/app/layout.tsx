import type { Metadata } from "next";
import { Geist, Geist_Mono, Vazirmatn } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { CartSheet } from "@/features/cart";
import { NavigationDrawer } from "@/shared/components/layout/navigation-drawer";

// ─── Fonts ────────────────────────────────────────────────────────────────────

const vazirmatn = Vazirmatn({
  variable: "--font-vazirmatn",
  subsets: ["arabic"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

// ─── Metadata ────────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: "ولوکس | تجهیزات شبکه و زیرساخت",
  description:
    "فروشگاه تخصصی تجهیزات شبکه، زیرساخت اکتیو و پسیو — سوئیچ، روتر، فایروال، کابل‌کشی و ابزار تست.",
  keywords: [
    "تجهیزات شبکه",
    "سوئیچ سیسکو",
    "فروشگاه شبکه",
    "زیرساخت اکتیو",
    "زیرساخت پسیو",
    "SFP",
    "پچ پنل",
    "کابل Cat6",
  ],
  authors: [{ name: "Velox Engineering Team" }],
  openGraph: {
    type: "website",
    locale: "fa_IR",
    title: "ولوکس | تجهیزات شبکه",
    description: "فروشگاه تخصصی تجهیزات شبکه و زیرساخت",
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
