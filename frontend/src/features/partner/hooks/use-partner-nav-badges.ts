"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { toPersianDigits } from "@/shared/lib/utils";
import { apiClient } from "@/shared/lib/api-client";
import type { AuthUser } from "@/features/auth";
import type { PartnerPageDefinition } from "../types/partner.types";

export interface PartnerNavStats {
  activeOrdersCount: number;
  activeRfqsCount: number;
  creditFreeMillions: number;
  activeProjectsCount: number;
  agentsCount: number;
  activeTicketsCount: number;
  activeWarrantyCount: number;
}

export function usePartnerNavBadges(
  basePages: PartnerPageDefinition[],
  user: AuthUser | null
): {
  pages: PartnerPageDefinition[];
  stats: PartnerNavStats;
  refreshStats: () => void;
} {
  const pathname = usePathname();

  const [stats, setStats] = React.useState<PartnerNavStats>({
    activeOrdersCount: 0,
    activeRfqsCount: 0,
    creditFreeMillions: 0,
    activeProjectsCount: 0,
    agentsCount: 0,
    activeTicketsCount: 0,
    activeWarrantyCount: 0,
  });

  const loadStats = React.useCallback(() => {
    // 1. Orders
    let activeOrdersCount = 0;
    try {
      const stored = localStorage.getItem("velox_partner_orders");
      const list = stored ? JSON.parse(stored) : [];
      if (Array.isArray(list)) {
        activeOrdersCount = list.filter(
          (o: any) => o.status !== "delivered" && o.status !== "cancelled"
        ).length;
      }
    } catch {
      activeOrdersCount = 0;
    }

    // 2. RFQs
    let activeRfqsCount = 0;
    try {
      const stored = localStorage.getItem("velox_partner_rfqs");
      const list = stored ? JSON.parse(stored) : [];
      if (Array.isArray(list)) {
        activeRfqsCount = list.filter(
          (r: any) => r.status === "quote_issued" || r.status === "under_review" || r.status === "approved"
        ).length;
      }
    } catch {
      activeRfqsCount = 0;
    }

    // 3. Projects
    let activeProjectsCount = 0;
    try {
      const stored = localStorage.getItem("velox_partner_projects");
      const list = stored ? JSON.parse(stored) : [];
      if (Array.isArray(list)) activeProjectsCount = list.length;
    } catch {
      activeProjectsCount = 0;
    }

    // 4. Agents
    let agentsCount = 0;
    try {
      const stored = localStorage.getItem("velox_partner_agents");
      const list = stored ? JSON.parse(stored) : [];
      if (Array.isArray(list)) agentsCount = list.length;
    } catch {
      agentsCount = 0;
    }

    // 5. Tickets
    let activeTicketsCount = 0;
    try {
      const stored = localStorage.getItem("velox_partner_tickets");
      const list = stored ? JSON.parse(stored) : [];
      if (Array.isArray(list)) {
        activeTicketsCount = list.filter(
          (t: any) => t.status !== "closed" && t.status !== "resolved"
        ).length;
      }
    } catch {
      activeTicketsCount = 0;
    }

    // 6. Warranty
    let activeWarrantyCount = 0;
    try {
      const stored = localStorage.getItem("velox_partner_warranty");
      const list = stored ? JSON.parse(stored) : [];
      if (Array.isArray(list)) {
        activeWarrantyCount = list.filter(
          (w: any) => w.status !== "repaired" && w.status !== "shipped_to_client"
        ).length;
      }
    } catch {
      activeWarrantyCount = 0;
    }

    // 7. Credit free balance
    const credit = (user as any)?.creditBalance ?? 0;
    const creditFreeMillions = Math.round(credit / 1_000_000);

    setStats({
      activeOrdersCount,
      activeRfqsCount,
      creditFreeMillions,
      activeProjectsCount,
      agentsCount,
      activeTicketsCount,
      activeWarrantyCount,
    });
  }, [user]);

  React.useEffect(() => {
    loadStats();

    let isMounted = true;
    async function fetchBackendStats() {
      try {
        const [ordersRaw, rfqsRaw, projectsRaw] = await Promise.allSettled([
          apiClient.get<any[]>("/orders/partner", { timeout: 6000 }),
          apiClient.get<any[]>("/rfq/my", { timeout: 6000 }),
          apiClient.get<any[]>("/projects/my", { timeout: 6000 }),
        ]);

        if (!isMounted) return;

        let activeOrders = stats.activeOrdersCount;
        if (ordersRaw.status === "fulfilled" && Array.isArray(ordersRaw.value)) {
          activeOrders = ordersRaw.value.filter((o: any) => {
            const st = (o.status || "").toLowerCase();
            return st !== "delivered" && st !== "cancelled";
          }).length;
        }

        let activeRfqs = stats.activeRfqsCount;
        if (rfqsRaw.status === "fulfilled" && Array.isArray(rfqsRaw.value)) {
          activeRfqs = rfqsRaw.value.filter((r: any) => {
            const st = (r.status || "").toLowerCase();
            return st !== "cancelled" && st !== "rejected" && st !== "expired";
          }).length;
        }

        let activeProjects = stats.activeProjectsCount;
        if (projectsRaw.status === "fulfilled" && Array.isArray(projectsRaw.value)) {
          activeProjects = projectsRaw.value.length;
        }

        setStats((prev) => ({
          ...prev,
          activeOrdersCount: activeOrders,
          activeRfqsCount: activeRfqs,
          activeProjectsCount: activeProjects,
        }));
      } catch {
        // fallback silently
      }
    }
    void fetchBackendStats();

    const handleStorageChange = () => {
      loadStats();
      void fetchBackendStats();
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("partner-stats-updated", handleStorageChange);

    return () => {
      isMounted = false;
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("partner-stats-updated", handleStorageChange);
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
            badgeVariant: "orange" as const,
          };
        }
        return { ...page, badge: undefined, badgeVariant: undefined };
      }

      // 2. RFQ
      if (page.id === "rfq") {
        if (stats.activeRfqsCount > 0) {
          return {
            ...page,
            badge: `${toPersianDigits(stats.activeRfqsCount)} پیش‌فاکتور`,
            badgeVariant: "info" as const,
          };
        }
        return { ...page, badge: undefined, badgeVariant: undefined };
      }

      // 3. Credit
      if (page.id === "credit") {
        return {
          ...page,
          badge: `${toPersianDigits(stats.creditFreeMillions)} م.ت آزاد`,
          badgeVariant: "success" as const,
        };
      }

      // 4. Projects
      if (page.id === "projects") {
        if (stats.activeProjectsCount > 0) {
          return {
            ...page,
            badge: `${toPersianDigits(stats.activeProjectsCount)} سایت فعال`,
            badgeVariant: "default" as const,
          };
        }
        return { ...page, badge: undefined, badgeVariant: undefined };
      }

      // 5. Agents
      if (page.id === "agents") {
        if (stats.agentsCount > 0) {
          return {
            ...page,
            badge: `${toPersianDigits(stats.agentsCount)} نماینده`,
            badgeVariant: "info" as const,
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
            badgeVariant: "purple" as const,
          };
        }
        return {
          ...page,
          badge: "اکانت منیجر VIP",
          badgeVariant: "purple" as const,
        };
      }

      // 7. Warranty
      if (page.id === "warranty") {
        if (stats.activeWarrantyCount > 0) {
          return {
            ...page,
            badge: `${toPersianDigits(stats.activeWarrantyCount)} تعویض در جریان`,
            badgeVariant: "success" as const,
          };
        }
        return {
          ...page,
          badge: "SLA ۲۴ ساعته",
          badgeVariant: "success" as const,
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
