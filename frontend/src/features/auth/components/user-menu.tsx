"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User,
  LogIn,
  LogOut,
  ChevronDown,
  LayoutDashboard,
  Building2,
  ShieldCheck,
  Palette,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import { useAuth } from "../context/auth-context";
import { RoleBadge } from "./role-badge";
import { MOCK_USER_RECORDS } from "../api/mock-users";

export function UserMenu() {
  const router = useRouter();
  const { user, isAuthenticated, logout, loginWithDemoAccount, isLoading } = useAuth();
  const [isOpen, setIsOpen] = React.useState<boolean>(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

  // Close when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!isAuthenticated || !user) {
    return (
      <Link
        href="/login"
        className="flex items-center gap-1.5 sm:gap-2 rounded-xl border border-[var(--theme-border-color)] bg-[var(--theme-surface-alt)] px-2.5 sm:px-3.5 py-1.5 text-xs font-semibold text-[var(--theme-foreground)] hover:border-[var(--theme-primary)] hover:text-[var(--theme-primary)] transition-all cursor-pointer shadow-sm active:scale-95 shrink-0 whitespace-nowrap"
      >
        <LogIn className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
        <span>ورود / ثبت‌نام</span>
      </Link>
    );
  }

  const roleColors = {
    admin: "ring-emerald-500/40 text-emerald-400 bg-emerald-500/10",
    partner: "ring-sky-500/40 text-sky-400 bg-sky-500/10",
    customer: "ring-orange-500/40 text-orange-400 bg-orange-500/10",
  };

  const currentRingColor = roleColors[user.role] || roleColors.customer;

  return (
    <div className="relative" ref={menuRef} dir="rtl">
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 sm:gap-2.5 rounded-xl border border-[var(--theme-border-color)] bg-[var(--theme-surface-alt)] py-1.5 px-2 sm:px-3 hover:border-neutral-700 transition-all cursor-pointer active:scale-95 shrink-0"
        aria-expanded={isOpen}
      >
        {/* Avatar / Circle */}
        <span
          className={`flex h-7 w-7 items-center justify-center rounded-lg text-xs font-black ring-1 ${currentRingColor}`}
        >
          {user.name.slice(0, 1)}
        </span>

        <div className="hidden sm:flex flex-col text-right">
          <span className="text-xs font-bold text-[var(--theme-foreground)] leading-tight">
            {user.name}
          </span>
          <span className="text-[10px] text-neutral-400">
            {user.role === "admin"
              ? "ادمین / صاحب سایت"
              : user.role === "partner"
              ? "همکار سازمانی B2B"
              : "کاربر عادی"}
          </span>
        </div>

        <ChevronDown
          className={`h-3.5 w-3.5 text-neutral-400 transition-transform duration-200 ${
            isOpen ? "rotate-180 text-[var(--theme-primary)]" : ""
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 sm:left-auto sm:right-0 mt-2 w-72 origin-top-left rounded-2xl border border-[var(--theme-border-color)] bg-[#111113] p-2 shadow-2xl backdrop-blur-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-150">
          {/* User Info Header */}
          <div className="p-3 border-b border-neutral-800/80 mb-1">
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <span className="text-xs font-bold text-neutral-100">{user.name}</span>
              <RoleBadge role={user.role} size="sm" />
            </div>
            <div className="text-[11px] text-neutral-400 font-mono" dir="ltr">
              {user.phone}
            </div>
            {user.companyName && (
              <div className="text-[11px] text-sky-400 font-medium mt-1 truncate">
                {user.companyName}
              </div>
            )}
          </div>

          {/* Navigation Links based on role */}
          <div className="flex flex-col gap-0.5 py-1">
            {/* Customer Dashboard Link (Accessible to all) */}
            <Link
              href="/dashboard"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-neutral-300 hover:bg-neutral-800/60 hover:text-white transition-colors"
            >
              <LayoutDashboard className="h-4 w-4 text-orange-400" />
              <span>داشبورد کاربری</span>
            </Link>

            {/* Partner Portal (Partner or Admin) */}
            {(user.role === "partner" || user.role === "admin") && (
              <Link
                href="/partner"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-neutral-300 hover:bg-neutral-800/60 hover:text-white transition-colors"
              >
                <Building2 className="h-4 w-4 text-sky-400" />
                <span>پرتال سازمانی B2B</span>
              </Link>
            )}

            {/* Admin Control (Admin Only) */}
            {user.role === "admin" && (
              <>
                <Link
                  href="/admin"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-neutral-300 hover:bg-neutral-800/60 hover:text-white transition-colors"
                >
                  <ShieldCheck className="h-4 w-4 text-emerald-400" />
                  <span>پنل مدیریت کل (ادمین)</span>
                </Link>
                <Link
                  href="/admin/theme"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-neutral-300 hover:bg-neutral-800/60 hover:text-white transition-colors"
                >
                  <Palette className="h-4 w-4 text-purple-400" />
                  <span>شخصی‌سازی زنده تم</span>
                </Link>
              </>
            )}
          </div>

          {/* Quick Demo Switcher inside dropdown for review */}
          <div className="border-t border-neutral-800/80 pt-2 pb-1 my-1">
            <div className="flex items-center gap-1 px-3 pb-1.5 text-[10px] text-neutral-500 font-semibold">
              <Sparkles className="h-3 w-3 text-amber-400" />
              <span>سوئیچ سریع نقش (بررسی سناریوها):</span>
            </div>
            <div className="grid grid-cols-3 gap-1 px-1">
              <button
                type="button"
                onClick={() => {
                  loginWithDemoAccount("09121111111");
                  setIsOpen(false);
                }}
                className={`text-[10px] py-1 px-1.5 rounded-lg border text-center font-medium transition-colors cursor-pointer ${
                  user.role === "customer"
                    ? "bg-orange-500/20 border-orange-500/40 text-orange-300"
                    : "bg-neutral-800/40 border-neutral-800 text-neutral-400 hover:text-neutral-200"
                }`}
              >
                کاربر عادی
              </button>

              <button
                type="button"
                onClick={() => {
                  loginWithDemoAccount("09123333333");
                  setIsOpen(false);
                }}
                className={`text-[10px] py-1 px-1.5 rounded-lg border text-center font-medium transition-colors cursor-pointer ${
                  user.role === "partner"
                    ? "bg-sky-500/20 border-sky-500/40 text-sky-300"
                    : "bg-neutral-800/40 border-neutral-800 text-neutral-400 hover:text-neutral-200"
                }`}
              >
                پنل همکار
              </button>

              <button
                type="button"
                onClick={() => {
                  loginWithDemoAccount("09129999999");
                  setIsOpen(false);
                }}
                className={`text-[10px] py-1 px-1.5 rounded-lg border text-center font-medium transition-colors cursor-pointer ${
                  user.role === "admin"
                    ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300"
                    : "bg-neutral-800/40 border-neutral-800 text-neutral-400 hover:text-neutral-200"
                }`}
              >
                صاحب سایت
              </button>
            </div>
          </div>

          {/* Logout Action */}
          <div className="border-t border-neutral-800/80 pt-1">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                logout();
              }}
              disabled={isLoading}
              className="flex w-full items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
              <span>خروج از حساب</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
