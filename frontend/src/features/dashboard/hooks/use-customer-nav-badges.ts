"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { formatPrice, toPersianDigits } from "@/shared/lib/utils";
import { supportApi } from "../api/support-api";
import { addressesApi } from "../api/addresses-api";
import { apiClient } from "@/shared/lib/api-client";
import type { DashboardPageDefinition } from "../types/dashboard.types";

export interface CustomerNavStats {
  ordersCount: number;
  activeOrdersCount: number;
  walletBalance: number;
  wishlistCount: number;
  addressesCount: number;
  activeTicketsCount: number;
  totalTicketsCount: number;
  clubPoints: number;
  activeRfqsCount: number;
}

export function useCustomerNavBadges(basePages: DashboardPageDefinition[]): {
  pages: DashboardPageDefinition[];
  stats: CustomerNavStats;
  refreshStats: () => void;
} {
  const pathname = usePathname();

  const [stats, setStats] = React.useState<CustomerNavStats>({
    ordersCount: 0,
    activeOrdersCount: 0,
    walletBalance: 0,
    wishlistCount: 0,
    addressesCount: 0,
    activeTicketsCount: 0,
    totalTicketsCount: 0,
    clubPoints: 0,
    activeRfqsCount: 0,
  });

  const loadStats = React.useCallback(async () => {
    // 1. Wishlist from localStorage
    let wishlistCount = 0;
    try {
      const stored = localStorage.getItem("velox_dashboard_wishlist_v1");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) wishlistCount = parsed.length;
      }
    } catch {
      wishlistCount = 0;
    }

    // 2. Wallet balance from localStorage
    let walletBalance = 0;
    try {
      const stored = localStorage.getItem("velox_dashboard_wallet_bal_v2");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && typeof parsed.totalUsable === "number") {
          walletBalance = parsed.totalUsable;
        } else if (parsed && typeof parsed.cashBalance === "number") {
          walletBalance = parsed.cashBalance + (parsed.giftOrCashbackBalance || 0);
        }
      }
    } catch {
      walletBalance = 0;
    }

    // 3. Club points from localStorage
    let clubPoints = 0;
    try {
      const stored = localStorage.getItem("velox_dashboard_club_v2");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && typeof parsed.currentPoints === "number") {
          clubPoints = parsed.currentPoints;
        }
      }
    } catch {
      clubPoints = 0;
    }

    // 4. RFQ from localStorage
    let activeRfqsCount = 0;
    try {
      const stored = localStorage.getItem("velox_dashboard_rfqs_v2");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          activeRfqsCount = parsed.filter(
            (r: any) => r.status === "under_review" || r.status === "quote_ready"
          ).length;
        }
      }
    } catch {
      activeRfqsCount = 0;
    }

    // 5. Orders from API
    let ordersCount = 0;
    let activeOrdersCount = 0;
    try {
      const orders = await apiClient.get<any[]>("/orders/my");
      if (Array.isArray(orders)) {
        ordersCount = orders.length;
        activeOrdersCount = orders.filter(
          (o) => o.status !== "delivered" && o.status !== "cancelled"
        ).length;
      }
    } catch {
      // ignore
    }

    // 6. Addresses from API
    let addressesCount = 0;
    try {
      const addrs = await addressesApi.getAddresses();
      if (Array.isArray(addrs)) {
        addressesCount = addrs.length;
      }
    } catch {
      // ignore
    }

    // 7. Support tickets from API
    let activeTicketsCount = 0;
    let totalTicketsCount = 0;
    try {
      const tickets = await supportApi.getMyTickets();
      if (Array.isArray(tickets)) {
        totalTicketsCount = tickets.length;
        activeTicketsCount = tickets.filter(
          (t) =>
            t.status === "OPEN" ||
            t.status === "WAITING_USER" ||
            t.status === "open" ||
            t.status === "waiting_user"
        ).length;
      }
    } catch {
      // ignore
    }

    setStats({
      ordersCount,
      activeOrdersCount,
      walletBalance,
      wishlistCount,
      addressesCount,
      activeTicketsCount,
      totalTicketsCount,
      clubPoints,
      activeRfqsCount,
    });
  }, []);

  React.useEffect(() => {
    loadStats();

    const handleStorageChange = () => {
      loadStats();
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("dashboard-stats-updated", handleStorageChange);
    window.addEventListener("velox:wishlist:updated", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("dashboard-stats-updated", handleStorageChange);
      window.removeEventListener("velox:wishlist:updated", handleStorageChange);
    };
  }, [loadStats, pathname]);

  const dynamicPages = React.useMemo(() => {
    return basePages.map((page) => {
      // 1. Orders
      if (page.id === "orders") {
        if (stats.activeOrdersCount > 0) {
          return {
            ...page,
            badge: `${toPersianDigits(stats.activeOrdersCount)} سفارش فعال`,
            badgeVariant: "info" as const,
          };
        }
        if (stats.ordersCount > 0) {
          return {
            ...page,
            badge: `${toPersianDigits(stats.ordersCount)} سفارش`,
            badgeVariant: "default" as const,
          };
        }
        return { ...page, badge: undefined, badgeVariant: undefined };
      }

      // 2. Wallet
      if (page.id === "wallet") {
        return {
          ...page,
          badge: `موجودی: ${formatPrice(stats.walletBalance)} تومان`,
          badgeVariant: stats.walletBalance > 0 ? ("success" as const) : ("default" as const),
        };
      }

      // 3. Wishlist
      if (page.id === "wishlist") {
        if (stats.wishlistCount > 0) {
          return {
            ...page,
            badge: `${toPersianDigits(stats.wishlistCount)} قلم کالا`,
            badgeVariant: "purple" as const,
          };
        }
        return { ...page, badge: undefined, badgeVariant: undefined };
      }

      // 4. Addresses
      if (page.id === "addresses") {
        if (stats.addressesCount > 0) {
          return {
            ...page,
            badge: `${toPersianDigits(stats.addressesCount)} آدرس`,
            badgeVariant: "default" as const,
          };
        }
        return { ...page, badge: undefined, badgeVariant: undefined };
      }

      // 5. Support tickets
      if (page.id === "support") {
        if (stats.activeTicketsCount > 0) {
          return {
            ...page,
            badge: `${toPersianDigits(stats.activeTicketsCount)} تیکت در جریان`,
            badgeVariant: "warning" as const,
          };
        }
        if (stats.totalTicketsCount > 0) {
          return {
            ...page,
            badge: `${toPersianDigits(stats.totalTicketsCount)} تیکت`,
            badgeVariant: "default" as const,
          };
        }
        return { ...page, badge: undefined, badgeVariant: undefined };
      }

      // 6. Club points
      if (page.id === "club") {
        if (stats.clubPoints > 0) {
          return {
            ...page,
            badge: `${toPersianDigits(stats.clubPoints)} امتیاز`,
            badgeVariant: "info" as const,
          };
        }
        return { ...page, badge: undefined, badgeVariant: undefined };
      }

      // 7. RFQ
      if (page.id === "rfq") {
        if (stats.activeRfqsCount > 0) {
          return {
            ...page,
            badge: `${toPersianDigits(stats.activeRfqsCount)} استعلام فعال`,
            badgeVariant: "purple" as const,
          };
        }
        return {
          ...page,
          badge: "ویژه پروژه‌ها",
          badgeVariant: "purple" as const,
        };
      }

      return page;
    });
  }, [basePages, stats]);

  return {
    pages: dynamicPages,
    stats,
    refreshStats: loadStats,
  };
}
