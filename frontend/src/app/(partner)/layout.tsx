import type { Metadata } from "next";
import Link from "next/link";
import { Building2, FileText, CreditCard, ShieldCheck, ArrowRight, Phone } from "lucide-react";
import { AuthGuard, UserMenu } from "@/features/auth";
import { MenuTriggerButton } from "@/shared/components/layout/navigation-drawer";

export const metadata: Metadata = {
  title: "پرتال سازمانی و همکاران تجاری (B2B) | ولوکس",
  description:
    "پرتال اختصاصی خرید عمده تجهیزات شبکه، صدور فاکتور رسمی و خرید اعتباری ویژه شرکت‌ها و پیمانکاران فناوری اطلاعات.",
};

export default function PartnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard allowedRoles={["partner", "admin"]}>
      <div
        className="min-h-screen flex flex-col bg-[var(--theme-background)]"
        dir="rtl"
      >
        {/* Top Partner Strip */}
        <div className="border-b border-sky-500/20 bg-sky-950/30 px-3 py-1.5 sm:py-2 text-center text-xs overflow-hidden">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 sm:gap-2 text-sky-300 truncate whitespace-nowrap">
              <span className="flex h-2 w-2 shrink-0 rounded-full bg-sky-400 shadow-[0_0_8px_#38bdf8]" />
              <span className="hidden sm:inline">پرتال رسمی همکاران تجاری ولوکس (B2B Enterprise Portal)</span>
              <span className="sm:hidden text-[11px]">پرتال سازمانی همکاران B2B</span>
            </span>

            <span className="hidden sm:inline-flex items-center gap-1.5 text-sky-400/80 text-[11px] shrink-0 whitespace-nowrap">
              <Phone className="h-3 w-3 shrink-0" />
              میز خدمت همکاران: ۰۹۱۳۴۷۶۱۰۹۷ داخلی ۴۰۲
            </span>
          </div>
        </div>

        {/* Header */}
        <header className="sticky top-0 z-40 border-b border-[var(--theme-border-color)] bg-[#09090b]/90 backdrop-blur-md">
          <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
            {/* Brand / Logo */}
            <div className="flex items-center gap-3 shrink-0">
              <MenuTriggerButton />
              <Link
                href="/partner"
                className="flex items-center gap-2.5 text-base sm:text-lg font-black tracking-tight text-white shrink-0"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-sky-600 to-cyan-500 text-white shadow-lg shadow-sky-600/20 shrink-0">
                  <Building2 className="h-5 w-5" />
                </span>
                <div className="flex flex-col min-w-0">
                  <span className="truncate whitespace-nowrap text-xs sm:text-base font-bold sm:font-black">پنل سازمانی ولوکس</span>
                  <span className="text-[10px] text-sky-400 font-normal truncate hidden xs:inline">
                    Business to Business
                  </span>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-neutral-300">
              <Link
                href="/partner"
                className="text-sky-400 hover:text-sky-300 transition-colors"
              >
                داشبورد همکار
              </Link>
              <Link
                href="/products"
                className="hover:text-white transition-colors"
              >
                کاتالوگ قیمت همکار
              </Link>
              <Link
                href="/dashboard"
                className="hover:text-white transition-colors"
              >
                پنل کاربری
              </Link>
              <Link
                href="/"
                className="text-neutral-400 hover:text-white transition-colors flex items-center gap-1"
              >
                <span>بازگشت به سایت</span>
                <ArrowRight className="h-3 w-3 rotate-180" />
              </Link>
            </nav>

            {/* User Menu */}
            <div className="flex items-center gap-3">
              <UserMenu />
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 py-8">{children}</main>
      </div>
    </AuthGuard>
  );
}
