"use client";

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
  TelegramIcon,
  InstagramIcon,
  LinkedinIcon,
  YoutubeIcon,
  AparatIcon,
} from "@/shared/components/icons/social-icons";
import {
  MobileAppBarProvider,
  MobileAppBar,
} from "@/shared/components/layout/mobile-app-bar";

import { UserMenu } from "@/features/auth";
import { MenuTriggerButton } from "@/shared/components/layout/navigation-drawer/menu-trigger-button";
import { useContactSettings } from "@/features/contact-settings";
import { toPersianDigits } from "@/shared/lib/utils";

export default function ShopLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { settings } = useContactSettings();

  const mainPhone = settings.mainPhone || "09134761097";
  const mainPhoneClean = mainPhone.replace(/[^0-9]/g, "");
  const mainPhoneDisplay = toPersianDigits(mainPhone);

  const support1 = settings.supportPhone1 || "09224761097";
  const support1Clean = support1.replace(/[^0-9]/g, "");
  const support1Display = toPersianDigits(support1);

  const support2 = settings.supportPhone2 || "09354761097";
  const support2Clean = support2.replace(/[^0-9]/g, "");
  const support2Display = toPersianDigits(support2);

  const emergency = settings.emergencyPhone || "09004761097";
  const emergencyClean = emergency.replace(/[^0-9]/g, "");
  const emergencyDisplay = toPersianDigits(emergency);

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
              <span className="sm:hidden">ارسال رایگان سفارش‌های بالای ۵ میلیون</span>
              <span className="hidden sm:inline">ارسال رایگان برای سفارش‌های بالای ۵ میلیون تومان</span>
            </span>
            <span className="hidden sm:inline-flex items-center gap-1.5 shrink-0">
              <span className="mx-2 text-[var(--theme-border-color)]">|</span>
              <Phone className="h-3.5 w-3.5" style={{ color: "var(--theme-primary)" }} />
              <a href={`tel:${mainPhoneClean}`} className="hover:text-[var(--theme-foreground)] transition-colors">
                پشتیبانی و تماس: {mainPhoneDisplay}
              </a>
            </span>
          </div>
        </div>

        {/* ── Global Header / Navigation ───────────────────────────────────── */}
        <header
          className="sticky top-0 z-40 w-full border-b border-[var(--theme-border-color)] backdrop-blur-md"
          style={{ background: "rgba(9,9,11,0.85)" }}
        >
          <Container className="flex h-16 items-center justify-between gap-4">
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

            {/* Desktop nav — only shown on lg+ screens with whitespace-nowrap to avoid 2-line wrapping */}
            <nav
              className="hidden lg:flex items-center gap-4 xl:gap-6 text-xs xl:text-sm font-medium text-[var(--theme-muted)] shrink-0"
              aria-label="ناوبری اصلی"
            >
              {[
                { href: "/products", label: "محصولات" },
                { href: "/internet", label: "خرید اینترنت" },
                { href: "/installation", label: "درخواست اجرا" },
                { href: "/portfolio", label: "نمونه‌کارها" },
                { href: "/articles", label: "مقالات تخصصی" },
                { href: "/careers", label: "همکاری با ما" },
                { href: "/about", label: "درباره و تماس" },
              ].map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className="transition-colors hover:text-[var(--theme-foreground)] whitespace-nowrap shrink-0"
                >
                  {label}
                </Link>
              ))}
            </nav>

            {/* Actions (Cart & User Authentication Menu) */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              <UserMenu />
              <div className="hidden sm:block shrink-0">
                <CartBadge />
              </div>
            </div>
          </Container>
        </header>

        {/* ── Main page content ─────────────────────────────────────────────── */}
        <div className="flex-1 pb-16 lg:pb-0">{children}</div>

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
              {/* Brand & Social Links */}
              <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
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

                {/* Social Media Links */}
                <div className="flex items-center gap-2.5 mr-2">
                  {settings.telegramChannelUrl && (
                    <a
                      href={settings.telegramChannelUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-neutral-400 hover:text-sky-400 transition-colors"
                      title="کانال تلگرام"
                    >
                      <TelegramIcon className="h-3.5 w-3.5" />
                    </a>
                  )}
                  {settings.instagramUrl && (
                    <a
                      href={settings.instagramUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-neutral-400 hover:text-pink-400 transition-colors"
                      title="اینستاگرام"
                    >
                      <InstagramIcon className="h-3.5 w-3.5" />
                    </a>
                  )}
                  {settings.linkedinUrl && (
                    <a
                      href={settings.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-neutral-400 hover:text-blue-400 transition-colors"
                      title="لینکدین"
                    >
                      <LinkedinIcon className="h-3.5 w-3.5" />
                    </a>
                  )}
                  {settings.youtubeUrl && (
                    <a
                      href={settings.youtubeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-neutral-400 hover:text-red-400 transition-colors"
                      title="یوتیوب"
                    >
                      <YoutubeIcon className="h-3.5 w-3.5" />
                    </a>
                  )}
                  {settings.aparatUrl && (
                    <a
                      href={settings.aparatUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-neutral-400 hover:text-rose-400 transition-colors"
                      title="آپارات"
                    >
                      <AparatIcon className="h-3.5 w-3.5" />
                    </a>
                  )}
                </div>
              </div>

              {/* Footer links */}
              <nav className="flex flex-wrap justify-center md:justify-end gap-x-5 gap-y-2.5 text-xs" aria-label="لینک‌های پایین">
                {[
                  { href: "/products", label: "کاتالوگ محصولات" },
                  { href: "/boost", label: "پیشنهادات ویژه" },
                  { href: "/internet", label: "خرید اینترنت و IP استاتیک" },
                  { href: "/installation", label: "درخواست نصب و کابل‌کشی" },
                  { href: "/portfolio", label: "نمونه‌کارها و پروژه‌ها" },
                  { href: "/articles", label: "مقالات تخصصی" },
                  { href: "/careers", label: "همکاری با ما و استخدام" },
                  { href: "/about", label: "درباره ما" },
                  { href: "/about#contact-section", label: "اطلاعات تماس و نشانی" },
                  { href: "/privacy", label: "حریم خصوصی" },
                  { href: "/terms", label: "شرایط و قوانین استفاده" },
                ].map(({ href, label }) => (
                  <Link
                    key={href}
                    href={href}
                    className="transition-colors hover:text-[var(--theme-foreground)] whitespace-nowrap"
                  >
                    {label}
                  </Link>
                ))}
              </nav>
            </div>

            {/* Dynamic Contact Numbers Strip in Footer */}
            <div className="mt-8 pt-6 border-t border-[var(--theme-border-color)]/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-400">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-orange-500 shrink-0" />
                <span>شماره تماس اصلی:</span>
                <a href={`tel:${mainPhoneClean}`} className="font-mono font-bold text-white hover:text-orange-400 transition-colors" dir="ltr">
                  {mainPhoneDisplay}
                </a>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 text-[11px]">
                <span className="text-neutral-500">شماره‌های دیگر:</span>
                <a href={`tel:${support1Clean}`} className="font-mono text-neutral-300 hover:text-orange-400 transition-colors" dir="ltr">
                  {support1Display}
                </a>
                <span className="text-neutral-600">|</span>
                <a href={`tel:${support2Clean}`} className="font-mono text-neutral-300 hover:text-orange-400 transition-colors" dir="ltr">
                  {support2Display}
                </a>
                <span className="text-neutral-600">|</span>
                <a href={`tel:${emergencyClean}`} className="font-mono text-neutral-300 hover:text-orange-400 transition-colors" dir="ltr">
                  {emergencyDisplay}
                </a>
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
