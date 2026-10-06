import * as React from "react";
import Link from "next/link";
import { CartBadge } from "@/features/cart";
import { Container } from "@/shared/components/ui/container";
import {
  Wifi,
  Phone,
  Package,
  ShieldCheck,
  RefreshCw,
  Truck,
} from "lucide-react";
import {
  MobileAppBarProvider,
  MobileAppBar,
} from "@/shared/components/layout/mobile-app-bar";

import { UserMenu } from "@/features/auth";
import { MenuTriggerButton } from "@/shared/components/layout/navigation-drawer";

export default function ShopLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <MobileAppBarProvider>
      <div className="flex min-h-screen flex-col bg-[var(--theme-background)]">
        {/* ── Top announcement bar ──────────────────────────────────────────── */}
        <div
          className="border-b border-[var(--theme-border-color)] px-3 py-1.5 sm:py-2 text-center text-xs overflow-hidden"
          style={{ background: "var(--theme-surface)" }}
        >
          <div className="inline-flex items-center justify-center gap-1.5 text-[var(--theme-muted)] max-w-full">
            <Truck className="h-3.5 w-3.5 shrink-0" style={{ color: "var(--theme-primary)" }} />
            <span className="truncate whitespace-nowrap text-[11px] sm:text-xs">
              <span className="sm:hidden">ارسال رایگان سفارش‌های بالای ۵ م.ت</span>
              <span className="hidden sm:inline">ارسال رایگان برای سفارش‌های بالای ۵ میلیون تومان</span>
            </span>
            <span className="hidden sm:inline-flex items-center gap-1.5 shrink-0">
              <span className="mx-2 text-[var(--theme-border-color)]">|</span>
              <Phone className="h-3.5 w-3.5" style={{ color: "var(--theme-primary)" }} />
              <a href="tel:09134761097" className="hover:text-[var(--theme-foreground)] transition-colors">
                پشتیبانی و تماس: ۰۹۱۳۴۷۶۱۰۹۷
              </a>
            </span>
          </div>
        </div>

        {/* ── Global Header / Navigation ───────────────────────────────────── */}
        <header
          className="sticky top-0 z-40 w-full border-b border-[var(--theme-border-color)] backdrop-blur-md"
          style={{ background: "rgba(9,9,11,0.85)" }}
        >
          <Container className="flex h-16 items-center justify-between">
            {/* Menu Trigger Button & Logo */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              <MenuTriggerButton />

              <Link
                href="/"
                className="flex items-center gap-2 sm:gap-2.5 text-base sm:text-xl font-extrabold tracking-tight text-[var(--theme-foreground)] shrink-0"
                aria-label="صفحه اصلی — تجهیزات شبکه"
              >
                <span
                  className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg shrink-0"
                  style={{
                    background:
                      "linear-gradient(135deg, #c2410c 0%, #ea580c 100%)",
                  }}
                >
                  <Wifi className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" />
                </span>
                <span className="whitespace-nowrap">ققنوس آکادمی</span>
              </Link>
            </div>

            {/* Desktop nav */}
            <nav
              className="hidden md:flex items-center gap-6 text-sm font-medium text-[var(--theme-muted)]"
              aria-label="ناوبری اصلی"
            >
              {[
                { href: "/internet", label: "خرید اینترنت " },
                { href: "/installation", label: "درخواست اجرا" },
                { href: "/about", label: "تماس با ما" },
                { href: "/#portfolio", label: "نمونه‌کارها" },
                { href: "/#articles", label: "مقالات تخصصی" },
                { href: "/#careers", label: "همکاری با ما" },
              ].map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className="transition-colors hover:text-[var(--theme-foreground)]"
                >
                  {label}
                </Link>
              ))}
            </nav>

            {/* Actions (Cart & User Authentication Menu) */}
            <div className="flex items-center gap-2.5 sm:gap-3">
              <UserMenu />
              <div className="hidden sm:block">
                <CartBadge />
              </div>
            </div>
          </Container>
        </header>

        {/* ── Main page content ─────────────────────────────────────────────── */}
        <main className="flex-1 pb-16 md:pb-0">{children}</main>

        {/* ── Trust badges ─────────────────────────────────────────────────── */}
        <section
          className="border-t border-[var(--theme-border-color)] py-14"
          style={{ background: "var(--theme-surface)" }}
          aria-label="ارزش‌های ما"
        >
          <Container>
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
              {[
                {
                  icon: ShieldCheck,
                  title: "ضمانت اصالت کالا",
                  desc: "تمامی محصولات دارای گارانتی اصالت و مدارک رسمی واردات هستند.",
                },
                {
                  icon: RefreshCw,
                  title: "۳۰ روز مرجوعی",
                  desc: "در صورت عدم رضایت، بازگشت کالا بدون دردسر و با پرداخت هزینه ارسال از طرف ما.",
                },
                {
                  icon: Package,
                  title: "پشتیبانی فنی تخصصی",
                  desc: "تیم مهندسی شبکه ما آماده راهنمایی در انتخاب، نصب و پیکربندی تجهیزات است.",
                },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} className="flex items-start gap-4">
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                    style={{
                      background: "rgba(234,88,12,0.1)",
                      border: "1px solid rgba(234,88,12,0.2)",
                    }}
                  >
                    <Icon
                      className="h-5 w-5"
                      style={{ color: "var(--theme-primary)" }}
                    />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-[var(--theme-foreground)]">
                      {title}
                    </h3>
                    <p className="mt-1 text-xs leading-relaxed text-[var(--theme-muted)]">
                      {desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Container>
        </section>

        {/* ── Footer ───────────────────────────────────────────────────────── */}
        <footer
          className="border-t border-[var(--theme-border-color)] py-10 text-[var(--theme-muted)]"
          style={{ background: "var(--theme-secondary)" }}
        >
          <Container>
            <div className="flex flex-col items-center justify-between gap-6 md:flex-row text-center sm:text-right">
              {/* Brand */}
              <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3">
                <div className="flex items-center gap-2">
                  <span
                    className="flex h-7 w-7 items-center justify-center rounded-lg shrink-0"
                    style={{
                      background:
                        "linear-gradient(135deg, #c2410c 0%, #ea580c 100%)",
                    }}
                  >
                    <Wifi className="h-3.5 w-3.5 text-white" />
                  </span>
                  <span className="font-bold text-[var(--theme-foreground)] tracking-tight whitespace-nowrap">
                    ققنوس آکادمی
                  </span>
                </div>
                <span className="text-xs text-[var(--theme-muted)] whitespace-nowrap">
                  © {new Date().getFullYear()} — تمامی حقوق محفوظ است
                </span>
              </div>

              {/* Footer links */}
              <nav className="flex flex-wrap justify-center md:justify-end gap-x-5 gap-y-2.5 text-xs" aria-label="لینک‌های پایین">
                {[
                  { href: "/about", label: "درباره ما" },
                  { href: "/about#contact-section", label: "اطلاعات تماس و نشانی" },
                  { href: "/internet", label: "خرید اینترنت و IP استاتیک" },
                  { href: "/installation", label: "درخواست نصب و کابل‌کشی" },
                  { href: "/#portfolio", label: "نمونه‌کارها و پروژه‌ها" },
                  { href: "/#articles", label: "مقالات تخصصی" },
                  { href: "/#careers", label: "همکاری با ما و استخدام" },
                  { href: "#", label: "حریم خصوصی" },
                  { href: "#", label: "شرایط استفاده" },
                ].map(({ href, label }) => (
                  <Link
                    key={label}
                    href={href}
                    className="transition-colors hover:text-[var(--theme-foreground)] whitespace-nowrap"
                  >
                    {label}
                  </Link>
                ))}
              </nav>
            </div>

            {/* Contact Numbers Strip in Footer */}
            <div className="mt-8 pt-6 border-t border-[var(--theme-border-color)]/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-400">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-orange-500 shrink-0" />
                <span>شماره تماس اصلی:</span>
                <a href="tel:09134761097" className="font-mono font-bold text-white hover:text-orange-400 transition-colors" dir="ltr">
                  ۰۹۱۳۴۷۶۱۰۹۷
                </a>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 text-[11px]">
                <span className="text-neutral-500">شماره‌های دیگر:</span>
                <a href="tel:09224761097" className="font-mono text-neutral-300 hover:text-orange-400 transition-colors" dir="ltr">۰۹۲۲۴۷۶۱۰۹۷</a>
                <span className="text-neutral-600">|</span>
                <a href="tel:09354761097" className="font-mono text-neutral-300 hover:text-orange-400 transition-colors" dir="ltr">۰۹۳۵۴۷۶۱۰۹۷</a>
                <span className="text-neutral-600">|</span>
                <a href="tel:09004761097" className="font-mono text-neutral-300 hover:text-orange-400 transition-colors" dir="ltr">۰۹۰۰۴۷۶۱۰۹۷</a>
              </div>
            </div>
          </Container>
        </footer>

        {/* ── Mobile App Bar (Reusable across 99% of pages) ───────────────── */}
        <MobileAppBar />
      </div>
    </MobileAppBarProvider>
  );
}
