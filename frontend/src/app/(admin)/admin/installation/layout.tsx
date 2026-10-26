"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Wrench,
  ExternalLink,
  ListOrdered,
  Settings,
  BarChart3,
  Sparkles,
  Plus,
} from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/components/ui/button";

const NAV_TABS = [
  {
    href: "/admin/installation",
    exact: true,
    label: "درخواست‌ها و پروژه‌ها",
    icon: ListOrdered,
  },
  {
    href: "/admin/installation/services",
    exact: false,
    label: "تعرفه‌ها و خدمات پسیو",
    icon: Settings,
  },
  {
    href: "/admin/installation/analytics",
    exact: false,
    label: "آمار و تحلیل عملکرد",
    icon: BarChart3,
  },
];

export default function AdminInstallationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="space-y-6" dir="rtl">
      {/* Installation Module Header */}
      <div className="rounded-3xl border border-[var(--theme-border-color)] bg-gradient-to-r from-orange-500/10 via-[var(--theme-surface)] to-[var(--theme-surface)] p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="h-12 w-12 rounded-2xl bg-orange-500/15 border border-orange-500/30 text-orange-400 flex items-center justify-center shrink-0 shadow-inner">
              <Wrench className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-black text-[var(--theme-foreground)]">
                  مرکز راهبری پروژه‌های پسیو و نصب شبکه
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-500 text-black">
                  زیرساخت TIA-568
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-1">
                مدیریت سفارش‌های اجرای شبکه، کابل‌کشی ساختاریافته، آرایش اتاق سرور، فیبر نوری و رهگیری وضعیت تیم‌های فنی
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/installation" target="_blank">
              <Button
                variant="outline"
                size="sm"
                className="h-9 gap-1.5 text-xs text-neutral-300 border-neutral-700 hover:text-white hover:bg-neutral-800"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                <span>مشاهده پرتال عمومی</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Sub-navigation tabs */}
        <div className="flex items-center gap-1 mt-6 pt-4 border-t border-[var(--theme-border-color)]/60 overflow-x-auto no-scrollbar">
          {NAV_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = tab.exact
              ? pathname === tab.href
              : pathname.startsWith(tab.href);

            return (
              <Link key={tab.href} href={tab.href}>
                <div
                  className={cn(
                    "flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap",
                    isActive
                      ? "bg-orange-500 text-black shadow-md shadow-orange-500/20"
                      : "text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/60"
                  )}
                >
                  <Icon className={cn("h-4 w-4", isActive ? "text-black" : "text-neutral-400")} />
                  <span>{tab.label}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Page Content Outlet */}
      <div>{children}</div>
    </div>
  );
}
