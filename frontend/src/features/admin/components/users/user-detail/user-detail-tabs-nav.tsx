"use client";

import * as React from "react";
import {
  User,
  MapPin,
  ShoppingCart,
  ShoppingBag,
  Receipt,
  Wallet,
  Heart,
  FileSpreadsheet,
  ShieldCheck,
  Crown,
  Monitor,
} from "lucide-react";

export type UserDetailTabId =
  | "account"
  | "addresses"
  | "cart"
  | "orders"
  | "invoices"
  | "wallet"
  | "favorites"
  | "rfq"
  | "authenticity"
  | "loyalty"
  | "sessions";

export interface TabConfig {
  id: UserDetailTabId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
}

export const USER_DETAIL_TABS: TabConfig[] = [
  { id: "account", label: "مشخصات حساب", icon: User },
  { id: "addresses", label: "آدرس‌های کاربر", icon: MapPin },
  { id: "cart", label: "سبد خرید فعلی", icon: ShoppingCart },
  { id: "orders", label: "سفارش‌ها", icon: ShoppingBag },
  { id: "invoices", label: "فاکتورهای صادر شده", icon: Receipt },
  { id: "wallet", label: "کیف پول", icon: Wallet },
  { id: "favorites", label: "علاقه‌مندی‌ها", icon: Heart },
  { id: "rfq", label: "استعلام‌های قیمت", icon: FileSpreadsheet },
  { id: "authenticity", label: "استعلام اصالت", icon: ShieldCheck },
  { id: "loyalty", label: "باشگاه مشتریان", icon: Crown },
  { id: "sessions", label: "نشست‌ها و لاگ ورود", icon: Monitor },
];

interface UserDetailTabsNavProps {
  activeTab: UserDetailTabId;
  onTabChange: (tabId: UserDetailTabId) => void;
  ordersCount?: number;
}

export function UserDetailTabsNav({
  activeTab,
  onTabChange,
  ordersCount,
}: UserDetailTabsNavProps) {
  return (
    <div className="w-full border-b border-neutral-800 bg-neutral-900/40 rounded-2xl p-1.5" dir="rtl">
      <div className="flex items-center gap-1 overflow-x-auto no-scrollbar scroll-smooth">
        {USER_DETAIL_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 shrink-0 select-none ${
                isActive
                  ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-sm shadow-emerald-950/20"
                  : "text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/60 border border-transparent"
              }`}
            >
              <Icon className={`h-4 w-4 ${isActive ? "text-emerald-400" : "text-neutral-500"}`} />
              <span>{tab.label}</span>
              {tab.id === "orders" && typeof ordersCount === "number" && ordersCount > 0 && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    isActive
                      ? "bg-emerald-500/30 text-emerald-300"
                      : "bg-neutral-800 text-neutral-400"
                  }`}
                >
                  {ordersCount}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
