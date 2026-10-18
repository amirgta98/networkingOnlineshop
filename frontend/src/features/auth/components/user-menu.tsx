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
  Sparkles,
  Layers,
  FolderTree,
} from "lucide-react";
import { useAuth } from "../context/auth-context";
import { RoleBadge } from "./role-badge";

export function UserMenu() {
  const router = useRouter();
  const { user, isAuthenticated, logout, isLoading, loginWithDemoAccount } = useAuth();
  const [isOpen, setIsOpen] = React.useState<boolean>(false);
  const [isMounted, setIsMounted] = React.useState<boolean>(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

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

  if (!isMounted || !isAuthenticated || !user) {
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
          className={`flex h-7 w-7 items-center justify-center rounded-lg text-xs font-black ring-1 overflow-hidden shrink-0 ${currentRingColor}`}
        >
          {user.avatarUrl ? (
            <img src={user.avatarUrl} alt={user.name} className="h-full w-full object-cover" />
          ) : (
            user.name.slice(0, 1)
          )}
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
            <div className="flex items-center gap-2.5 mb-2">
              <span
                className={`flex h-9 w-9 items-center justify-center rounded-xl text-sm font-black ring-1 overflow-hidden shrink-0 ${currentRingColor}`}
              >
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt={user.name} className="h-full w-full object-cover" />
                ) : (
                  user.name.slice(0, 1)
                )}
              </span>
              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-xs font-bold text-neutral-100 truncate">{user.name}</span>
                <span className="text-[10px] text-neutral-400 font-mono" dir="ltr">
                  {user.phone}
                </span>
              </div>
              <RoleBadge role={user.role} size="sm" />
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
                  href="/admin/products"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-neutral-300 hover:bg-neutral-800/60 hover:text-white transition-colors"
                >
                  <Layers className="h-4 w-4 text-amber-400" />
                  <span>کاتالوگ و محصولات</span>
                </Link>
                <Link
                  href="/admin/categories"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-neutral-300 hover:bg-neutral-800/60 hover:text-white transition-colors"
                >
                  <FolderTree className="h-4 w-4 text-sky-400" />
                  <span>دسته‌بندی تجهیزات</span>
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
