"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { AuthUser } from "@/features/auth";
import type { AdminPageDefinition } from "../types/admin.types";
import { UserLevelBadge } from "@/features/dashboard/components/user-level-badge";
import {
  LayoutDashboard,
  Package,
  FileText,
  FileSpreadsheet,
  Building2,
  Users2,
  Layers,
  ShieldCheck,
  Headphones,
  ShieldAlert,
  Palette,
  LogOut,
  ChevronDown,
  Sparkles,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import { toPersianDigits } from "@/shared/lib/utils";

const ICON_MAP: Record<string, React.ElementType> = {
  LayoutDashboard,
  Package,
  FileText,
  FileSpreadsheet,
  Building2,
  Users2,
  Layers,
  ShieldCheck,
  Headphones,
  ShieldAlert,
  Palette,
};

interface AdminSidebarProps {
  user: AuthUser | null;
  pages: AdminPageDefinition[];
  activePageKey?: string;
  onLogout: () => void;
  onSwitchUser?: (phone: string) => void;
}

export function AdminSidebar({
  user,
  pages,
  activePageKey = "overview",
  onLogout,
  onSwitchUser,
}: AdminSidebarProps) {
  const pathname = usePathname();
  const [showDemoSwitcher, setShowDemoSwitcher] = React.useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState<boolean>(false);
  const [openCategories, setOpenCategories] = React.useState<Record<string, boolean>>(() => ({
    overview: true,
    commerce: true,
    partners: true,
    inventory: true,
    system: true,
  }));

  const toggleCategory = (catKey: string) => {
    setOpenCategories((prev) => ({
      ...prev,
      [catKey]: !prev[catKey],
    }));
  };

  // Find active page
  const activePage =
    pages.find((p) => p.href === pathname || (p.id === "overview" && pathname === "/admin")) ||
    pages[0];
  const ActiveIcon = activePage ? ICON_MAP[activePage.iconName] || Layers : Layers;

  // Group pages by category
  const categories = [
    { key: "overview", label: "مرکز فرماندهی و پایش" },
    { key: "commerce", label: "خرید، سفارش‌ها و مالی" },
    { key: "partners", label: "همکاران سازمانی و کاربران" },
    { key: "inventory", label: "انبارداری و خدمات مهندسی" },
    { key: "system", label: "تنظیمات و امنیت سامانه" },
  ];

  const badgeVariantStyles: Record<string, string> = {
    default: "bg-neutral-800 text-neutral-300 border-neutral-700",
    success: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    warning: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    info: "bg-sky-500/15 text-sky-400 border-sky-500/30",
    purple: "bg-purple-500/15 text-purple-400 border-purple-500/30",
    orange: "bg-orange-500/15 text-orange-400 border-orange-500/30",
    sky: "bg-sky-500/15 text-sky-400 border-sky-500/30",
  };

  return (
    <aside className="w-full lg:w-80 shrink-0 flex flex-col gap-3 sm:gap-4 text-right" dir="rtl">
      {/* Mobile Top Navigation Trigger (< lg) */}
      <div className="lg:hidden rounded-2xl border border-[var(--theme-border-color)] bg-[var(--theme-surface)] p-3 sm:p-3.5 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
              <ActiveIcon className="h-4.5 w-4.5" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[10px] text-neutral-400 font-medium">بخش فعال پنل:</span>
              <span className="text-xs font-bold text-[var(--theme-foreground)] truncate">
                {activePage?.title}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-xs font-bold text-emerald-400 cursor-pointer transition-all shrink-0 shadow-sm"
          >
            <span className="flex items-center gap-1.5">
              <span>{isMobileMenuOpen ? "بستن منو" : "مشاهده منوی ادمین"}</span>
              <span className="text-[10px] bg-emerald-500 text-black px-1.5 py-0.5 rounded-full font-black">
                {toPersianDigits(pages.length)}
              </span>
            </span>
            <ChevronDown
              className={`h-3.5 w-3.5 transition-transform duration-200 ${
                isMobileMenuOpen ? "rotate-180 text-emerald-400" : ""
              }`}
            />
          </button>
        </div>
      </div>

      {/* Main Collapsible Menu Body: Always visible on desktop, toggleable on mobile */}
      <div
        className={`${
          isMobileMenuOpen ? "flex" : "hidden"
        } lg:flex flex-col gap-4 animate-in fade-in duration-200`}
      >
        {/* Admin Identity Card */}
        <div className="relative overflow-hidden rounded-3xl border border-emerald-500/30 bg-gradient-to-br from-emerald-950/30 via-[var(--theme-surface)] to-[var(--theme-surface)] p-4 sm:p-5 shadow-sm">
          <div className="flex items-center gap-3.5 mb-3.5">
            <div className="flex h-11 w-11 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500/25 to-emerald-700/10 border border-emerald-500/40 text-emerald-400 text-base sm:text-lg font-black shadow-inner ring-2 ring-emerald-500/20">
              {user?.name?.slice(0, 1) || "ع"}
            </div>

            <div className="flex flex-col min-w-0">
              <span className="text-sm font-black text-[var(--theme-foreground)] truncate">
                {user?.name || "عرفان سعیدی"}
              </span>
              <span className="text-xs text-neutral-400 font-mono mt-0.5 truncate" dir="ltr">
                {user?.phone || "09129999999"}
              </span>
            </div>
          </div>

          {/* User Level Badge */}
          <div className="mb-3">
            <UserLevelBadge role="admin" size="md" />
          </div>

          <div className="text-[11px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-xl mb-3 font-medium flex items-center justify-between">
            <span>🛡️ دسترسی سطح روت (Root Access)</span>
            <span className="text-[10px] font-mono text-emerald-300">SuperAdmin</span>
          </div>

          {/* Quick Demo Switcher Accordion */}
          {onSwitchUser && (
            <div className="pt-2 border-t border-neutral-800/80">
              <button
                type="button"
                onClick={() => setShowDemoSwitcher(!showDemoSwitcher)}
                className="flex items-center justify-between w-full text-[11px] font-semibold text-neutral-400 hover:text-neutral-200 transition-colors py-1 cursor-pointer"
              >
                <span className="flex items-center gap-1.5">
                  <Sparkles className="h-3 w-3 text-emerald-400" />
                  <span>تغییر سریع حساب تستی</span>
                </span>
                <ChevronDown
                  className={`h-3.5 w-3.5 transition-transform duration-200 ${
                    showDemoSwitcher ? "rotate-180 text-emerald-400" : ""
                  }`}
                />
              </button>

              {showDemoSwitcher && (
                <div className="mt-2 flex flex-col gap-1.5 pt-2 border-t border-neutral-900 animate-in fade-in duration-150">
                  <button
                    type="button"
                    onClick={() => {
                      onSwitchUser("09129999999");
                      setIsMobileMenuOpen(false);
                    }}
                    className={`text-right px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-colors flex items-center justify-between cursor-pointer ${
                      user?.phone === "09129999999"
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                        : "bg-neutral-900/80 hover:bg-neutral-800 text-neutral-300 border border-neutral-800"
                    }`}
                  >
                    <span>ادمین / صاحب سایت</span>
                    <span className="text-[10px] text-emerald-400">Root</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onSwitchUser("09123333333");
                      setIsMobileMenuOpen(false);
                    }}
                    className="text-right px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-colors flex items-center justify-between cursor-pointer bg-neutral-900/80 hover:bg-neutral-800 text-neutral-300 border border-neutral-800"
                  >
                    <span>همکار سازمانی (B2B)</span>
                    <span className="text-[10px] text-sky-400">Tier A</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onSwitchUser("09121111111");
                      setIsMobileMenuOpen(false);
                    }}
                    className="text-right px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-colors flex items-center justify-between cursor-pointer bg-neutral-900/80 hover:bg-neutral-800 text-neutral-300 border border-neutral-800"
                  >
                    <span>کاربر عادی (نقره‌ای)</span>
                    <span className="text-[10px] text-neutral-500">مشتری</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Navigation Menu */}
        <nav className="rounded-3xl border border-[var(--theme-border-color)] bg-[var(--theme-surface)] p-3 sm:p-4 shadow-sm flex flex-col gap-2.5">
          {categories.map((cat) => {
            const groupPages = pages.filter((p) => p.category === cat.key);
            if (groupPages.length === 0) return null;
            const isOpen = openCategories[cat.key] ?? true;

            return (
              <div
                key={cat.key}
                className="flex flex-col gap-1 rounded-2xl border border-neutral-800/40 bg-neutral-900/30 p-1.5 transition-colors"
              >
                <button
                  type="button"
                  onClick={() => toggleCategory(cat.key)}
                  className="flex items-center justify-between px-2.5 py-1.5 text-right text-[11px] font-bold text-neutral-300 hover:text-white transition-colors cursor-pointer group"
                >
                  <span className="flex items-center gap-1.5">
                    <span>{cat.label}</span>
                    <span className="text-[10px] text-neutral-500 font-normal">
                      ({toPersianDigits(groupPages.length)})
                    </span>
                  </span>
                  <ChevronDown
                    className={`h-3.5 w-3.5 text-neutral-500 group-hover:text-neutral-300 transition-transform duration-200 ${
                      isOpen ? "rotate-180 text-emerald-400" : ""
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="flex flex-col gap-1 pt-0.5 animate-in fade-in duration-150">
                    {groupPages.map((page) => {
                      const Icon = ICON_MAP[page.iconName] || Layers;
                      const isActive =
                        pathname === page.href ||
                        (page.id === "overview" && (pathname === "/admin" || pathname === "/admin/"));

                      return (
                        <Link
                          key={page.id}
                          href={page.href}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className={`group flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                            isActive
                              ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/25 font-bold"
                              : "text-neutral-300 hover:bg-neutral-900/80 hover:text-white"
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <Icon
                              className={`h-4 w-4 shrink-0 transition-transform group-hover:scale-110 ${
                                isActive ? "text-white" : "text-neutral-400 group-hover:text-white"
                              }`}
                            />
                            <span className="truncate">{page.title}</span>
                          </div>

                          {page.badge && (
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded-full border shrink-0 transition-colors ${
                                isActive
                                  ? "bg-white/20 text-white border-white/30"
                                  : badgeVariantStyles[page.badgeVariant || "default"] ||
                                    badgeVariantStyles.default
                              }`}
                            >
                              {page.badge}
                            </span>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Quick External Navigation Links */}
        <div className="rounded-2xl border border-neutral-800 bg-neutral-950/40 p-3 flex flex-col gap-2 text-xs">
          <Link
            href="/dashboard"
            className="flex items-center justify-between p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-900 transition-colors"
          >
            <span className="flex items-center gap-2">
              <ExternalLink className="h-3.5 w-3.5 text-orange-400" />
              <span>مشاهده داشبورد کاربر عادی</span>
            </span>
            <ArrowRight className="h-3.5 w-3.5 rotate-180" />
          </Link>

          <Link
            href="/partner"
            className="flex items-center justify-between p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-900 transition-colors"
          >
            <span className="flex items-center gap-2">
              <Building2 className="h-3.5 w-3.5 text-sky-400" />
              <span>مشاهده پرتال سازمانی B2B</span>
            </span>
            <ArrowRight className="h-3.5 w-3.5 rotate-180" />
          </Link>
        </div>

        {/* Logout Button */}
        <button
          type="button"
          onClick={onLogout}
          className="flex items-center justify-center gap-2 w-full p-3 rounded-2xl border border-red-500/20 bg-red-950/10 hover:bg-red-950/20 text-xs font-bold text-red-400 transition-all cursor-pointer"
        >
          <LogOut className="h-4 w-4" />
          <span>خروج از پنل مدیریت</span>
        </button>
      </div>
    </aside>
  );
}
