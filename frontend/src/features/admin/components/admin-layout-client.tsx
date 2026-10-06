"use client";

import * as React from "react";
import { useAuth, AuthGuard, UserMenu } from "@/features/auth";
import { AdminSidebar } from "./admin-sidebar";
import { ADMIN_PAGES } from "../data/admin-pages";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Server, ArrowRight } from "lucide-react";
import { MenuTriggerButton } from "@/shared/components/layout/navigation-drawer";

export function AdminLayoutClient({ children }: { children: React.ReactNode }) {
  const { user, logout, loginWithDemoAccount } = useAuth();
  const pathname = usePathname();

  const handleSwitchUser = async (phone: string) => {
    await loginWithDemoAccount(phone, "/admin");
  };

  return (
    <AuthGuard allowedRoles={["admin"]}>
      <div className="min-h-screen flex flex-col bg-[var(--theme-background)]" dir="rtl">
        {/* Admin Top Header Bar */}
        <header
          className="sticky top-0 z-50 border-b border-[var(--theme-border-color)] bg-[#0c0c0e]/95 backdrop-blur-xl"
          role="banner"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <MenuTriggerButton />
              <Link
                href="/admin"
                className="flex items-center gap-2 text-sm font-extrabold text-white"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <Server className="h-4 w-4" />
                </span>
                <div className="flex flex-col min-w-0">
                  <span className="truncate whitespace-nowrap text-xs sm:text-sm font-bold sm:font-extrabold">
                    <span className="hidden sm:inline">مرکز کنترل مدیریت (صاحب وبسایت)</span>
                    <span className="sm:hidden">پیشخوان مدیریت کل</span>
                  </span>
                  <span className="text-[10px] text-emerald-400 font-mono truncate hidden xs:inline">
                    SuperAdmin & Owner
                  </span>
                </div>
              </Link>
            </div>

            <nav aria-label="منوی مدیریت" className="hidden md:flex items-center gap-1">
              {[
                { href: "/admin", label: "پیشخوان مدیریت" },
                { href: "/admin/theme", label: "شخصی‌سازی تم" },
                { href: "/partner", label: "پرتال سازمانی" },
                { href: "/dashboard", label: "داشبورد کاربری" },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`text-xs px-3 py-1.5 rounded-lg transition-colors ${
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
                className="text-xs px-3 py-1.5 rounded-lg text-neutral-400 transition-colors hover:text-white flex items-center gap-1 mr-2"
              >
                <span>مشاهده سایت</span>
                <ArrowRight className="h-3 w-3 rotate-180" />
              </Link>
            </nav>

            <div className="flex items-center gap-3">
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
              pages={ADMIN_PAGES}
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
