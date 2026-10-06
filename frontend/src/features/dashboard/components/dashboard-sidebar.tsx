"use client";

import * as React from "react";
import Link from "next/link";
import type { AuthUser } from "@/features/auth";
import type { DashboardPageDefinition, DashboardPageKey } from "../types/dashboard.types";
import { UserLevelBadge } from "./user-level-badge";
import {
  LayoutDashboard,
  Package,
  FileText,
  Wallet,
  Heart,
  MapPin,
  FileSpreadsheet,
  ShieldCheck,
  Headphones,
  User,
  Lock,
  Award,
  Sparkles,
  Building2,
  CreditCard,
  Users2,
  ShieldAlert,
  Palette,
  LogOut,
  ChevronDown,
  Layers,
} from "lucide-react";
import { toPersianDigits } from "@/shared/lib/utils";

const ICON_MAP: Record<string, React.ElementType> = {
  LayoutDashboard,
  Package,
  FileText,
  Wallet,
  Heart,
  MapPin,
  FileSpreadsheet,
  ShieldCheck,
  Headphones,
  User,
  Lock,
  Award,
  Sparkles,
  Building2,
  CreditCard,
  Users2,
  ShieldAlert,
  Palette,
};

interface DashboardSidebarProps {
  user: AuthUser | null;
  pages: DashboardPageDefinition[];
  activePageKey?: DashboardPageKey;
  onSelectPage?: (key: DashboardPageKey) => void;
  onLogout: () => void;
  onSwitchUser?: (phone: string) => void;
}

export function DashboardSidebar({
  user,
  pages,
  activePageKey = "overview",
  onSelectPage,
  onLogout,
  onSwitchUser,
}: DashboardSidebarProps) {
  const [showDemoSwitcher, setShowDemoSwitcher] = React.useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState<boolean>(false);
  const [openCategories, setOpenCategories] = React.useState<Record<string, boolean>>(() => ({
    main: true,
    commerce: true,
    services: true,
    account: true,
    "role-specific": true,
  }));

  const toggleCategory = (catKey: string) => {
    setOpenCategories((prev) => ({
      ...prev,
      [catKey]: !prev[catKey],
    }));
  };

  const activePage = pages.find((p) => p.id === activePageKey) || pages[0];
  const ActiveIcon = activePage ? (ICON_MAP[activePage.iconName] || Layers) : Layers;

  // Group pages by category
  const categories = [
    { key: "main", label: "اصلی و عمومی" },
    { key: "commerce", label: "خرید و سفارشات" },
    { key: "services", label: "خدمات تخصصی زیرساخت" },
    { key: "account", label: "امنیت و حساب کاربری" },
    { key: "role-specific", label: user?.role === "admin" ? "ابزارهای راهبری کل" : "امکانات سازمانی B2B" },
  ];

  const badgeVariantStyles: Record<string, string> = {
    default: "bg-neutral-800 text-neutral-300 border-neutral-700",
    success: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    warning: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    info: "bg-sky-500/15 text-sky-400 border-sky-500/30",
    purple: "bg-purple-500/15 text-purple-400 border-purple-500/30",
  };

  return (
    <aside className="w-full lg:w-80 shrink-0 flex flex-col gap-3 sm:gap-4 text-right" dir="rtl">
      {/* Mobile Top Navigation Trigger (< lg) */}
      <div className="lg:hidden rounded-2xl border border-[var(--theme-border-color)] bg-[var(--theme-surface)] p-3 sm:p-3.5 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-orange-500/15 border border-orange-500/30 text-orange-400">
              <ActiveIcon className="h-4.5 w-4.5" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[10px] text-neutral-400 font-medium">بخش فعال:</span>
              <span className="text-xs font-bold text-[var(--theme-foreground)] truncate">
                {activePage.title}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-orange-500/30 bg-orange-500/10 hover:bg-orange-500/20 text-xs font-bold text-orange-400 cursor-pointer transition-all shrink-0 shadow-sm"
          >
            <span className="flex items-center gap-1.5">
              <span>{isMobileMenuOpen ? "بستن منو" : "مشاهده تمام صفحات"}</span>
              <span className="text-[10px] bg-orange-500 text-black px-1.5 py-0.5 rounded-full font-black">
                {toPersianDigits(pages.length)}
              </span>
            </span>
            <ChevronDown
              className={`h-3.5 w-3.5 transition-transform duration-200 ${
                isMobileMenuOpen ? "rotate-180 text-orange-400" : ""
              }`}
            />
          </button>
        </div>
      </div>

      {/* Main Collapsible Menu Body: Always visible on desktop (lg:flex), toggleable on mobile */}
      <div className={`${isMobileMenuOpen ? "flex" : "hidden"} lg:flex flex-col gap-4 animate-in fade-in duration-200`}>
        {/* User Info Header Card */}
        <div className="relative overflow-hidden rounded-3xl border border-[var(--theme-border-color)] bg-[var(--theme-surface)] p-4 sm:p-5 shadow-sm">
          <div className="flex items-center gap-3.5 mb-3.5">
            <div className="flex h-11 w-11 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500/20 to-amber-500/10 border border-orange-500/30 text-orange-400 text-base sm:text-lg font-black shadow-inner">
              {user?.name?.slice(0, 1) || "ک"}
            </div>

            <div className="flex flex-col min-w-0">
              <span className="text-sm font-black text-[var(--theme-foreground)] truncate">
                {user?.name}
              </span>
              <span className="text-xs text-neutral-400 font-mono mt-0.5 truncate" dir="ltr">
                {user?.phone}
              </span>
            </div>
          </div>

          {/* Current user level badge */}
          <div className="mb-3">
            <UserLevelBadge role={user?.role} size="md" />
          </div>

          {user?.companyName && (
            <div className="text-[11px] text-sky-400 bg-sky-500/10 border border-sky-500/20 px-2.5 py-1 rounded-xl mb-3 truncate font-medium">
              🏢 {user.companyName}
            </div>
          )}

          {/* Quick Demo Switcher Accordion */}
          {onSwitchUser && (
            <div className="pt-2 border-t border-neutral-800/80">
              <button
                type="button"
                onClick={() => setShowDemoSwitcher(!showDemoSwitcher)}
                className="flex items-center justify-between w-full text-[11px] font-semibold text-neutral-400 hover:text-neutral-200 transition-colors py-1 cursor-pointer"
              >
                <span className="flex items-center gap-1.5">
                  <Sparkles className="h-3 w-3 text-orange-400" />
                  <span>تغییر سریع سطح و اکانت تستی</span>
                </span>
                <ChevronDown
                  className={`h-3.5 w-3.5 transition-transform duration-200 ${
                    showDemoSwitcher ? "rotate-180 text-orange-400" : ""
                  }`}
                />
              </button>

              {showDemoSwitcher && (
                <div className="mt-2 flex flex-col gap-1.5 pt-2 border-t border-neutral-900 animate-in fade-in duration-150">
                  <button
                    type="button"
                    onClick={() => { onSwitchUser("09121111111"); setIsMobileMenuOpen(false); }}
                    className={`text-right px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-colors flex items-center justify-between cursor-pointer ${
                      user?.phone === "09121111111"
                        ? "bg-orange-500/20 text-orange-300 border border-orange-500/30"
                        : "bg-neutral-900/80 hover:bg-neutral-800 text-neutral-300 border border-neutral-800"
                    }`}
                  >
                    <span>کاربر عادی (بدون ۲FA)</span>
                    <span className="text-[10px] text-neutral-500">نقره‌ای</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => { onSwitchUser("09122222222"); setIsMobileMenuOpen(false); }}
                    className={`text-right px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-colors flex items-center justify-between cursor-pointer ${
                      user?.phone === "09122222222"
                        ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                        : "bg-neutral-900/80 hover:bg-neutral-800 text-neutral-300 border border-neutral-800"
                    }`}
                  >
                    <span>کاربر عادی (با ۲FA)</span>
                    <span className="text-[10px] text-amber-400">امنیت بالا</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => { onSwitchUser("09123333333"); setIsMobileMenuOpen(false); }}
                    className={`text-right px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-colors flex items-center justify-between cursor-pointer ${
                      user?.role === "partner"
                        ? "bg-sky-500/20 text-sky-300 border border-sky-500/30"
                        : "bg-neutral-900/80 hover:bg-neutral-800 text-neutral-300 border border-neutral-800"
                    }`}
                  >
                    <span>همکار سازمانی (B2B)</span>
                    <span className="text-[10px] text-sky-400">Tier A</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => { onSwitchUser("09129999999"); setIsMobileMenuOpen(false); }}
                    className={`text-right px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-colors flex items-center justify-between cursor-pointer ${
                      user?.role === "admin"
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                        : "bg-neutral-900/80 hover:bg-neutral-800 text-neutral-300 border border-neutral-800"
                    }`}
                  >
                    <span>ادمین / صاحب سایت</span>
                    <span className="text-[10px] text-emerald-400">Root</span>
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
                      isOpen ? "rotate-180 text-orange-400" : ""
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="flex flex-col gap-1 pt-0.5 animate-in fade-in duration-150">
                    {groupPages.map((page) => {
                      const Icon = ICON_MAP[page.iconName] || Layers;
                      const isActive = activePageKey === page.id;

                      return (
                        <Link
                          key={page.id}
                          href={page.id === "overview" ? "/dashboard" : `/dashboard/${page.id}`}
                          onClick={() => {
                            setIsMobileMenuOpen(false);
                            onSelectPage?.(page.id);
                          }}
                          className={`group flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                            isActive
                              ? "bg-[var(--theme-primary)] text-white shadow-md shadow-[var(--theme-primary)]/20 font-bold"
                              : "text-neutral-300 hover:bg-neutral-900/80 hover:text-white"
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <Icon
                              className={`h-4 w-4 shrink-0 transition-transform group-hover:scale-110 ${
                                isActive
                                  ? "text-white"
                                  : "text-neutral-400 group-hover:text-[var(--theme-primary)]"
                              }`}
                            />
                            <span className="truncate">{page.title}</span>
                          </div>

                          {page.badge && (
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 mr-1.5 transition-colors ${
                                isActive
                                  ? "bg-white/20 text-white border-white/30"
                                  : badgeVariantStyles[page.badgeVariant || "default"]
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

          {/* Logout Button */}
          <div className="pt-3 border-t border-neutral-800/80">
            <button
              type="button"
              onClick={onLogout}
              className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-2xl text-xs font-semibold text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors cursor-pointer border border-transparent hover:border-red-500/20"
            >
              <LogOut className="h-4 w-4 shrink-0" />
              <span>خروج از حساب کاربری</span>
            </button>
          </div>
        </nav>
      </div>
    </aside>
  );
}
