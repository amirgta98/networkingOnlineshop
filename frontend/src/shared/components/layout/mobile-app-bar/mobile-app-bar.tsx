"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Package, ShoppingBag, PhoneCall, User, Menu } from "lucide-react";
import { useMobileAppBar } from "./mobile-app-bar-context";
import { useCart } from "@/features/cart";
import { useAuth } from "@/features/auth";
import { useNavigationDrawer } from "@/shared/components/layout/navigation-drawer";
import { toPersianDigits } from "@/shared/lib/utils";

export function MobileAppBar() {
  const { config } = useMobileAppBar();
  const { summary, toggleCart } = useCart();
  const { isAuthenticated, user, getRedirectUrlForRole } = useAuth();
  const { toggleDrawer, isOpen: isDrawerOpen } = useNavigationDrawer();
  const pathname = usePathname();

  const accountUrl = isAuthenticated ? getRedirectUrlForRole(user?.role) : "/login";
  const isAccountActive =
    pathname === "/login" ||
    pathname === "/dashboard" ||
    pathname?.startsWith("/partner") ||
    pathname?.startsWith("/admin");

  return (
    <nav
      id="mobile-app-bar"
      className="fixed bottom-0 inset-x-0 z-40 md:hidden border-t border-neutral-800/90 bg-[#0c0c0e]/95 backdrop-blur-xl shadow-2xl transition-all duration-300"
      style={{
        paddingBottom: "max(0.6rem, env(safe-area-inset-bottom, 0.6rem))",
      }}
      dir="rtl"
      aria-label="نوار ابزار موبایل"
    >
      <div className="mx-auto flex h-14 items-center justify-between px-3 gap-2">
        {config?.isCustom ? (
          /* ── Custom Mode: Dynamic Page Actions (e.g. Product Detail Page) ─ */
          config.customContent ? (
            config.customContent
          ) : (
            <div className="flex w-full items-center justify-between gap-2.5">
              {/* Separate Price Element (on the right in RTL) */}
              {config.priceElement && (
                <div className="shrink-0 flex items-center">
                  {config.priceElement}
                </div>
              )}

              {/* Primary Action: Add to Cart / Numeric Stepper Box taking flex-1 */}
              {config.primaryAction && (
                <div className="flex-1 min-w-0">
                  {config.primaryAction}
                </div>
              )}

              {/* Leading Action: Home Button (on the left in RTL) */}
              {config.leadingAction && (
                <div className="shrink-0 flex items-center">
                  {config.leadingAction}
                </div>
              )}

              {/* Trailing Action */}
              {config.trailingAction && (
                <div className="shrink-0 flex items-center">
                  {config.trailingAction}
                </div>
              )}
            </div>
          )
        ) : (
          /* ── Default Mode: Standard 5-Tab Navigation ───── */
          <div className="flex w-full items-center justify-around">
            {/* 1. Home */}
            <Link
              href="/"
              className={`flex flex-col items-center gap-1 text-[10px] font-medium transition-colors cursor-pointer py-1 px-2.5 rounded-xl active:scale-95 ${
                pathname === "/"
                  ? "text-orange-400 font-bold"
                  : "text-neutral-400 hover:text-neutral-200"
              }`}
            >
              <Home className="h-5 w-5" />
              <span>خانه</span>
            </Link>

            {/* 2. Products */}
            <Link
              href="/products"
              className={`flex flex-col items-center gap-1 text-[10px] font-medium transition-colors cursor-pointer py-1 px-2.5 rounded-xl active:scale-95 ${
                pathname?.startsWith("/products")
                  ? "text-orange-400 font-bold"
                  : "text-neutral-400 hover:text-neutral-200"
              }`}
            >
              <Package className="h-5 w-5" />
              <span>محصولات</span>
            </Link>

            {/* 3. Cart with Badge */}
            <button
              id="mobile-bottom-cart-tab"
              type="button"
              onClick={toggleCart}
              className="relative flex flex-col items-center gap-1 text-[10px] font-medium text-neutral-400 hover:text-neutral-200 transition-colors cursor-pointer py-1 px-2.5 rounded-xl active:scale-95"
              aria-label="مشاهده سبد خرید"
            >
              <div className="relative">
                <ShoppingBag className="h-5 w-5" />
                {summary.itemCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-orange-600 px-1 text-[9px] font-black text-white shadow-sm">
                    {toPersianDigits(summary.itemCount)}
                  </span>
                )}
              </div>
              <span>سبد خرید</span>
            </button>

            {/* 4. Account / Login */}
            <Link
              href={accountUrl}
              className={`flex flex-col items-center gap-1 text-[10px] font-medium transition-colors cursor-pointer py-1 px-2.5 rounded-xl active:scale-95 ${
                isAccountActive
                  ? "text-orange-400 font-bold"
                  : "text-neutral-400 hover:text-neutral-200"
              }`}
            >
              <User className="h-5 w-5" />
              <span>{isAuthenticated ? "حساب من" : "ورود"}</span>
            </Link>

            {/* 5. Navigation Drawer Menu */}
            <button
              id="mobile-bottom-menu-tab"
              type="button"
              onClick={toggleDrawer}
              className={`flex flex-col items-center gap-1 text-[10px] font-medium transition-colors cursor-pointer py-1 px-2.5 rounded-xl active:scale-95 ${
                isDrawerOpen
                  ? "text-orange-400 font-bold bg-orange-500/10"
                  : "text-neutral-400 hover:text-neutral-200"
              }`}
              aria-label="منوی ناوبری و صفحات کاربردی"
            >
              <Menu className="h-5 w-5" />
              <span>منو</span>
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
