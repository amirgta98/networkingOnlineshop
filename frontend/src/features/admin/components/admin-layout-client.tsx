"use client";

import * as React from "react";
import { useAuth, AuthGuard, UserMenu } from "@/features/auth";
import { AdminSidebar } from "./admin-sidebar";
import { ADMIN_PAGES } from "../data/admin-pages";
import type { AdminPageDefinition } from "../types/admin.types";
import { useAdminNavBadges } from "../hooks/use-admin-nav-badges";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Server, ArrowRight, ShieldCheck, ShieldAlert } from "lucide-react";
import { MenuTriggerButton } from "@/shared/components/layout/navigation-drawer/menu-trigger-button";
import { useNavigationDrawer } from "@/shared/components/layout/navigation-drawer/navigation-drawer-context";

export function AdminLayoutClient({ children }: { children: React.ReactNode }) {
  const { user, logout, loginWithDemoAccount } = useAuth();
  const pathname = usePathname();
  const { pages: dynamicPages } = useAdminNavBadges(ADMIN_PAGES);
  const { setDynamicBadges } = useNavigationDrawer();

  React.useEffect(() => {
    const badges: Record<string, { badge?: string; badgeColor?: string }> = {};
    for (const page of dynamicPages) {
      if (page.badge) {
        badges[page.id] = {
          badge: page.badge,
          badgeColor: page.badgeVariant || "default",
        };
      }
    }
    setDynamicBadges(badges);
  }, [dynamicPages, setDynamicBadges]);

  const isSiteManager = user?.role === "site_manager";

  // Filter dynamic pages for site manager
  const visiblePages = React.useMemo(() => {
    if (!isSiteManager) return dynamicPages;
    const userPerms = new Set(user?.permissions || []);
    return dynamicPages.filter((p) => p.id === "profile" || userPerms.has(`admin:${p.id}`));
  }, [dynamicPages, isSiteManager, user?.permissions]);

  // Find active page definition
  const activePageDef = React.useMemo(() => {
    if (!pathname) return null;
    if (pathname === "/admin" || pathname === "/admin/") {
      return ADMIN_PAGES.find((p) => p.id === "overview") || null;
    }
    const cleanPath = pathname.replace(/\/$/, "");
    return (
      ADMIN_PAGES.find((p) => p.href === cleanPath) ||
      ADMIN_PAGES.filter((p) => p.href !== "/admin").find((p) => cleanPath.startsWith(`${p.href}/`)) ||
      null
    );
  }, [pathname]);

  // Enforce access control for site_manager
  const isForbiddenForSiteManager = React.useMemo(() => {
    if (!isSiteManager) return false;
    const userPerms = new Set(user?.permissions || []);

    if (
      pathname === "/admin" ||
      pathname === "/admin/" ||
      pathname === "/admin/profile" ||
      pathname?.startsWith("/admin/profile/")
    ) {
      return false; // Dedicated SiteManagerDashboard or own profile is accessible
    }

    if (activePageDef) {
      return activePageDef.id !== "profile" && !userPerms.has(`admin:${activePageDef.id}`);
    }

    // Any other /admin sub-route without explicit match
    return true;
  }, [isSiteManager, activePageDef, pathname, user?.permissions]);

  // Filter top navbar navigation items
  const navItems = React.useMemo(() => {
    const defaultNav = [
      { href: "/admin", label: isSiteManager ? "داشبورد سایت‌گردان" : "پیشخوان مدیریت" },
      { href: "/admin/profile", label: "پروفایل ادمین" },
      { href: "/admin/careers", label: "فرصت‌های شغلی", perm: "admin:careers" },
      { href: "/admin/orders", label: "سفارش‌ها", perm: "admin:orders" },
      { href: "/admin/products", label: "محصولات", perm: "admin:products" },
      { href: "/admin/theme", label: "شخصی‌سازی تم", perm: "admin:theme" },
      { href: "/admin/settings/contact", label: "تنظیمات تماس", perm: "admin:contact-settings" },
      { href: "/partner", label: "پرتال سازمانی" },
      { href: "/dashboard", label: "داشبورد کاربری" },
    ];
    if (!isSiteManager) return defaultNav;
    const userPerms = new Set(user?.permissions || []);
    return defaultNav.filter((item) => {
      if (item.href === "/dashboard" || item.href === "/partner") return false;
      if (item.href === "/admin/profile") return true;
      return !item.perm || userPerms.has(item.perm);
    });
  }, [isSiteManager, user?.permissions]);

  return (
    <AuthGuard allowedRoles={["admin", "site_manager"]}>
      <div className="min-h-screen flex flex-col bg-[var(--theme-background)]" dir="rtl">
        {/* Admin Top Header Bar */}
        <header
          className="sticky top-0 z-50 border-b border-[var(--theme-border-color)] bg-[#0c0c0e]/95 backdrop-blur-xl"
          role="banner"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3 sm:gap-4">
            <div className="flex items-center gap-3 shrink-0">
              <MenuTriggerButton />
              <Link
                href={visiblePages.length > 0 ? visiblePages[0].href : "/admin"}
                className="flex items-center gap-2 text-sm font-extrabold text-white shrink-0"
              >
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-xl border shrink-0 ${
                    isSiteManager
                      ? "bg-purple-500/20 text-purple-400 border-purple-500/30"
                      : "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                  }`}
                >
                  {isSiteManager ? <ShieldCheck className="h-4 w-4" /> : <Server className="h-4 w-4" />}
                </span>
                <div className="flex flex-col min-w-0">
                  <span className="truncate whitespace-nowrap text-xs sm:text-sm font-bold sm:font-extrabold">
                    <span className="hidden sm:inline">
                      {isSiteManager ? "مرکز کنترل مدیریت (سایت‌گردان)" : "مرکز کنترل مدیریت (صاحب وبسایت)"}
                    </span>
                    <span className="sm:hidden">
                      {isSiteManager ? "پنل سایت‌گردان" : "پیشخوان مدیریت کل"}
                    </span>
                  </span>
                  <span
                    className={`text-[10px] font-mono truncate hidden xs:inline ${
                      isSiteManager ? "text-purple-400" : "text-emerald-400"
                    }`}
                  >
                    {isSiteManager ? "Site Manager (Restricted Access)" : "SuperAdmin & Owner"}
                  </span>
                </div>
              </Link>
            </div>

            <nav
              aria-label="منوی مدیریت"
              className="hidden lg:flex items-center gap-1 min-w-0 overflow-x-auto no-scrollbar py-1"
            >
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`text-xs px-2.5 py-1.5 rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                    pathname === item.href
                      ? "bg-neutral-800 text-white font-bold"
                      : "text-neutral-300 hover:bg-neutral-800/80 hover:text-white"
                  }`}
                >
                  {item.label}
                </Link>
              ))}

              <Link
                href="/"
                className="text-xs px-2.5 py-1.5 rounded-lg text-neutral-400 transition-colors hover:text-white flex items-center gap-1 mr-2 shrink-0 whitespace-nowrap"
              >
                <span>مشاهده سایت</span>
                <ArrowRight className="h-3 w-3 rotate-180" />
              </Link>
            </nav>

            <div className="flex items-center gap-3 shrink-0">
              <UserMenu />
            </div>
          </div>
        </header>

        {/* Dashboard Main Content Area: Sidebar + Active View */}
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 flex-1 w-full">
          <div className="flex flex-col lg:flex-row items-start gap-8">
            {/* Admin Categorized Sidebar */}
            <AdminSidebar
              user={user}
              pages={visiblePages}
              onLogout={logout}
            />

            {/* Active Content: Current route page or 403 Forbidden Shield */}
            <main className="flex-1 min-w-0 w-full" role="main">
              {isForbiddenForSiteManager ? (
                <div
                  className="flex min-h-[55vh] flex-col items-center justify-center p-6 text-center rounded-3xl border border-red-500/30 bg-gradient-to-br from-red-950/20 via-[var(--theme-surface)] to-[var(--theme-surface)] shadow-xl"
                  dir="rtl"
                >
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 mb-4 shadow-lg shadow-red-500/10 ring-2 ring-red-500/20">
                    <ShieldAlert className="h-8 w-8" />
                  </div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-bold bg-red-500/10 text-red-400 border border-red-500/25 mb-3">
                    <span>خطای ۴۰۳ — عدم دسترسی</span>
                    <span className="font-sans">(Forbidden)</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-white">
                    دسترسی به بخش «{activePageDef?.title || "این صفحه"}» محدود است
                  </h2>
                  <p className="text-xs sm:text-sm text-neutral-300 max-w-lg mt-2 mb-6 leading-relaxed">
                    حساب کاربری شما دارای نقش <strong className="text-purple-300">سایت‌گردان</strong> است و مدیر ارشد سیستم مجوز دسترسی به این بخش را برای شما فعال نکرده است. درخواست‌های مستقیم API نیز به این منبع مسدود می‌باشند.
                  </p>

                  <div className="flex flex-wrap items-center justify-center gap-3">
                    {visiblePages.length > 0 ? (
                      <Link
                        href={visiblePages[0].href}
                        className="inline-flex items-center gap-2 h-10 px-5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/25 transition-all"
                      >
                        <span>انتقال به بخش مجاز: {visiblePages[0].title}</span>
                      </Link>
                    ) : (
                      <div className="text-xs text-amber-300 bg-amber-500/10 border border-amber-500/30 px-4 py-2 rounded-xl">
                        ⚠️ هیچ صفحه‌ای برای حساب سایت‌گردان شما فعال نشده است. لطفاً با ادمین سیستم تماس بگیرید.
                      </div>
                    )}

                    <Link
                      href="/"
                      className="inline-flex items-center gap-2 h-10 px-4 rounded-xl border border-neutral-700 hover:bg-neutral-800 text-neutral-300 text-xs font-medium transition-all"
                    >
                      <span>صفحه اصلی وبسایت</span>
                    </Link>
                  </div>
                </div>
              ) : (
                children
              )}
            </main>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}