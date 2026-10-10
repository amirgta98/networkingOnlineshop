"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth, AuthGuard, UserMenu } from "@/features/auth";
import { MenuTriggerButton } from "@/shared/components/layout/navigation-drawer";
import { Building2, Phone, ArrowRight } from "lucide-react";
import { PartnerSidebar } from "./partner-sidebar";
import { PartnerHeaderBanner } from "./partner-header-banner";
import { PARTNER_PAGES } from "../data/partner-pages";

export function PartnerLayoutClient({ children }: { children: React.ReactNode }) {
  const { user, logout, loginWithDemoAccount } = useAuth();
  const pathname = usePathname();

  const handleSwitchUser = async (phone: string) => {
    await loginWithDemoAccount(phone, "/partner");
  };

  return (
    <AuthGuard allowedRoles={["partner", "admin"]}>
      <div className="min-h-screen flex flex-col bg-[var(--theme-background)]" dir="rtl">
        {/* Top Partner Strip */}
        <div className="border-b border-sky-500/20 bg-sky-950/30 px-3 py-1.5 sm:py-2 text-center text-xs overflow-hidden">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-4 sm:px-6 lg:px-8">
            <span className="inline-flex items-center gap-1.5 sm:gap-2 text-sky-300 truncate whitespace-nowrap">
              <span className="flex h-2 w-2 shrink-0 rounded-full bg-sky-400 shadow-[0_0_8px_#38bdf8]" />
              <span className="hidden sm:inline">پرتال رسمی همکاران تجاری ققنوس آکادمی (B2B Enterprise Portal)</span>
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
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 gap-4">
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
                  <span className="truncate whitespace-nowrap text-xs sm:text-base font-bold sm:font-black">
                    پنل سازمانی ققنوس آکادمی
                  </span>
                  <span className="text-[10px] text-sky-400 font-normal truncate hidden xs:inline font-mono">
                    B2B Enterprise Portal
                  </span>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-2 text-xs font-semibold text-neutral-300">
              {[
                { href: "/partner", label: "پیشخوان همکار" },
                { href: "/partner/internet", label: "اینترنت P2P اختصاصی" },
                { href: "/partner/static-ip", label: "آی‌پی استاتیک" },
                { href: "/partner/catalog", label: "کاتالوگ قیمت عمده" },
                { href: "/partner/credit", label: "خط اعتباری" },
                { href: "/partner/orders", label: "سفارش‌ها" },
                { href: "/dashboard", label: "داشبورد کاربری" },
                { href: "/admin", label: "پنل ادمین" },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-1.5 rounded-lg transition-colors ${
                    pathname === item.href
                      ? "bg-sky-500/20 text-sky-300 font-bold border border-sky-500/30"
                      : "hover:bg-neutral-800 hover:text-white"
                  }`}
                >
                  {item.label}
                </Link>
              ))}

              <Link
                href="/"
                className="text-neutral-400 hover:text-white transition-colors flex items-center gap-1 mr-2 px-2 py-1.5"
              >
                <span>مشاهده سایت</span>
                <ArrowRight className="h-3 w-3 rotate-180" />
              </Link>
            </nav>

            {/* User Menu */}
            <div className="flex items-center gap-3">
              <UserMenu />
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 flex flex-col gap-8 flex-1 w-full">
          {/* Header Hero Banner */}
          <PartnerHeaderBanner user={user} />

          {/* Sidebar + Main Content */}
          <div className="flex flex-col lg:flex-row items-start gap-8">
            {/* Categorized Navigation Sidebar */}
            <PartnerSidebar
              user={user}
              pages={PARTNER_PAGES}
              onLogout={logout}
              onSwitchUser={handleSwitchUser}
            />

            {/* Active Content: Current route page */}
            <main className="flex-1 min-w-0 w-full" role="main">
              {children}
            </main>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
