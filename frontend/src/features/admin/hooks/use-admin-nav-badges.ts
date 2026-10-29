"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { toPersianDigits } from "@/shared/lib/utils";
import type { AdminPageDefinition } from "../types/admin.types";
import { adminOrdersApi } from "../api/admin-orders-api";
import { adminSupportApi } from "../api/admin-support-api";
import { categoriesApi } from "../api/categories-api";
import { productsApi } from "../api/products-api";
import { careersApi } from "@/features/careers/api/careers-api";
import { internetApi } from "@/features/internet/api/internet-api";

export interface AdminNavStats {
  pendingOrdersCount: number;
  openRfqsCount: number;
  pendingPartnersCount: number;
  lowStockProductsCount: number;
  categoriesCount: number;
  activeTicketsCount: number;
  warrantyQueueCount: number;
  careerApplicationsCount: number;
  pendingInternetOrdersCount?: number;
}

export function useAdminNavBadges(basePages: AdminPageDefinition[]): {
  pages: AdminPageDefinition[];
  stats: AdminNavStats;
  refreshStats: () => void;
} {
  const pathname = usePathname();

  const [stats, setStats] = React.useState<AdminNavStats>({
    pendingOrdersCount: 0,
    openRfqsCount: 0,
    pendingPartnersCount: 0,
    lowStockProductsCount: 0,
    categoriesCount: 0,
    activeTicketsCount: 0,
    warrantyQueueCount: 0,
    careerApplicationsCount: 0,
  });

  const loadStats = React.useCallback(async () => {
    // 1. Orders from API
    let pendingOrdersCount = 0;
    try {
      const orders = await adminOrdersApi.getOrders();
      if (Array.isArray(orders)) {
        pendingOrdersCount = orders.filter((o) => o.status === "pending_financial").length;
      }
    } catch {
      // ignore
    }

    // 2. RFQ
    let openRfqsCount = 0;
    try {
      const stored = localStorage.getItem("velox_admin_rfqs_v2");
      const list = stored ? JSON.parse(stored) : [];
      if (Array.isArray(list)) {
        openRfqsCount = list.filter(
          (r: any) => r.status === "pending_quote" || r.status === "under_review"
        ).length;
      }
    } catch {
      openRfqsCount = 0;
    }

    // 3. Partners
    let pendingPartnersCount = 0;
    try {
      const stored = localStorage.getItem("velox_admin_partners_v2");
      const list = stored ? JSON.parse(stored) : [];
      if (Array.isArray(list)) {
        pendingPartnersCount = list.filter((p: any) => p.status === "pending_review").length;
      }
    } catch {
      pendingPartnersCount = 0;
    }

    // 4. Products low stock
    let lowStockProductsCount = 0;
    try {
      const stored = localStorage.getItem("velox_admin_products_v1");
      if (stored) {
        const list = JSON.parse(stored);
        if (Array.isArray(list)) {
          lowStockProductsCount = list.filter(
            (p: any) => (typeof p.stock === "number" && p.stock <= 5) || p.status === "low_stock" || p.status === "out_of_stock"
          ).length;
        }
      } else {
        const res = await productsApi.getProducts({ page: 1, limit: 100 });
        if (res && Array.isArray(res.products)) {
          lowStockProductsCount = res.products.filter(
            (p) => (typeof p.stock === "number" && p.stock <= 5) || (p.status as string) === "low_stock" || p.status === "out_of_stock"
          ).length;
        }
      }
    } catch {
      // ignore
    }

    // 5. Categories count
    let categoriesCount = 0;
    try {
      const cats = await categoriesApi.getCategories();
      if (Array.isArray(cats)) {
        categoriesCount = cats.length;
      }
    } catch {
      // ignore
    }

    // 6. Support tickets
    let activeTicketsCount = 0;
    try {
      const res = await adminSupportApi.getAllTickets({ page: 1, pageSize: 100 });
      if (res && Array.isArray(res.tickets)) {
        activeTicketsCount = res.tickets.filter(
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

    // 7. Warranty queue
    let warrantyQueueCount = 0;
    try {
      const stored = localStorage.getItem("velox_admin_warranty");
      if (stored) {
        const list = JSON.parse(stored);
        if (Array.isArray(list)) warrantyQueueCount = list.length;
      }
    } catch {
      // ignore
    }

    // 8. Careers applications from API
    let careerApplicationsCount = 0;
    try {
      const cStats = await careersApi.getAdminStats();
      if (cStats && typeof cStats.totalApplications === "number") {
        careerApplicationsCount = cStats.totalApplications;
      }
    } catch {
      careerApplicationsCount = 0;
    }

    // 9. Internet orders
    let pendingInternetOrdersCount = 0;
    try {
      const iOrders = await internetApi.getAdminOrders({ status: "PENDING", limit: 50 });
      if (iOrders && Array.isArray(iOrders.orders)) {
        pendingInternetOrdersCount = iOrders.orders.length;
      }
    } catch {
      pendingInternetOrdersCount = 0;
    }

    setStats({
      pendingOrdersCount,
      openRfqsCount,
      pendingPartnersCount,
      lowStockProductsCount,
      categoriesCount,
      activeTicketsCount,
      warrantyQueueCount,
      careerApplicationsCount,
      pendingInternetOrdersCount,
    });
  }, []);

  React.useEffect(() => {
    loadStats();

    const handleStorageChange = () => {
      loadStats();
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("admin-stats-updated", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("admin-stats-updated", handleStorageChange);
    };
  }, [loadStats, pathname]);

  const dynamicPages = React.useMemo(() => {
    return basePages.map((page) => {
      // 1. Orders
      if (page.id === "orders") {
        if (stats.pendingOrdersCount > 0) {
          return {
            ...page,
            badge: `${toPersianDigits(stats.pendingOrdersCount)} سفارش جدید`,
            badgeVariant: "warning" as const,
          };
        }
        return { ...page, badge: undefined, badgeVariant: undefined };
      }

      // 2. RFQ
      if (page.id === "rfq") {
        if (stats.openRfqsCount > 0) {
          return {
            ...page,
            badge: `${toPersianDigits(stats.openRfqsCount)} استعلام باز`,
            badgeVariant: "purple" as const,
          };
        }
        return { ...page, badge: undefined, badgeVariant: undefined };
      }

      // 3. Partners
      if (page.id === "partners") {
        if (stats.pendingPartnersCount > 0) {
          return {
            ...page,
            badge: `${toPersianDigits(stats.pendingPartnersCount)} متقاضی جدید`,
            badgeVariant: "sky" as any,
          };
        }
        return { ...page, badge: undefined, badgeVariant: undefined };
      }

      // 4. Products
      if (page.id === "products") {
        if (stats.lowStockProductsCount > 0) {
          return {
            ...page,
            badge: `${toPersianDigits(stats.lowStockProductsCount)} کمبود موجودی`,
            badgeVariant: "warning" as const,
          };
        }
        return { ...page, badge: undefined, badgeVariant: undefined };
      }

      // 5. Categories
      if (page.id === "categories") {
        if (stats.categoriesCount > 0) {
          return {
            ...page,
            badge: `${toPersianDigits(stats.categoriesCount)} گروه کالا`,
            badgeVariant: "default" as const,
          };
        }
        return { ...page, badge: undefined, badgeVariant: undefined };
      }

      // 6. Support
      if (page.id === "support") {
        if (stats.activeTicketsCount > 0) {
          return {
            ...page,
            badge: `${toPersianDigits(stats.activeTicketsCount)} تیکت فعال`,
            badgeVariant: "warning" as const,
          };
        }
        return { ...page, badge: undefined, badgeVariant: undefined };
      }

      // 7. Warranty
      if (page.id === "warranty") {
        if (stats.warrantyQueueCount > 0) {
          return {
            ...page,
            badge: `${toPersianDigits(stats.warrantyQueueCount)} قطعه در صف`,
            badgeVariant: "success" as const,
          };
        }
        return { ...page, badge: undefined, badgeVariant: undefined };
      }

      // 8. Careers
      if (page.id === "careers") {
        if (stats.careerApplicationsCount > 0) {
          return {
            ...page,
            badge: `${toPersianDigits(stats.careerApplicationsCount)} رزومه جدید`,
            badgeVariant: "emerald" as any,
          };
        }
        return {
          ...page,
          badge: "استخدام",
          badgeVariant: "emerald" as any,
        };
      }

      // 9. Internet
      if (page.id === "internet") {
        if (stats.pendingInternetOrdersCount && stats.pendingInternetOrdersCount > 0) {
          return {
            ...page,
            badge: `${toPersianDigits(stats.pendingInternetOrdersCount)} سفارش`,
            badgeVariant: "warning" as const,
          };
        }
        return page;
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
